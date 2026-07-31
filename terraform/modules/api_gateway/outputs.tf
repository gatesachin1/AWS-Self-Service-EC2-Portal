output "api_url" {
  description = "The HTTPS invoke URL for the $default stage"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "api_id" {
  value = aws_apigatewayv2_api.main.id
}

output "execution_arn" {
  value = aws_apigatewayv2_api.main.execution_arn
}
