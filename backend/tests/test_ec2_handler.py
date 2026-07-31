"""
Unit tests for the EC2 Lambda handler.
Run: pytest backend/tests/ -v
"""
from __future__ import annotations

import json
import sys
import os
from unittest.mock import MagicMock, patch

import pytest

# Ensure Lambda source is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambda"))

from ec2_handler import lambda_handler  # noqa: E402
from validators import validate_create_instance, validate_instance_id  # noqa: E402
from utils import get_tag_value, parse_instance  # noqa: E402


# ── Helpers ───────────────────────────────────────────────────────────────

def make_event(
    route_key: str,
    body: dict | None = None,
    path_params: dict | None = None,
) -> dict:
    return {
        "version": "2.0",
        "routeKey": route_key,
        "requestContext": {
            "http": {
                "method": route_key.split()[0],
                "path": route_key.split()[1],
            },
            "requestId": "test-request-id",
        },
        "body": json.dumps(body) if body is not None else None,
        "pathParameters": path_params or {},
        "isBase64Encoded": False,
    }


def _minimal_create_body(**overrides) -> dict:
    base = {
        "instance_name":      "test-server-01",
        "ami_id":             "ami-0abcdef1234567890",
        "instance_type":      "t3.micro",
        "subnet_id":          "subnet-12345678",
        "security_group_id":  "sg-12345678",
        "root_volume_size":   20,
        "root_volume_type":   "gp3",
        "enable_public_ip":   False,
        "tags": {
            "Environment": "dev",
            "Owner":       "tester",
            "Project":     "myapp",
        },
    }
    base.update(overrides)
    return base


# ── validate_create_instance ──────────────────────────────────────────────

class TestValidateCreateInstance:
    def test_valid_minimal_payload(self):
        assert validate_create_instance(_minimal_create_body()) == []

    def test_missing_all_required(self):
        errors = validate_create_instance({})
        required = ["instance_name", "ami_id", "instance_type", "subnet_id", "security_group_id"]
        for field in required:
            assert any(field in e for e in errors), f"Expected error for {field}"

    def test_invalid_instance_name_starts_with_dash(self):
        errors = validate_create_instance(_minimal_create_body(instance_name="-bad-name"))
        assert any("instance_name" in e for e in errors)

    def test_invalid_instance_name_with_spaces(self):
        errors = validate_create_instance(_minimal_create_body(instance_name="bad name"))
        assert any("instance_name" in e for e in errors)

    def test_invalid_ami_id(self):
        errors = validate_create_instance(_minimal_create_body(ami_id="ami-UPPERCASE"))
        assert any("ami_id" in e for e in errors)

    def test_disallowed_instance_type(self):
        errors = validate_create_instance(_minimal_create_body(instance_type="p4d.mega"))
        assert any("instance_type" in e for e in errors)

    def test_volume_too_small(self):
        errors = validate_create_instance(_minimal_create_body(root_volume_size=4))
        assert any("root_volume_size" in e for e in errors)

    def test_volume_too_large(self):
        errors = validate_create_instance(_minimal_create_body(root_volume_size=99_999))
        assert any("root_volume_size" in e for e in errors)

    def test_volume_size_non_integer(self):
        errors = validate_create_instance(_minimal_create_body(root_volume_size="twenty"))
        assert any("root_volume_size" in e for e in errors)

    def test_missing_required_tags(self):
        errors = validate_create_instance(_minimal_create_body(tags={}))
        assert any("Environment" in e for e in errors)
        assert any("Owner" in e for e in errors)
        assert any("Project" in e for e in errors)

    def test_invalid_volume_type(self):
        errors = validate_create_instance(_minimal_create_body(root_volume_type="ssd"))
        assert any("root_volume_type" in e for e in errors)

    def test_valid_all_optional_fields(self):
        body = _minimal_create_body(
            key_pair="my-key",
            iam_instance_profile="EC2-SSM-Role",
            availability_zone="us-east-1a",
            enable_detailed_monitoring=True,
        )
        assert validate_create_instance(body) == []


# ── validate_instance_id ──────────────────────────────────────────────────

class TestValidateInstanceId:
    @pytest.mark.parametrize("iid", [
        "i-1234567890abcdef0",
        "i-12345678",
        "i-abcdef0123456789a",
    ])
    def test_valid(self, iid):
        assert validate_instance_id(iid) is None

    @pytest.mark.parametrize("iid", [
        "",
        "ec2-12345",
        "i-UPPERCASE",
        "i-123",          # too short
        "instance-abc",
    ])
    def test_invalid(self, iid):
        assert validate_instance_id(iid) is not None


# ── utils.parse_instance ──────────────────────────────────────────────────

class TestParseInstance:
    def _raw(self) -> dict:
        return {
            "InstanceId":   "i-0abcdef1234567890",
            "InstanceType": "t3.micro",
            "State":        {"Name": "running"},
            "ImageId":      "ami-0abcdef1234567890",
            "PrivateIpAddress": "10.0.1.5",
            "PublicIpAddress":  "54.1.2.3",
            "LaunchTime": "2024-11-15T08:00:00Z",
            "Placement": {"AvailabilityZone": "us-east-1a"},
            "VpcId":    "vpc-123",
            "SubnetId": "subnet-123",
            "KeyName":  "my-key",
            "SecurityGroups": [{"GroupId": "sg-abc"}],
            "Monitoring": {"State": "enabled"},
            "Tags": [
                {"Key": "Name",        "Value": "web-server"},
                {"Key": "Environment", "Value": "prod"},
                {"Key": "Owner",       "Value": "team-a"},
                {"Key": "Project",     "Value": "frontend"},
            ],
        }

    def test_basic_fields(self):
        parsed = parse_instance(self._raw())
        assert parsed["instance_id"]   == "i-0abcdef1234567890"
        assert parsed["state"]         == "running"
        assert parsed["public_ip"]     == "54.1.2.3"
        assert parsed["private_ip"]    == "10.0.1.5"
        assert parsed["instance_name"] == "web-server"
        assert parsed["environment"]   == "prod"

    def test_missing_optional_fields_default_empty(self):
        parsed = parse_instance({"InstanceId": "i-12345678", "State": {"Name": "terminated"}})
        assert parsed["public_ip"]  == ""
        assert parsed["private_ip"] == ""
        assert parsed["instance_name"] == ""


# ── lambda_handler routing ────────────────────────────────────────────────

class TestListInstances:
    @patch("ec2_handler.ec2")
    def test_returns_200_with_instances(self, mock_ec2):
        pager = MagicMock()
        mock_ec2.get_paginator.return_value = pager
        pager.paginate.return_value = [
            {
                "Reservations": [
                    {
                        "Instances": [
                            {
                                "InstanceId":   "i-abc1234567890",
                                "InstanceType": "t3.micro",
                                "State":        {"Name": "running"},
                                "ImageId":      "ami-123",
                                "LaunchTime":   "2024-01-01T00:00:00Z",
                                "Placement":    {"AvailabilityZone": "us-east-1a"},
                                "Tags": [{"Key": "Name", "Value": "test"}],
                            }
                        ]
                    }
                ]
            }
        ]
        response = lambda_handler(make_event("GET /instances"), {})
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert len(body["instances"]) == 1

    @patch("ec2_handler.ec2")
    def test_returns_502_on_client_error(self, mock_ec2):
        from botocore.exceptions import ClientError
        pager = MagicMock()
        mock_ec2.get_paginator.return_value = pager
        pager.paginate.side_effect = ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "Access denied"}},
            "DescribeInstances",
        )
        response = lambda_handler(make_event("GET /instances"), {})
        assert response["statusCode"] == 502


class TestCreateInstance:
    def test_validation_failure_returns_400(self):
        response = lambda_handler(make_event("POST /instances", body={}), {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "errors" in body
        assert len(body["errors"]) > 0

    @patch("ec2_handler.ec2")
    def test_success_returns_201(self, mock_ec2):
        mock_ec2.describe_images.return_value = {
            "Images": [{"RootDeviceName": "/dev/xvda"}]
        }
        mock_ec2.run_instances.return_value = {
            "Instances": [
                {
                    "InstanceId":   "i-new1234567890",
                    "InstanceType": "t3.micro",
                    "State":        {"Name": "pending"},
                    "ImageId":      "ami-0abcdef1234567890",
                    "LaunchTime":   "2024-01-01T00:00:00Z",
                    "Placement":    {"AvailabilityZone": "us-east-1a"},
                    "Tags": [{"Key": "Name", "Value": "test-server-01"}],
                }
            ]
        }
        response = lambda_handler(make_event("POST /instances", body=_minimal_create_body()), {})
        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        assert "instance" in body

    @patch("ec2_handler.ec2")
    def test_ami_not_found_returns_400(self, mock_ec2):
        mock_ec2.describe_images.return_value = {"Images": []}
        response = lambda_handler(make_event("POST /instances", body=_minimal_create_body()), {})
        assert response["statusCode"] == 400


class TestInstanceActions:
    @patch("ec2_handler.ec2")
    def test_stop_running_instance(self, mock_ec2):
        mock_ec2.stop_instances.return_value = {
            "StoppingInstances": [{"CurrentState": {"Name": "stopping"}}]
        }
        response = lambda_handler(
            make_event("POST /instances/stop", body={"instance_id": "i-1234567890abcdef0"}), {}
        )
        assert response["statusCode"] == 200

    @patch("ec2_handler.ec2")
    def test_start_stopped_instance(self, mock_ec2):
        mock_ec2.start_instances.return_value = {
            "StartingInstances": [{"CurrentState": {"Name": "pending"}}]
        }
        response = lambda_handler(
            make_event("POST /instances/start", body={"instance_id": "i-1234567890abcdef0"}), {}
        )
        assert response["statusCode"] == 200

    @patch("ec2_handler.ec2")
    def test_reboot_instance(self, mock_ec2):
        mock_ec2.reboot_instances.return_value = {}
        response = lambda_handler(
            make_event("POST /instances/reboot", body={"instance_id": "i-1234567890abcdef0"}), {}
        )
        assert response["statusCode"] == 200

    @patch("ec2_handler.ec2")
    def test_terminate_instance(self, mock_ec2):
        mock_ec2.terminate_instances.return_value = {
            "TerminatingInstances": [{"CurrentState": {"Name": "shutting-down"}}]
        }
        response = lambda_handler(
            make_event(
                "DELETE /instances/{instanceId}",
                path_params={"instanceId": "i-1234567890abcdef0"},
            ),
            {},
        )
        assert response["statusCode"] == 200

    def test_invalid_instance_id_returns_400(self):
        response = lambda_handler(
            make_event("POST /instances/stop", body={"instance_id": "not-valid"}), {}
        )
        assert response["statusCode"] == 400


class TestMiscRoutes:
    def test_unknown_route_returns_404(self):
        response = lambda_handler(make_event("GET /unknown"), {})
        assert response["statusCode"] == 404

    def test_options_returns_200(self):
        response = lambda_handler(make_event("OPTIONS /instances"), {})
        assert response["statusCode"] == 200

    def test_cors_headers_always_present(self):
        response = lambda_handler(make_event("GET /unknown"), {})
        assert "Access-Control-Allow-Origin" in response["headers"]
