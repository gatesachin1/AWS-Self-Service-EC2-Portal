# ── Trust policy — only Lambda may assume this role ───────────────────────
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    sid     = "LambdaAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_execution" {
  name               = "${var.name_prefix}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
  description        = "Execution role for the EC2 self-service portal Lambda function"
}

# ── EC2 monitoring (least-privilege) ─────────────────────────────────────
data "aws_iam_policy_document" "ec2_permissions" {
  # Core EC2 instance operations
  statement {
    sid    = "EC2InstanceOperations"
    effect = "Allow"
    actions = [
      "ec2:RunInstances",
      "ec2:StartInstances",
      "ec2:StopInstances",
      "ec2:RebootInstances",
      "ec2:TerminateInstances",
      "ec2:CreateTags",
    ]
    resources = ["*"]
  }

  # Read-only EC2 describe operations
  statement {
    sid    = "EC2DescribeOperations"
    effect = "Allow"
    actions = [
      "ec2:DescribeInstances",
      "ec2:DescribeInstanceStatus",
      "ec2:DescribeInstanceTypes",
      "ec2:DescribeImages",
      "ec2:DescribeVpcs",
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeKeyPairs",
      "ec2:DescribeAvailabilityZones",
      "ec2:DescribeNetworkInterfaces",
    ]
    resources = ["*"]
  }

  # Required to attach IAM instance profiles when launching instances
  statement {
    sid     = "PassRoleToEC2"
    effect  = "Allow"
    actions = ["iam:PassRole"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ec2.amazonaws.com"]
    }
  }

  # Read IAM instance profiles for the create-instance dropdown
  statement {
    sid    = "ListIAMInstanceProfiles"
    effect = "Allow"
    actions = [
      "iam:ListInstanceProfiles",
      "iam:GetInstanceProfile",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "ec2_policy" {
  name        = "${var.name_prefix}-ec2-policy"
  description = "Least-privilege EC2 + IAM permissions for the portal Lambda"
  policy      = data.aws_iam_policy_document.ec2_permissions.json
}

resource "aws_iam_role_policy_attachment" "ec2" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.ec2_policy.arn
}

# ── AWS Services read-only (Cloud Console Portal) ─────────────────────────
data "aws_iam_policy_document" "services_read" {
  # S3
  statement {
    sid    = "S3ReadOnly"
    effect = "Allow"
    actions = [
      "s3:ListAllMyBuckets",
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:GetPublicAccessBlock",
    ]
    resources = ["*"]
  }

  # ELB / ALB / NLB
  statement {
    sid    = "ELBReadOnly"
    effect = "Allow"
    actions = [
      "elasticloadbalancing:DescribeLoadBalancers",
      "elasticloadbalancing:DescribeTargetGroups",
      "elasticloadbalancing:DescribeListeners",
    ]
    resources = ["*"]
  }

  # Lambda
  statement {
    sid    = "LambdaReadOnly"
    effect = "Allow"
    actions = [
      "lambda:ListFunctions",
      "lambda:GetFunction",
    ]
    resources = ["*"]
  }

  # RDS
  statement {
    sid    = "RDSReadOnly"
    effect = "Allow"
    actions = [
      "rds:DescribeDBInstances",
      "rds:DescribeDBClusters",
    ]
    resources = ["*"]
  }

  # DynamoDB
  statement {
    sid    = "DynamoDBReadOnly"
    effect = "Allow"
    actions = [
      "dynamodb:ListTables",
      "dynamodb:DescribeTable",
    ]
    resources = ["*"]
  }

  # ECS
  statement {
    sid    = "ECSReadOnly"
    effect = "Allow"
    actions = [
      "ecs:ListClusters",
      "ecs:DescribeClusters",
      "ecs:ListServices",
      "ecs:ListTasks",
    ]
    resources = ["*"]
  }

  # CloudFront
  statement {
    sid    = "CloudFrontReadOnly"
    effect = "Allow"
    actions = [
      "cloudfront:ListDistributions",
    ]
    resources = ["*"]
  }

  # Route 53
  statement {
    sid    = "Route53ReadOnly"
    effect = "Allow"
    actions = [
      "route53:ListHostedZones",
      "route53:ListResourceRecordSets",
    ]
    resources = ["*"]
  }

  # IAM read (users, roles)
  statement {
    sid    = "IAMReadOnly"
    effect = "Allow"
    actions = [
      "iam:ListUsers",
      "iam:ListRoles",
      "iam:ListMFADevices",
      "iam:ListAccessKeys",
      "iam:ListGroupsForUser",
      "iam:ListAttachedUserPolicies",
      "iam:GetUser",
    ]
    resources = ["*"]
  }

  # CloudWatch Alarms + Dashboards
  statement {
    sid    = "CloudWatchReadOnly"
    effect = "Allow"
    actions = [
      "cloudwatch:DescribeAlarms",
      "cloudwatch:ListDashboards",
      "cloudwatch:GetDashboard",
    ]
    resources = ["*"]
  }

  # SQS
  statement {
    sid    = "SQSReadOnly"
    effect = "Allow"
    actions = [
      "sqs:ListQueues",
      "sqs:GetQueueAttributes",
    ]
    resources = ["*"]
  }

  # SNS
  statement {
    sid    = "SNSReadOnly"
    effect = "Allow"
    actions = [
      "sns:ListTopics",
      "sns:GetTopicAttributes",
      "sns:ListSubscriptionsByTopic",
    ]
    resources = ["*"]
  }

  # Auto Scaling
  statement {
    sid    = "AutoScalingReadOnly"
    effect = "Allow"
    actions = [
      "autoscaling:DescribeAutoScalingGroups",
      "autoscaling:DescribePolicies",
    ]
    resources = ["*"]
  }

  # CodePipeline
  statement {
    sid    = "CodePipelineReadOnly"
    effect = "Allow"
    actions = [
      "codepipeline:ListPipelines",
      "codepipeline:GetPipelineState",
      "codepipeline:GetPipeline",
    ]
    resources = ["*"]
  }

  # CodeBuild
  statement {
    sid    = "CodeBuildReadOnly"
    effect = "Allow"
    actions = [
      "codebuild:ListProjects",
      "codebuild:BatchGetProjects",
      "codebuild:ListBuilds",
    ]
    resources = ["*"]
  }

  # CodeDeploy
  statement {
    sid    = "CodeDeployReadOnly"
    effect = "Allow"
    actions = [
      "codedeploy:ListApplications",
      "codedeploy:GetApplication",
      "codedeploy:ListDeploymentGroups",
      "codedeploy:ListDeployments",
      "codedeploy:GetDeployment",
    ]
    resources = ["*"]
  }

  # CodeCommit
  statement {
    sid    = "CodeCommitReadOnly"
    effect = "Allow"
    actions = [
      "codecommit:ListRepositories",
      "codecommit:GetRepository",
      "codecommit:ListBranches",
    ]
    resources = ["*"]
  }

  # CodeStar Connections
  statement {
    sid    = "CodeStarConnectionsReadOnly"
    effect = "Allow"
    actions = [
      "codestar-connections:ListConnections",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "services_read_policy" {
  name        = "${var.name_prefix}-services-read-policy"
  description = "Read-only access to all AWS services shown in the Cloud Console Portal"
  policy      = data.aws_iam_policy_document.services_read.json
}

resource "aws_iam_role_policy_attachment" "services_read" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.services_read_policy.arn
}

# ── CloudWatch Logs ───────────────────────────────────────────────────────
data "aws_iam_policy_document" "cloudwatch_logs" {
  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["${var.lambda_log_group_arn}:*"]
  }
}

resource "aws_iam_policy" "cloudwatch_policy" {
  name        = "${var.name_prefix}-cloudwatch-policy"
  description = "CloudWatch Logs write permissions for Lambda"
  policy      = data.aws_iam_policy_document.cloudwatch_logs.json
}

resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.cloudwatch_policy.arn
}

# ── X-Ray tracing ─────────────────────────────────────────────────────────
resource "aws_iam_role_policy_attachment" "xray" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}
