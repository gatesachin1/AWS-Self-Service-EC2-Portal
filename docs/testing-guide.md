# Testing Guide

## Unit tests (backend)

Tests live in `backend/tests/test_ec2_handler.py` and use `pytest` with `unittest.mock`.

### Setup

```bash
pip install pytest
```

No other dependencies are needed — boto3 is mocked, not installed locally.

### Run

```bash
# from the project root
pytest backend/tests/ -v
```

Expected output:
```
backend/tests/test_ec2_handler.py::test_list_instances_success PASSED
backend/tests/test_ec2_handler.py::test_create_instance_success PASSED
backend/tests/test_ec2_handler.py::test_create_instance_validation_error PASSED
backend/tests/test_ec2_handler.py::test_start_instance PASSED
backend/tests/test_ec2_handler.py::test_stop_instance PASSED
backend/tests/test_ec2_handler.py::test_reboot_instance PASSED
backend/tests/test_ec2_handler.py::test_terminate_instance PASSED
backend/tests/test_ec2_handler.py::test_get_resources PASSED
backend/tests/test_ec2_handler.py::test_unknown_route_returns_404 PASSED
backend/tests/test_ec2_handler.py::test_boto3_client_error_returns_502 PASSED
```

### What is tested

| Test | Covers |
|------|--------|
| `test_list_instances_success` | GET /instances — parses `describe_instances` response, returns correct shape |
| `test_create_instance_success` | POST /instances — calls `describe_images` + `run_instances`, returns 201 |
| `test_create_instance_validation_error` | POST /instances with bad data — returns 400 with `errors` array |
| `test_start_instance` | POST /instances/start — calls `start_instances`, returns pending state |
| `test_stop_instance` | POST /instances/stop — calls `stop_instances`, returns stopping state |
| `test_reboot_instance` | POST /instances/reboot — calls `reboot_instances` |
| `test_terminate_instance` | DELETE /instances/{id} — calls `terminate_instances` |
| `test_get_resources` | GET /resources — assembles VPCs, subnets, SGs, key pairs, IAM profiles, AZs |
| `test_unknown_route_returns_404` | Unrecognised routeKey → 404 |
| `test_boto3_client_error_returns_502` | `ClientError` from AWS → 502, error message forwarded |

### Mocking approach

All tests patch `ec2_handler.ec2` (the module-level boto3 EC2 client) and `ec2_handler.iam` using `@patch`:

```python
@patch("ec2_handler.ec2")
def test_list_instances_success(mock_ec2):
    mock_ec2.describe_instances.return_value = { ... }
    event = {"routeKey": "GET /instances", "body": None}
    result = lambda_handler(event, {})
    assert result["statusCode"] == 200
```

This means tests are pure unit tests — no AWS credentials, no network calls.

---

## Integration tests (manual)

After deploying with Terraform:

1. **List instances**
   ```bash
   curl https://{api-url}/instances
   ```
   Expected: 200 with `instances` array.

2. **Get resources**
   ```bash
   curl https://{api-url}/resources
   ```
   Expected: 200 with `vpcs`, `subnets`, `security_groups`, `key_pairs`, `iam_instance_profiles`.

3. **Create instance** (replace values with real IDs from your account)
   ```bash
   curl -X POST https://{api-url}/instances \
     -H "Content-Type: application/json" \
     -d '{
       "instance_name": "test-portal-instance",
       "ami_id": "ami-0abcdef1234567890",
       "instance_type": "t3.micro",
       "subnet_id": "subnet-xxxxxxxx",
       "security_group_id": "sg-xxxxxxxx",
       "tags": { "Environment": "dev", "Owner": "test", "Project": "portal-test" }
     }'
   ```
   Expected: 201 with `instance` object and real `instance_id`.

4. **Stop instance**
   ```bash
   curl -X POST https://{api-url}/instances/stop \
     -H "Content-Type: application/json" \
     -d '{"instance_id": "i-xxxxxxxxxxxxxxxxx"}'
   ```

5. **Terminate instance**
   ```bash
   curl -X DELETE https://{api-url}/instances/i-xxxxxxxxxxxxxxxxx
   ```

---

## Frontend smoke test

After running `npm run dev` in `frontend/`:

1. Open http://localhost:3000
2. Dashboard loads — stats cards show (or error banner if API is not configured)
3. "Create Instance" form — all dropdowns populate from GET /resources
4. "Manage Instances" table — search, filter, and sort work
5. Start/Stop/Reboot — confirm modal appears, action executes, row updates
6. Terminate — danger variant confirm modal, row eventually disappears

---

## CloudWatch logs

Lambda logs every invocation to `/aws/lambda/{prefix}-handler`. To tail in real time:

```bash
aws logs tail /aws/lambda/ecc-portal-dev-handler --follow
```
