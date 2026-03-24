output "api_url" {
  description = "API Gateway endpoint — hardcode this in ContactSection.jsx"
  value       = "${aws_apigatewayv2_api.api.api_endpoint}/api/contact"
}
