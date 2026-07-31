# ── Lambda log group ─────────────────────────────────────────────────────
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.name_prefix}-handler"
  retention_in_days = var.log_retention_days
}

# ── API Gateway access log group ──────────────────────────────────────────
resource "aws_cloudwatch_log_group" "api_access" {
  name              = "/aws/apigateway/${var.name_prefix}"
  retention_in_days = var.log_retention_days
}
