variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "eu-west-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "alex"
}

variable "smtp_host" {
  description = "SMTP server hostname"
  type        = string
  default     = "www74.cpt1.host-h.net"
}

variable "smtp_port" {
  description = "SMTP server port"
  type        = string
  default     = "465"
}

variable "smtp_secure" {
  description = "Use SSL/TLS for SMTP"
  type        = string
  default     = "true"
}

variable "smtp_user" {
  description = "SMTP username / from address"
  type        = string
  default     = "jaylene@happyevents.co.za"
}

variable "smtp_pass" {
  description = "SMTP password"
  type        = string
  sensitive   = true
  default     = "1m5p07N34W3j30"
}
