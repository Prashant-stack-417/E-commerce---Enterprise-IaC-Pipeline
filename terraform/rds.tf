resource "aws_db_subnet_group" "db" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "Allow private access to PostgreSQL RDS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow Postgres access from within VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    description = "Allow egress"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-db-sg"
  }
}

resource "aws_db_instance" "postgres" {
  identifier                          = "${var.project_name}-db"
  allocated_storage                   = 20
  max_allocated_storage               = 100
  db_name                             = "ecommerce"
  engine                              = "postgres"
  engine_version                      = "15.3"
  instance_class                      = "db.t3.micro"
  username                            = var.db_username
  password                            = var.db_password
  db_subnet_group_name                = aws_db_subnet_group.db.name
  vpc_security_group_ids              = [aws_security_group.db.id]
  skip_final_snapshot                 = true
  publicly_accessible                 = false
  storage_encrypted                   = true
  iam_database_authentication_enabled = true
  auto_minor_version_upgrade          = true
  backup_retention_period             = 7
  deletion_protection                 = false # Set to false to allow quick cleanup in environment demos

  tags = {
    Name = "${var.project_name}-rds"
  }
}
