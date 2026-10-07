"""
AWS EC2 Self-Service Portal — Lambda Handler
Routes HTTP API v2 events to EC2 operations via boto3.
Logs all activity to CloudWatch; returns JSON with CORS headers.
"""
from __future__ import annotations

import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Any

import boto3
from botocore.exceptions import ClientError, ParamValidationError

from utils import (
    build_tags,
    error_response,
    get_tag_value,
    parse_instance,
    success_response,
)
from validators import validate_create_instance, validate_instance_id

# ── Logger ────────────────────────────────────────────────────────────────
logger = logging.getLogger()
logger.setLevel(os.environ.get("LOG_LEVEL", "INFO"))

# ── AWS clients (module-level — re-used across warm invocations) ──────────
_AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
ec2 = boto3.client("ec2", region_name=_AWS_REGION)
iam = boto3.client("iam", region_name=_AWS_REGION)


# ── Entry point ───────────────────────────────────────────────────────────

def lambda_handler(event: dict, context: Any) -> dict:
    """Route the API Gateway HTTP API v2 event to the correct handler."""
    start_ms = time.monotonic() * 1_000

    route_key  = event.get("routeKey", "")
    request_id = event.get("requestContext", {}).get("requestId", "")

    logger.info(
        json.dumps({
            "msg": "request_received",
            "routeKey": route_key,
            "requestId": request_id,
        })
    )

    try:
        if route_key == "GET /instances":
            result = _list_instances()

        elif route_key == "GET /instances/health":
            result = _get_instance_health()

        elif route_key == "POST /instances":
            body = _parse_body(event)
            result = _create_instance(body)

        elif route_key == "POST /instances/start":
            body = _parse_body(event)
            result = _start_instance(body)

        elif route_key == "POST /instances/stop":
            body = _parse_body(event)
            result = _stop_instance(body)

        elif route_key == "POST /instances/reboot":
            body = _parse_body(event)
            result = _reboot_instance(body)

        elif route_key == "DELETE /instances/{instanceId}":
            instance_id = (event.get("pathParameters") or {}).get("instanceId", "")
            result = _terminate_instance(instance_id)

        elif route_key == "GET /resources":
            result = _get_resources()

        elif route_key == "GET /services/{service}":
            service_name = (event.get("pathParameters") or {}).get("service", "")
            from services_handler import handle as _svc_handle
            result = _svc_handle(service_name)

        elif route_key.startswith("OPTIONS"):
            result = success_response({})

        else:
            result = error_response(f"Route not found: {route_key}", status_code=404)

    except Exception:
        logger.exception("Unhandled exception for route %s", route_key)
        result = error_response("Internal server error", status_code=500)

    elapsed = time.monotonic() * 1_000 - start_ms
    logger.info(
        json.dumps({
            "msg": "request_completed",
            "routeKey": route_key,
            "statusCode": result["statusCode"],
            "elapsedMs": round(elapsed, 2),
        })
    )
    return result


# ── Body parser ───────────────────────────────────────────────────────────

def _parse_body(event: dict) -> dict:
    raw = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        import base64
        raw = base64.b64decode(raw).decode("utf-8")
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


# ── Handlers ──────────────────────────────────────────────────────────────

def _list_instances() -> dict:
    """GET /instances — return all non-terminated EC2 instances."""
    logger.info("Listing EC2 instances")
    try:
        paginator = ec2.get_paginator("describe_instances")
        pages = paginator.paginate(
            Filters=[
                {
                    "Name": "instance-state-name",
                    "Values": ["pending", "running", "stopping", "stopped", "shutting-down"],
                }
            ]
        )
        instances: list[dict] = []
        for page in pages:
            for reservation in page["Reservations"]:
                for inst in reservation["Instances"]:
                    instances.append(parse_instance(inst))

        logger.info("Found %d instances", len(instances))
        return success_response({"instances": instances, "count": len(instances)})

    except ClientError as exc:
        code = exc.response["Error"]["Code"]
        msg  = exc.response["Error"]["Message"]
        logger.error("ClientError [%s] listing instances: %s", code, msg)
        return error_response(msg, status_code=502)


def _get_instance_health() -> dict:
    """GET /instances/health — EC2 System + Instance status checks.
    Polled by the frontend every 60s to match the real ~1-minute cadence
    these checks refresh on. Stopped instances report 'not-applicable' for
    both checks — that's expected AWS behavior, not a failure."""
    logger.info("Fetching EC2 instance status checks")
    try:
        paginator = ec2.get_paginator("describe_instance_status")
        pages = paginator.paginate(IncludeAllInstances=True)

        checked_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        items: list[dict] = []
        for page in pages:
            for s in page.get("InstanceStatuses", []):
                system_status   = s.get("SystemStatus", {}).get("Status", "not-applicable")
                instance_status = s.get("InstanceStatus", {}).get("Status", "not-applicable")
                state = s.get("InstanceState", {}).get("Name", "unknown")

                if state != "running":
                    health = "stopped"
                elif system_status == "ok" and instance_status == "ok":
                    health = "healthy"
                elif "impaired" in (system_status, instance_status):
                    health = "unhealthy"
                else:
                    health = "degraded"

                items.append({
                    "instance_id":      s.get("InstanceId", ""),
                    "state":            state,
                    "system_status":    system_status,
                    "instance_status":  instance_status,
                    "health":           health,
                    "checked_at":       checked_at,
                })

        return success_response({"items": items, "count": len(items), "checked_at": checked_at})

    except ClientError as exc:
        code = exc.response["Error"]["Code"]
        msg  = exc.response["Error"]["Message"]
        logger.error("ClientError [%s] fetching instance status: %s", code, msg)
        return error_response(msg, status_code=502)


def _create_instance(body: dict) -> dict:
    """POST /instances — validate, launch, and tag a new EC2 instance."""
    logger.info("Creating instance — body: %s", json.dumps(body))

    errors = validate_create_instance(body)
    if errors:
        logger.warning("Validation failed: %s", errors)
        return error_response("Validation failed", status_code=400, errors=errors)

    ami_id = body["ami_id"]

    # Resolve root device name from the AMI
    try:
        ami_resp = ec2.describe_images(ImageIds=[ami_id])
        images = ami_resp.get("Images", [])
        if not images:
            return error_response(f"AMI {ami_id} not found", status_code=400)
        root_device = images[0].get("RootDeviceName", "/dev/xvda")
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("Failed to describe AMI %s: %s", ami_id, msg)
        return error_response(msg, status_code=502)

    tag_list = build_tags(body["instance_name"], body.get("tags") or {})

    run_params: dict[str, Any] = {
        "ImageId":      ami_id,
        "InstanceType": body["instance_type"],
        "MinCount": 1,
        "MaxCount": 1,
        "NetworkInterfaces": [
            {
                "DeviceIndex": 0,
                "SubnetId":    body["subnet_id"],
                "Groups":      [body["security_group_id"]],
                "AssociatePublicIpAddress": bool(body.get("enable_public_ip", False)),
            }
        ],
        "BlockDeviceMappings": [
            {
                "DeviceName": root_device,
                "Ebs": {
                    "VolumeSize":          int(body.get("root_volume_size", 20)),
                    "VolumeType":          body.get("root_volume_type", "gp3"),
                    "DeleteOnTermination": True,
                    "Encrypted":           True,
                },
            }
        ],
        "TagSpecifications": [
            {"ResourceType": "instance", "Tags": tag_list},
            {"ResourceType": "volume",   "Tags": tag_list},
        ],
        "Monitoring": {"Enabled": bool(body.get("enable_detailed_monitoring", False))},
    }

    if body.get("key_pair"):
        run_params["KeyName"] = body["key_pair"]

    if body.get("iam_instance_profile"):
        run_params["IamInstanceProfile"] = {"Name": body["iam_instance_profile"]}

    if body.get("availability_zone"):
        run_params["Placement"] = {"AvailabilityZone": body["availability_zone"]}

    try:
        resp     = ec2.run_instances(**run_params)
        inst     = resp["Instances"][0]
        inst_id  = inst["InstanceId"]
        logger.info("Launched instance %s", inst_id)
        return success_response(
            {
                "message": f"Instance {inst_id} launched successfully",
                "instance": parse_instance(inst),
            },
            status_code=201,
        )
    except ClientError as exc:
        code = exc.response["Error"]["Code"]
        msg  = exc.response["Error"]["Message"]
        logger.error("ClientError [%s] creating instance: %s", code, msg)
        return error_response(msg, status_code=502)
    except ParamValidationError as exc:
        logger.error("Parameter validation error: %s", str(exc))
        return error_response(str(exc), status_code=400)


def _start_instance(body: dict) -> dict:
    """POST /instances/start"""
    instance_id = str(body.get("instance_id", "")).strip()
    err = validate_instance_id(instance_id)
    if err:
        return error_response(err, status_code=400)
    logger.info("Starting %s", instance_id)
    try:
        resp  = ec2.start_instances(InstanceIds=[instance_id])
        state = resp["StartingInstances"][0]["CurrentState"]["Name"]
        return success_response({"message": f"Instance {instance_id} is {state}", "state": state})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("ClientError starting %s: %s", instance_id, msg)
        return error_response(msg, status_code=502)


def _stop_instance(body: dict) -> dict:
    """POST /instances/stop"""
    instance_id = str(body.get("instance_id", "")).strip()
    err = validate_instance_id(instance_id)
    if err:
        return error_response(err, status_code=400)
    logger.info("Stopping %s", instance_id)
    try:
        resp  = ec2.stop_instances(InstanceIds=[instance_id])
        state = resp["StoppingInstances"][0]["CurrentState"]["Name"]
        return success_response({"message": f"Instance {instance_id} is {state}", "state": state})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("ClientError stopping %s: %s", instance_id, msg)
        return error_response(msg, status_code=502)


def _reboot_instance(body: dict) -> dict:
    """POST /instances/reboot"""
    instance_id = str(body.get("instance_id", "")).strip()
    err = validate_instance_id(instance_id)
    if err:
        return error_response(err, status_code=400)
    logger.info("Rebooting %s", instance_id)
    try:
        ec2.reboot_instances(InstanceIds=[instance_id])
        return success_response({"message": f"Reboot initiated for {instance_id}"})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("ClientError rebooting %s: %s", instance_id, msg)
        return error_response(msg, status_code=502)


def _terminate_instance(instance_id: str) -> dict:
    """DELETE /instances/{instanceId}"""
    err = validate_instance_id(instance_id)
    if err:
        return error_response(err, status_code=400)
    logger.info("Terminating %s", instance_id)
    try:
        resp  = ec2.terminate_instances(InstanceIds=[instance_id])
        state = resp["TerminatingInstances"][0]["CurrentState"]["Name"]
        return success_response({"message": f"Instance {instance_id} is {state}", "state": state})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("ClientError terminating %s: %s", instance_id, msg)
        return error_response(msg, status_code=502)


def _get_resources() -> dict:
    """GET /resources — VPCs, subnets, security groups, key pairs, IAM profiles, AZs."""
    logger.info("Fetching AWS resources for form dropdowns")
    resources: dict[str, Any] = {}

    # VPCs
    try:
        resp = ec2.describe_vpcs(Filters=[{"Name": "state", "Values": ["available"]}])
        resources["vpcs"] = [
            {
                "id":         v["VpcId"],
                "cidr":       v["CidrBlock"],
                "name":       get_tag_value(v.get("Tags") or [], "Name", v["VpcId"]),
                "is_default": v.get("IsDefault", False),
            }
            for v in resp["Vpcs"]
        ]
    except ClientError as exc:
        logger.warning("Could not describe VPCs: %s", exc.response["Error"]["Message"])
        resources["vpcs"] = []

    # Subnets
    try:
        resp = ec2.describe_subnets(Filters=[{"Name": "state", "Values": ["available"]}])
        resources["subnets"] = [
            {
                "id":             s["SubnetId"],
                "vpc_id":         s["VpcId"],
                "cidr":           s["CidrBlock"],
                "az":             s["AvailabilityZone"],
                "name":           get_tag_value(s.get("Tags") or [], "Name", s["SubnetId"]),
                "available_ips":  s.get("AvailableIpAddressCount", 0),
                "auto_public_ip": s.get("MapPublicIpOnLaunch", False),
            }
            for s in resp["Subnets"]
        ]
    except ClientError as exc:
        logger.warning("Could not describe subnets: %s", exc.response["Error"]["Message"])
        resources["subnets"] = []

    # Security groups
    try:
        resp = ec2.describe_security_groups()
        resources["security_groups"] = [
            {
                "id":          sg["GroupId"],
                "name":        sg["GroupName"],
                "vpc_id":      sg.get("VpcId", ""),
                "description": sg.get("Description", ""),
            }
            for sg in resp["SecurityGroups"]
        ]
    except ClientError as exc:
        logger.warning("Could not describe security groups: %s", exc.response["Error"]["Message"])
        resources["security_groups"] = []

    # Key pairs
    try:
        resp = ec2.describe_key_pairs()
        resources["key_pairs"] = [
            {
                "name": kp["KeyName"],
                "type": kp.get("KeyType", "rsa"),
            }
            for kp in resp["KeyPairs"]
        ]
    except ClientError as exc:
        logger.warning("Could not describe key pairs: %s", exc.response["Error"]["Message"])
        resources["key_pairs"] = []

    # IAM instance profiles
    try:
        resp = iam.list_instance_profiles(MaxItems=100)
        resources["iam_instance_profiles"] = [
            {"name": p["InstanceProfileName"], "arn": p["Arn"]}
            for p in resp["InstanceProfiles"]
        ]
    except ClientError as exc:
        logger.warning("Could not list IAM profiles: %s", exc.response["Error"]["Message"])
        resources["iam_instance_profiles"] = []

    # Availability zones
    try:
        resp = ec2.describe_availability_zones(
            Filters=[{"Name": "state", "Values": ["available"]}]
        )
        resources["availability_zones"] = [az["ZoneName"] for az in resp["AvailabilityZones"]]
    except ClientError as exc:
        logger.warning("Could not describe AZs: %s", exc.response["Error"]["Message"])
        resources["availability_zones"] = []

    return success_response(resources)
