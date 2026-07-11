variable "aws_region" {
  type        = string
  description = "AWS region for infrastructure deployment"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Target deployment environment"
  default     = "production"
}

variable "project_name" {
  type        = string
  description = "Name of the e-commerce project"
  default     = "ecommerce-enterprise"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "db_username" {
  type        = string
  description = "Database administrator username"
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  type        = string
  description = "Database administrator password"
  sensitive   = true
}
