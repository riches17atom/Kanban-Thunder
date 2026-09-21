output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.web.id
}

output "instance_public_ip" {
  description = "Public IPv4 address of the EC2 instance"
  value       = aws_instance.web.public_ip
}

output "instance_public_dns" {
  description = "Public DNS hostname of the EC2 instance"
  value       = aws_instance.web.public_dns
}

output "ssh_connection_command" {
  description = "Command to SSH into the instance"
  value       = "ssh -i ~/.ssh/kanban_aws_key ubuntu@${aws_instance.web.public_ip}"
}

output "application_url" {
  description = "Public Web Application URL"
  value       = "http://${aws_instance.web.public_ip}"
}

output "api_documentation_url" {
  description = "Interactive Swagger API documentation URL"
  value       = "http://${aws_instance.web.public_ip}/api/v1/docs"
}

output "ansible_inventory_entry" {
  description = "Formatted entry for ansible/inventory.ini"
  value       = "kanban_server ansible_host=${aws_instance.web.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/kanban_aws_key"
}
