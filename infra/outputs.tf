output "api_url" {
  description = "Lambda Function URL — set this as VITE_API_URL in Amplify"
  value       = aws_lambda_function_url.contact.function_url
}
