"""
AWS Cloud Console Portal — Services Reader
Handles GET /services/{service} for all non-EC2 services.
Each handler catches its own ClientError so one failing service
never breaks the others.
"""
from __future__ import annotations

import logging
import os
from typing import Any

import boto3
from botocore.exceptions import ClientError

from utils import error_response, success_response, get_tag_value

logger = logging.getLogger()
logger.setLevel(os.environ.get("LOG_LEVEL", "INFO"))

_REGION = os.environ.get("AWS_REGION", "us-east-1")

# ── Lazy boto3 clients — only initialised on first call ───────────────────────
_clients: dict[str, Any] = {}


def _client(service: str, region: str | None = None) -> Any:
    key = f"{service}:{region or _REGION}"
    if key not in _clients:
        kwargs = {"region_name": region or _REGION}
        _clients[key] = boto3.client(service, **kwargs)
    return _clients[key]


# ── Main dispatcher ────────────────────────────────────────────────────────────

def handle(service_name: str) -> dict:
    handlers = {
        "s3":          _get_s3,
        "vpc":         _get_vpc,
        "elb":         _get_elb,
        "lambda":      _get_lambda,
        "rds":         _get_rds,
        "dynamodb":    _get_dynamodb,
        "ecs":         _get_ecs,
        "cloudfront":  _get_cloudfront,
        "route53":     _get_route53,
        "iam":         _get_iam,
        "cloudwatch":  _get_cloudwatch,
        "sqs":         _get_sqs,
        "sns":         _get_sns,
        "autoscaling": _get_autoscaling,
        "devtools":    _get_devtools,
    }
    fn = handlers.get(service_name)
    if not fn:
        return error_response(f"Unknown service: {service_name}", status_code=404)
    logger.info("Fetching real data for service: %s", service_name)
    return fn()


# ─────────────────────────────────────────────────────────────────────────────
# S3
# ─────────────────────────────────────────────────────────────────────────────

def _get_s3() -> dict:
    s3 = _client("s3", region=None)  # global service
    try:
        resp = s3.list_buckets()
        buckets = []
        for b in resp.get("Buckets", []):
            name = b["Name"]
            created = b.get("CreationDate", "").isoformat()[:10] if b.get("CreationDate") else "—"

            # Get bucket region
            try:
                loc = s3.get_bucket_location(Bucket=name)
                region = loc.get("LocationConstraint") or "us-east-1"
            except ClientError:
                region = "unknown"

            # Get versioning
            try:
                ver = s3.get_bucket_versioning(Bucket=name)
                versioning = ver.get("Status", "Disabled") or "Disabled"
            except ClientError:
                versioning = "Unknown"

            # Public access block
            try:
                pab = s3.get_public_access_block(Bucket=name)["PublicAccessBlockConfiguration"]
                public_access = "Blocked" if all(pab.values()) else "Accessible"
            except ClientError:
                public_access = "Unknown"

            buckets.append({
                "name":          name,
                "region":        region,
                "versioning":    versioning,
                "objects":       "—",      # requires list-objects which is expensive
                "size":          "—",      # requires CloudWatch Storage metrics
                "public_access": public_access,
                "created":       created,
            })

        return success_response({"items": buckets, "count": len(buckets)})

    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("S3 error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# VPC
# ─────────────────────────────────────────────────────────────────────────────

def _get_vpc() -> dict:
    ec2 = _client("ec2")
    result: dict[str, list] = {"vpcs": [], "subnets": [], "security_groups": []}

    # VPCs
    try:
        resp = ec2.describe_vpcs()
        for v in resp.get("Vpcs", []):
            result["vpcs"].append({
                "id":            v["VpcId"],
                "name":          get_tag_value(v.get("Tags") or [], "Name", v["VpcId"]),
                "cidr":          v["CidrBlock"],
                "state":         v.get("State", "available"),
                "subnets":       0,          # filled below
                "dns_hostnames": "Enabled" if v.get("EnableDnsHostnames") else "Disabled",
                "is_default":    v.get("IsDefault", False),
                "tenancy":       v.get("InstanceTenancy", "default").capitalize(),
            })
    except ClientError as exc:
        logger.warning("VPC describe error: %s", exc.response["Error"]["Message"])

    # Subnets — count per VPC
    subnet_count: dict[str, int] = {}
    try:
        resp = ec2.describe_subnets()
        for s in resp.get("Subnets", []):
            vpc_id = s["VpcId"]
            subnet_count[vpc_id] = subnet_count.get(vpc_id, 0) + 1
            result["subnets"].append({
                "id":            s["SubnetId"],
                "name":          get_tag_value(s.get("Tags") or [], "Name", s["SubnetId"]),
                "vpc":           vpc_id,
                "cidr":          s["CidrBlock"],
                "az":            s["AvailabilityZone"],
                "type":          "Public" if s.get("MapPublicIpOnLaunch") else "Private",
                "available_ips": s.get("AvailableIpAddressCount", 0),
                "route_table":   "—",
            })
    except ClientError as exc:
        logger.warning("Subnet describe error: %s", exc.response["Error"]["Message"])

    # Backfill subnet counts
    for v in result["vpcs"]:
        v["subnets"] = subnet_count.get(v["id"], 0)

    # Security groups
    try:
        resp = ec2.describe_security_groups()
        for sg in resp.get("SecurityGroups", []):
            inbound_ports = sorted({
                str(p.get("FromPort", "All")) for p in sg.get("IpPermissions", [])
                if "FromPort" in p
            })
            result["security_groups"].append({
                "id":          sg["GroupId"],
                "name":        sg["GroupName"],
                "vpc":         sg.get("VpcId", "—"),
                "inbound":     ", ".join(inbound_ports) if inbound_ports else "None",
                "outbound":    "All traffic",
                "description": sg.get("Description", ""),
            })
    except ClientError as exc:
        logger.warning("SG describe error: %s", exc.response["Error"]["Message"])

    return success_response(result)


# ─────────────────────────────────────────────────────────────────────────────
# Elastic Load Balancing
# ─────────────────────────────────────────────────────────────────────────────

def _get_elb() -> dict:
    elbv2 = _client("elbv2")
    try:
        resp = elbv2.describe_load_balancers()
        items = []
        for lb in resp.get("LoadBalancers", []):
            azs = ", ".join(az["ZoneName"] for az in lb.get("AvailabilityZones", []))
            name = lb.get("LoadBalancerName", "—")

            # Count registered targets
            try:
                tg_resp = elbv2.describe_target_groups(LoadBalancerArn=lb["LoadBalancerArn"])
                targets = len(tg_resp.get("TargetGroups", []))
            except ClientError:
                targets = 0

            items.append({
                "name":    name,
                "type":    lb.get("Type", "—").capitalize(),
                "state":   lb.get("State", {}).get("Code", "—"),
                "scheme":  lb.get("Scheme", "—"),
                "vpc":     lb.get("VpcId", "—"),
                "azs":     azs,
                "targets": targets,
                "dns":     lb.get("DNSName", "—"),
                "created": lb.get("CreatedTime", "").isoformat()[:10] if lb.get("CreatedTime") else "—",
            })
        return success_response({"items": items, "count": len(items)})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("ELB error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# Lambda Functions
# ─────────────────────────────────────────────────────────────────────────────

def _get_lambda() -> dict:
    lmbd = _client("lambda")
    try:
        paginator = lmbd.get_paginator("list_functions")
        items = []
        for page in paginator.paginate():
            for fn in page.get("Functions", []):
                pkg_size = fn.get("CodeSize", 0)
                size_str = f"{pkg_size / (1024*1024):.1f} MB" if pkg_size else "—"
                modified = fn.get("LastModified", "")[:10] if fn.get("LastModified") else "—"
                items.append({
                    "name":          fn.get("FunctionName", "—"),
                    "runtime":       fn.get("Runtime", "—"),
                    "memory":        f"{fn.get('MemorySize', 128)} MB",
                    "timeout":       f"{fn.get('Timeout', 3)}s",
                    "state":         fn.get("State", "Active"),
                    "last_modified": modified,
                    "handler":       fn.get("Handler", "—"),
                    "package_size":  size_str,
                })
        return success_response({"items": items, "count": len(items)})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("Lambda error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# RDS
# ─────────────────────────────────────────────────────────────────────────────

def _get_rds() -> dict:
    rds = _client("rds")
    try:
        paginator = rds.get_paginator("describe_db_instances")
        items = []
        for page in paginator.paginate():
            for db in page.get("DBInstances", []):
                storage = f"{db.get('AllocatedStorage', 0)} GB {db.get('StorageType', '')}"
                engine  = f"{db.get('Engine', '—')} {db.get('EngineVersion', '')}".strip()
                created = db.get("InstanceCreateTime", "")
                created_str = created.isoformat()[:10] if created else "—"
                items.append({
                    "id":       db.get("DBInstanceIdentifier", "—"),
                    "engine":   engine,
                    "class":    db.get("DBInstanceClass", "—"),
                    "status":   db.get("DBInstanceStatus", "—"),
                    "storage":  storage,
                    "multi_az": "Yes" if db.get("MultiAZ") else "No",
                    "public":   "Yes" if db.get("PubliclyAccessible") else "No",
                    "created":  created_str,
                })
        return success_response({"items": items, "count": len(items)})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("RDS error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# DynamoDB
# ─────────────────────────────────────────────────────────────────────────────

def _get_dynamodb() -> dict:
    ddb = _client("dynamodb")
    try:
        paginator = ddb.get_paginator("list_tables")
        table_names = []
        for page in paginator.paginate():
            table_names.extend(page.get("TableNames", []))

        items = []
        # Describe up to 50 tables to avoid timeout
        for name in table_names[:50]:
            try:
                t = ddb.describe_table(TableName=name)["Table"]
                billing = t.get("BillingModeSummary", {}).get("BillingMode", "PROVISIONED")
                tp = t.get("ProvisionedThroughput", {})
                read_cap  = "On-demand" if billing == "PAY_PER_REQUEST" else str(tp.get("ReadCapacityUnits", 0))
                write_cap = "On-demand" if billing == "PAY_PER_REQUEST" else str(tp.get("WriteCapacityUnits", 0))
                size_bytes = t.get("TableSizeBytes", 0)
                size_str   = f"{size_bytes / (1024*1024*1024):.2f} GB" if size_bytes > 1e9 else f"{size_bytes // (1024*1024)} MB"
                gsi_count  = len(t.get("GlobalSecondaryIndexes", []))
                streams    = "Enabled" if t.get("StreamSpecification", {}).get("StreamEnabled") else "Disabled"
                created    = t.get("CreationDateTime", "")
                created_str= created.isoformat()[:10] if created else "—"
                items.append({
                    "name":      name,
                    "status":    t.get("TableStatus", "—").capitalize(),
                    "items":     t.get("ItemCount", 0),
                    "size":      size_str,
                    "read_cap":  f"{read_cap} RCU" if read_cap != "On-demand" else read_cap,
                    "write_cap": f"{write_cap} WCU" if write_cap != "On-demand" else write_cap,
                    "streams":   streams,
                    "gsi":       gsi_count,
                    "created":   created_str,
                })
            except ClientError:
                items.append({"name": name, "status": "Unknown"})

        return success_response({"items": items, "count": len(table_names)})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("DynamoDB error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# ECS
# ─────────────────────────────────────────────────────────────────────────────

def _get_ecs() -> dict:
    ecs = _client("ecs")
    try:
        cluster_arns = ecs.list_clusters().get("clusterArns", [])
        if not cluster_arns:
            return success_response({"items": [], "count": 0})
        clusters = ecs.describe_clusters(clusters=cluster_arns, include=["STATISTICS"]).get("clusters", [])
        items = []
        for c in clusters:
            launch = "Fargate" if c.get("capacityProviders") else "EC2"
            items.append({
                "name":                 c.get("clusterName", "—"),
                "status":               c.get("status", "—"),
                "launch_type":          launch,
                "services":             c.get("activeServicesCount", 0),
                "tasks_running":        c.get("runningTasksCount", 0),
                "tasks_pending":        c.get("pendingTasksCount", 0),
                "container_instances":  c.get("registeredContainerInstancesCount", 0),
                "created":              "—",
            })
        return success_response({"items": items, "count": len(items)})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("ECS error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# CloudFront
# ─────────────────────────────────────────────────────────────────────────────

def _get_cloudfront() -> dict:
    cf = _client("cloudfront", region="us-east-1")
    try:
        resp = cf.list_distributions()
        dist_list = resp.get("DistributionList", {}).get("Items", [])
        items = []
        for d in dist_list:
            origins = ", ".join(o.get("DomainName", "") for o in d.get("Origins", {}).get("Items", []))
            aliases = d.get("Aliases", {}).get("Items", [])
            domain  = aliases[0] if aliases else d.get("DomainName", "—")
            created = d.get("LastModifiedTime", "")
            created_str = created.isoformat()[:10] if created else "—"
            items.append({
                "id":          d.get("Id", "—"),
                "domain":      domain,
                "status":      d.get("Status", "—"),
                "origins":     origins,
                "price_class": d.get("PriceClass", "—").replace("PriceClass_", "").replace("_", "/"),
                "ssl":         d.get("ViewerCertificate", {}).get("CertificateSource", "—").capitalize(),
                "enabled":     "Yes" if d.get("Enabled") else "No",
                "created":     created_str,
            })
        return success_response({"items": items, "count": len(items)})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("CloudFront error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# Route 53
# ─────────────────────────────────────────────────────────────────────────────

def _get_route53() -> dict:
    r53 = _client("route53", region=None)
    try:
        resp = r53.list_hosted_zones()
        items = []
        for z in resp.get("HostedZones", []):
            zone_id = z["Id"].split("/")[-1]
            items.append({
                "id":      zone_id,
                "name":    z.get("Name", "—").rstrip("."),
                "type":    "Private" if z.get("Config", {}).get("PrivateZone") else "Public",
                "records": z.get("ResourceRecordSetCount", 0),
                "comment": z.get("Config", {}).get("Comment", "—"),
                "created": "—",
            })
        return success_response({"items": items, "count": len(items)})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("Route53 error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# IAM
# ─────────────────────────────────────────────────────────────────────────────

def _get_iam() -> dict:
    iam = _client("iam", region=None)
    result: dict[str, list] = {"users": [], "roles": []}

    # Users
    try:
        paginator = iam.get_paginator("list_users")
        for page in paginator.paginate():
            for u in page.get("Users", []):
                username = u.get("UserName", "—")
                created  = u.get("CreateDate", "")
                last_login = u.get("PasswordLastUsed", "")

                # MFA devices count
                try:
                    mfa_resp = iam.list_mfa_devices(UserName=username)
                    mfa_count = len(mfa_resp.get("MFADevices", []))
                    mfa = "Virtual MFA" if mfa_count > 0 else "—"
                except ClientError:
                    mfa = "Unknown"

                # Access keys count
                try:
                    key_resp = iam.list_access_keys(UserName=username)
                    key_count = len(key_resp.get("AccessKeyMetadata", []))
                except ClientError:
                    key_count = 0

                # Groups
                try:
                    grp_resp = iam.list_groups_for_user(UserName=username)
                    groups = ", ".join(g["GroupName"] for g in grp_resp.get("Groups", [])) or "—"
                except ClientError:
                    groups = "—"

                result["users"].append({
                    "username":    username,
                    "groups":      groups,
                    "policies":    0,
                    "mfa":         mfa,
                    "access_keys": key_count,
                    "last_login":  last_login.isoformat()[:10] if last_login else "Never",
                    "created":     created.isoformat()[:10] if created else "—",
                })
    except ClientError as exc:
        logger.warning("IAM users error: %s", exc.response["Error"]["Message"])

    # Roles
    try:
        paginator = iam.get_paginator("list_roles")
        for page in paginator.paginate():
            for r in page.get("Roles", [])[:50]:  # limit to 50
                trusted = []
                for stmt in r.get("AssumeRolePolicyDocument", {}).get("Statement", []):
                    p = stmt.get("Principal", {})
                    if isinstance(p, str):
                        trusted.append(p)
                    elif isinstance(p, dict):
                        for v in p.values():
                            if isinstance(v, list):
                                trusted.extend(v)
                            else:
                                trusted.append(v)
                created = r.get("CreateDate", "")
                result["roles"].append({
                    "name":           r.get("RoleName", "—"),
                    "trusted_entity": ", ".join(trusted) if trusted else "—",
                    "policies":       "—",
                    "created":        created.isoformat()[:10] if created else "—",
                })
    except ClientError as exc:
        logger.warning("IAM roles error: %s", exc.response["Error"]["Message"])

    return success_response(result)


# ─────────────────────────────────────────────────────────────────────────────
# CloudWatch
# ─────────────────────────────────────────────────────────────────────────────

def _get_cloudwatch() -> dict:
    cw = _client("cloudwatch")
    result: dict[str, list] = {"alarms": [], "dashboards": []}

    # Alarms
    try:
        paginator = cw.get_paginator("describe_alarms")
        for page in paginator.paginate():
            for a in page.get("MetricAlarms", []):
                actions = ", ".join(
                    arn.split(":")[-1] for arn in a.get("AlarmActions", [])
                ) or "—"
                threshold = f"{a.get('ComparisonOperator', '').replace('GreaterThan', '>').replace('LessThan', '<').replace('EqualTo', '=')} {a.get('Threshold', '—')}"
                updated = a.get("StateUpdatedTimestamp", "")
                result["alarms"].append({
                    "name":      a.get("AlarmName", "—"),
                    "state":     a.get("StateValue", "—"),
                    "metric":    a.get("MetricName", "—"),
                    "threshold": threshold.strip(),
                    "actions":   actions,
                    "updated":   updated.isoformat()[:16].replace("T", " ") if updated else "—",
                })
    except ClientError as exc:
        logger.warning("CW alarms error: %s", exc.response["Error"]["Message"])

    # Dashboards
    try:
        resp = cw.list_dashboards()
        for d in resp.get("DashboardEntries", []):
            modified = d.get("LastModified", "")
            result["dashboards"].append({
                "name":         d.get("DashboardName", "—"),
                "widgets":      "—",
                "region":       _REGION,
                "last_updated": modified.isoformat()[:16].replace("T", " ") if modified else "—",
            })
    except ClientError as exc:
        logger.warning("CW dashboards error: %s", exc.response["Error"]["Message"])

    return success_response(result)


# ─────────────────────────────────────────────────────────────────────────────
# SQS
# ─────────────────────────────────────────────────────────────────────────────

def _get_sqs() -> dict:
    sqs = _client("sqs")
    try:
        resp = sqs.list_queues()
        queue_urls = resp.get("QueueUrls", [])
        items = []
        attrs_to_fetch = [
            "QueueArn", "ApproximateNumberOfMessages",
            "ApproximateNumberOfMessagesNotVisible",
            "MessageRetentionPeriod", "RedrivePolicy",
            "FifoQueue",
        ]
        for url in queue_urls[:50]:
            try:
                a = sqs.get_queue_attributes(QueueUrl=url, AttributeNames=attrs_to_fetch).get("Attributes", {})
                name = url.split("/")[-1]
                is_fifo = a.get("FifoQueue") == "true" or name.endswith(".fifo")
                retention_secs = int(a.get("MessageRetentionPeriod", 345600))
                retention_str  = f"{retention_secs // 86400} day{'s' if retention_secs // 86400 != 1 else ''}"
                dlq = "—"
                if a.get("RedrivePolicy"):
                    import json as _json
                    rp = _json.loads(a["RedrivePolicy"])
                    dlq = rp.get("deadLetterTargetArn", "—").split(":")[-1]
                items.append({
                    "name":               name,
                    "type":               "FIFO" if is_fifo else "Standard",
                    "messages_available": int(a.get("ApproximateNumberOfMessages", 0)),
                    "messages_in_flight": int(a.get("ApproximateNumberOfMessagesNotVisible", 0)),
                    "dlq":                dlq,
                    "retention":          retention_str,
                    "created":            "—",
                })
            except ClientError:
                items.append({"name": url.split("/")[-1], "type": "—"})
        return success_response({"items": items, "count": len(queue_urls)})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("SQS error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# SNS
# ─────────────────────────────────────────────────────────────────────────────

def _get_sns() -> dict:
    sns = _client("sns")
    try:
        paginator = sns.get_paginator("list_topics")
        items = []
        for page in paginator.paginate():
            for t in page.get("Topics", []):
                arn  = t["TopicArn"]
                name = arn.split(":")[-1]
                is_fifo = name.endswith(".fifo")
                # Get subscription count
                try:
                    attrs = sns.get_topic_attributes(TopicArn=arn).get("Attributes", {})
                    sub_count = int(attrs.get("SubscriptionsConfirmed", 0))
                except ClientError:
                    sub_count = 0
                items.append({
                    "name":          name,
                    "type":          "FIFO" if is_fifo else "Standard",
                    "subscriptions": sub_count,
                    "protocol":      "—",
                    "created":       "—",
                })
        return success_response({"items": items, "count": len(items)})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("SNS error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# Auto Scaling
# ─────────────────────────────────────────────────────────────────────────────

def _get_autoscaling() -> dict:
    asg = _client("autoscaling")
    try:
        paginator = asg.get_paginator("describe_auto_scaling_groups")
        items = []
        for page in paginator.paginate():
            for g in page.get("AutoScalingGroups", []):
                created = g.get("CreatedTime", "")
                suspended = bool(g.get("SuspendedProcesses"))
                status = "Suspended" if suspended else "InService"
                lt = g.get("LaunchTemplate", {}).get("LaunchTemplateName") or \
                     g.get("LaunchConfigurationName") or "—"
                items.append({
                    "name":          g.get("AutoScalingGroupName", "—"),
                    "status":        status,
                    "min":           g.get("MinSize", 0),
                    "desired":       g.get("DesiredCapacity", 0),
                    "max":           g.get("MaxSize", 0),
                    "instances":     len([i for i in g.get("Instances", []) if i.get("LifecycleState") == "InService"]),
                    "health_check":  g.get("HealthCheckType", "—"),
                    "launch_config": lt,
                    "created":       created.isoformat()[:10] if created else "—",
                })
        return success_response({"items": items, "count": len(items)})
    except ClientError as exc:
        msg = exc.response["Error"]["Message"]
        logger.error("ASG error: %s", msg)
        return error_response(msg, status_code=502)


# ─────────────────────────────────────────────────────────────────────────────
# Developer Tools (CodePipeline, CodeBuild, CodeDeploy, CodeCommit, Connections)
# ─────────────────────────────────────────────────────────────────────────────

def _get_devtools() -> dict:
    result: dict[str, list] = {
        "pipelines":    [],
        "builds":       [],
        "deployments":  [],
        "repositories": [],
        "connections":  [],
    }

    # CodePipeline
    try:
        cp = _client("codepipeline")
        plines = cp.list_pipelines().get("pipelines", [])
        for p in plines:
            name = p.get("name", "—")
            try:
                state = cp.get_pipeline_state(name=name)
                stage_states = state.get("stageStates", [])
                last_exec = stage_states[-1].get("latestExecution", {}) if stage_states else {}
                status = last_exec.get("status", "Unknown")
                updated = last_exec.get("lastUpdateTime", "")
                updated_str = updated.isoformat()[:16].replace("T", " ") if updated else "—"
            except ClientError:
                status, updated_str = "Unknown", "—"
            result["pipelines"].append({
                "name":           name,
                "status":         status,
                "source":         "—",
                "stages":         len(plines),
                "last_execution": updated_str,
                "created":        p.get("created", "").isoformat()[:10] if p.get("created") else "—",
            })
    except ClientError as exc:
        logger.warning("CodePipeline error: %s", exc.response["Error"]["Message"])

    # CodeBuild
    try:
        cb = _client("codebuild")
        project_names = cb.list_projects().get("projects", [])
        if project_names:
            projects = cb.batch_get_projects(names=project_names[:50]).get("projects", [])
            for p in projects:
                env = p.get("environment", {})
                last_build = p.get("lastModified", "")
                result["builds"].append({
                    "name":       p.get("name", "—"),
                    "source":     p.get("source", {}).get("type", "—").capitalize(),
                    "status":     "—",
                    "build_time": "—",
                    "environment": f"{env.get('image', '—')}",
                    "last_build": last_build.isoformat()[:10] if last_build else "—",
                    "created":    "—",
                })
    except ClientError as exc:
        logger.warning("CodeBuild error: %s", exc.response["Error"]["Message"])

    # CodeDeploy
    try:
        cd = _client("codedeploy")
        app_names = cd.list_applications().get("applications", [])
        for name in app_names[:50]:
            try:
                info = cd.get_application(applicationName=name).get("application", {})
                platform = info.get("computePlatform", "—")
                groups = cd.list_deployment_groups(applicationName=name).get("deploymentGroups", [])
                try:
                    deployments = cd.list_deployments(applicationName=name, maxResults=1)
                    dep_id = (deployments.get("deployments") or [None])[0]
                    if dep_id:
                        dep_info = cd.get_deployment(deploymentId=dep_id).get("deploymentInfo", {})
                        dep_status = dep_info.get("status", "—")
                        dep_time   = dep_info.get("completeTime", dep_info.get("createTime", ""))
                        last_dep   = f"{dep_status} — {dep_time.isoformat()[:10] if dep_time else '—'}"
                    else:
                        last_dep = "No deployments"
                except ClientError:
                    last_dep = "—"
                result["deployments"].append({
                    "name":            name,
                    "platform":        platform.replace("_", "/"),
                    "groups":          len(groups),
                    "last_deployment": last_dep,
                    "created":         info.get("createTime", "").isoformat()[:10] if info.get("createTime") else "—",
                })
            except ClientError:
                result["deployments"].append({"name": name, "platform": "—", "groups": 0})
    except ClientError as exc:
        logger.warning("CodeDeploy error: %s", exc.response["Error"]["Message"])

    # CodeCommit
    try:
        cc = _client("codecommit")
        repos = cc.list_repositories().get("repositories", [])
        for r in repos[:50]:
            name = r.get("repositoryName", "—")
            try:
                info = cc.get_repository(repositoryName=name).get("repositoryMetadata", {})
                last = info.get("lastModifiedDate", "")
                created = info.get("creationDate", "")
                result["repositories"].append({
                    "name":           name,
                    "default_branch": info.get("defaultBranch", "main"),
                    "open_prs":       "—",
                    "size":           "—",
                    "last_commit":    last.isoformat()[:10] if last else "—",
                    "created":        created.isoformat()[:10] if created else "—",
                })
            except ClientError:
                result["repositories"].append({"name": name})
    except ClientError as exc:
        logger.warning("CodeCommit error: %s", exc.response["Error"]["Message"])

    # CodeStar Connections
    try:
        csc = _client("codestar-connections")
        conns = csc.list_connections().get("Connections", [])
        for c in conns:
            result["connections"].append({
                "name":     c.get("ConnectionName", "—"),
                "provider": c.get("ProviderType", "—"),
                "status":   c.get("ConnectionStatus", "—"),
                "owner":    c.get("OwnerAccountId", "—"),
                "arn":      c.get("ConnectionArn", "—"),
                "created":  "—",
            })
    except ClientError as exc:
        logger.warning("CodeStar Connections error: %s", exc.response["Error"]["Message"])

    return success_response(result)
