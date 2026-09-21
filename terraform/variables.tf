variable "aws_region" {
  description = "AWS region to deploy resources (us-east-1 for AWS Academy/Learner Lab or ap-south-1 for Mumbai)"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for tagging and resource naming"
  type        = string
  default     = "kanban-thunder"
}

variable "vpc_cidr" {
  description = "CIDR block for the custom VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance type (t3.small recommended for 2GB RAM; t3.micro/t2.micro for strict free tier)"
  type        = string
  default     = "t3.small"
}

variable "public_key_path" {
  description = "Path to the local SSH public key file"
  type        = string
  default     = "~/.ssh/kanban_aws_key.pub"
}

variable "root_volume_size" {
  description = "Size of the root EBS volume in GB"
  type        = number
  default     = 25
}
