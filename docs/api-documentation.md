# API Documentation

Base URL: `https://{api-id}.execute-api.{region}.amazonaws.com`

All endpoints return `Content-Type: application/json` with CORS headers.

---

## GET /instances

List all non-terminated EC2 instances.

**Response 200**
```json
{
  "instances": [
    {
      "instance_id":       "i-0abcdef1234567890",
      "instance_name":     "web-server-prod-01",
      "instance_type":     "t3.medium",
      "state":             "running",
      "ami_id":            "ami-0abcdef1234567890",
      "private_ip":        "10.0.1.45",
      "public_ip":         "54.210.12.34",
      "launch_time":       "2024-11-15T08:23:11Z",
      "availability_zone": "us-east-1a",
      "vpc_id":            "vpc-12345678",
      "subnet_id":         "subnet-12345678",
      "key_name":          "prod-keypair",
      "environment":       "production",
      "owner":             "team-platform",
      "project":           "ecommerce"
    }
  ],
  "count": 1
}
```

---

## POST /instances

Launch a new EC2 instance.

**Request body**
```json
{
  "instance_name":              "web-server-prod-01",
  "ami_id":                     "ami-0abcdef1234567890",
  "instance_type":              "t3.medium",
  "subnet_id":                  "subnet-12345678",
  "security_group_id":          "sg-12345678",
  "key_pair":                   "prod-keypair",
  "iam_instance_profile":       "EC2-SSM-Role",
  "root_volume_size":           20,
  "root_volume_type":           "gp3",
  "enable_public_ip":           true,
  "availability_zone":          "us-east-1a",
  "enable_detailed_monitoring": false,
  "tags": {
    "Environment": "production",
    "Owner":       "team-platform",
    "Project":     "ecommerce"
  }
}
```

**Required fields:** `instance_name`, `ami_id`, `instance_type`, `subnet_id`, `security_group_id`, `tags.Environment`, `tags.Owner`, `tags.Project`

**Response 201**
```json
{
  "message": "Instance i-0newinstance1234 launched successfully",
  "instance": { ...same shape as GET /instances item... }
}
```

**Response 400** — validation error
```json
{
  "error": "Validation failed",
  "errors": [
    "instance_type 'p4.mega' is not in the allowed list",
    "tags.Owner is required"
  ]
}
```

---

## POST /instances/start

Start a stopped instance.

**Request body**
```json
{ "instance_id": "i-0abcdef1234567890" }
```

**Response 200**
```json
{ "message": "Instance i-0abcdef1234567890 is pending", "state": "pending" }
```

---

## POST /instances/stop

Stop a running instance.

**Request body**
```json
{ "instance_id": "i-0abcdef1234567890" }
```

**Response 200**
```json
{ "message": "Instance i-0abcdef1234567890 is stopping", "state": "stopping" }
```

---

## POST /instances/reboot

Reboot a running instance.

**Request body**
```json
{ "instance_id": "i-0abcdef1234567890" }
```

**Response 200**
```json
{ "message": "Reboot initiated for i-0abcdef1234567890" }
```

---

## DELETE /instances/{instanceId}

Terminate an instance permanently.

**Path parameter:** `instanceId` — e.g. `i-0abcdef1234567890`

**Response 200**
```json
{ "message": "Instance i-0abcdef1234567890 is shutting-down", "state": "shutting-down" }
```

---

## GET /resources

Fetch dropdown data for the Create Instance form.

**Response 200**
```json
{
  "vpcs": [
    { "id": "vpc-12345678", "cidr": "10.0.0.0/16", "name": "prod-vpc", "is_default": false }
  ],
  "subnets": [
    { "id": "subnet-12345678", "vpc_id": "vpc-12345678", "cidr": "10.0.1.0/24",
      "az": "us-east-1a", "name": "prod-public-1a", "available_ips": 248, "auto_public_ip": true }
  ],
  "security_groups": [
    { "id": "sg-12345678", "name": "web-tier-sg", "vpc_id": "vpc-12345678", "description": "Web tier" }
  ],
  "key_pairs": [
    { "name": "prod-keypair", "type": "rsa" }
  ],
  "iam_instance_profiles": [
    { "name": "EC2-SSM-Role", "arn": "arn:aws:iam::123456789012:instance-profile/EC2-SSM-Role" }
  ],
  "availability_zones": ["us-east-1a", "us-east-1b", "us-east-1c"]
}
```

---

## Error format

All error responses follow this structure:
```json
{
  "error": "Human-readable error message",
  "errors": ["Optional array of specific field errors"]
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Instance created |
| 400 | Validation error or bad request |
| 404 | Route not found |
| 500 | Internal Lambda error |
| 502 | AWS API error (boto3 ClientError) |
