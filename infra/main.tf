terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

# ── npm install before packaging ────────────────────────────────────────────
resource "null_resource" "lambda_deps" {
  triggers = {
    package_json = filemd5("${path.module}/lambda/package.json")
  }

  provisioner "local-exec" {
    command     = "npm install --omit=dev"
    working_dir = "${path.module}/lambda"
  }
}

# ── Zip the Lambda ───────────────────────────────────────────────────────────
data "archive_file" "lambda_zip" {
  depends_on  = [null_resource.lambda_deps]
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/lambda.zip"
  excludes    = ["package-lock.json"]
}

# ── IAM role ─────────────────────────────────────────────────────────────────
resource "aws_iam_role" "lambda_exec" {
  name = "happy-shisha-contact-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ── Lambda function ───────────────────────────────────────────────────────────
resource "aws_lambda_function" "contact" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "happy-shisha-contact"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = 30

  environment {
    variables = {
      SMTP_HOST   = var.smtp_host
      SMTP_PORT   = var.smtp_port
      SMTP_SECURE = var.smtp_secure
      SMTP_USER   = var.smtp_user
      SMTP_PASS   = var.smtp_pass
    }
  }
}

# ── Lambda Function URL ───────────────────────────────────────────────────────
resource "aws_lambda_function_url" "contact" {
  function_name      = aws_lambda_function.contact.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = [
      "https://www.happyshisha.co.za",
      "https://happyshisha.co.za",
      "https://www.happyevents.co.za",
      "https://happyevents.co.za",
    ]
    allow_methods = ["POST"]
    allow_headers = ["Content-Type"]
    max_age       = 300
  }
}
