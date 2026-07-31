"""
Utility functions — response builders, instance parser, tag helpers.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

CORS_HEADERS: dict[str, str] = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Requested-With",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Max-Age": "3600",
}


# ── Response helpers ──────────────────────────────────────────────────────

def success_response(data: dict, status_code: int = 200) -> dict:
    """Return a well-formed API Gateway response with CORS headers."""
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(data, default=_json_serial),
    }


def error_response(
    message: str,
    status_code: int = 400,
    errors: list[str] | None = None,
) -> dict:
    """Return a structured error response."""
    body: dict[str, Any] = {"error": message}
    if errors:
        body["errors"] = errors
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


# ── Instance parser ───────────────────────────────────────────────────────

def parse_instance(instance: dict) -> dict:
    """
    Extract the fields the frontend cares about from a raw boto3
    instance dict (from DescribeInstances or RunInstances).
    """
    tags = instance.get("Tags") or []

    # Launch time — boto3 returns a datetime object
    launch_time = instance.get("LaunchTime")
    if isinstance(launch_time, datetime):
        launch_time = launch_time.strftime("%Y-%m-%dT%H:%M:%SZ")

    # IPs
    public_ip  = instance.get("PublicIpAddress") or ""
    private_ip = instance.get("PrivateIpAddress") or ""
    if not private_ip:
        nis = instance.get("NetworkInterfaces") or []
        if nis:
            private_ip = nis[0].get("PrivateIpAddress") or ""

    return {
        "instance_id":       instance.get("InstanceId", ""),
        "instance_name":     get_tag_value(tags, "Name"),
        "instance_type":     instance.get("InstanceType", ""),
        "state":             instance.get("State", {}).get("Name", "unknown"),
        "ami_id":            instance.get("ImageId", ""),
        "private_ip":        private_ip,
        "public_ip":         public_ip,
        "launch_time":       launch_time or "",
        "availability_zone": instance.get("Placement", {}).get("AvailabilityZone", ""),
        "vpc_id":            instance.get("VpcId", ""),
        "subnet_id":         instance.get("SubnetId", ""),
        "key_name":          instance.get("KeyName", ""),
        "security_groups":   [sg["GroupId"] for sg in instance.get("SecurityGroups", [])],
        "monitoring":        instance.get("Monitoring", {}).get("State", "disabled"),
        "environment":       get_tag_value(tags, "Environment"),
        "owner":             get_tag_value(tags, "Owner"),
        "project":           get_tag_value(tags, "Project"),
    }


# ── Tag helpers ───────────────────────────────────────────────────────────

def get_tag_value(tags: list[dict], key: str, default: str = "") -> str:
    """Return the value for *key* from a list of {Key, Value} dicts."""
    for tag in tags:
        if tag.get("Key") == key:
            return tag.get("Value", default)
    return default


def build_tags(instance_name: str, tags: dict) -> list[dict]:
    """Build a TagSpecification Tags list from user-supplied tag dict."""
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return [
        {"Key": "Name",        "Value": instance_name},
        {"Key": "Environment", "Value": tags.get("Environment", "unknown")},
        {"Key": "Owner",       "Value": tags.get("Owner", "unknown")},
        {"Key": "Project",     "Value": tags.get("Project", "unknown")},
        {"Key": "CreatedBy",   "Value": "EC2-Self-Service-Portal"},
        {"Key": "CreatedAt",   "Value": now_utc},
    ]


# ── JSON serialiser ───────────────────────────────────────────────────────

def _json_serial(obj: Any) -> str:
    if isinstance(obj, (datetime,)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not JSON-serializable")
