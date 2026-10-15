terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS deployment region"
}

# Zip the Python Lambda handler
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../ebs_stale_snapshosts.py"
  output_path = "${path.module}/lambda_function.zip"
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "ebs-cost-optimizer-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Least Privilege
resource "aws_iam_role_policy" "lambda_policy" {
  name   = "ebs-cost-optimizer-policy"
  role   = aws_iam_role.lambda_role.id
  policy = file("${path.module}/../iam/policy.json")
}

# AWS Lambda Function
resource "aws_lambda_function" "cost_optimizer" {
  function_name    = "ebs-stale-snapshot-optimizer"
  runtime          = "python3.12"
  handler          = "ebs_stale_snapshosts.lambda_handler"
  role             = aws_iam_role.lambda_role.arn
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = 60
  memory_size      = 128

  description = "Automated serverless FinOps function to purge stale/orphaned EBS snapshots"

  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
    Purpose     = "FinOps-CostOptimization"
    Author      = "Gaurav Khaladkar"
  }
}

# Amazon EventBridge Rule (Daily at 01:00 UTC)
resource "aws_cloudwatch_event_rule" "daily_schedule" {
  name                = "daily-ebs-snapshot-cleanup"
  description         = "Triggers EBS Cost Optimizer Lambda daily"
  schedule_expression = "cron(0 1 * * ? *)"
}

# EventBridge Target
resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.daily_schedule.name
  target_id = "TriggerLambda"
  arn       = aws_lambda_function.cost_optimizer.arn
}

# Lambda Permission for EventBridge
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cost_optimizer.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_schedule.arn
}

output "lambda_arn" {
  value       = aws_lambda_function.cost_optimizer.arn
  description = "ARN of the deployed Cost Optimizer Lambda"
}
