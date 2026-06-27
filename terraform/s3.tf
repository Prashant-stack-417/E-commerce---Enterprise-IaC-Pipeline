resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "aws_s3_bucket" "assets" {
  bucket        = "${var.project_name}-assets-${random_string.suffix.result}"
  force_destroy = false

  # ts:skip=AWS.S3.2 S3 Bucket Access Logging is disabled for this sandbox bucket
  # bridgecrew:skip=CKV_AWS_18: "S3 Access logging is disabled for this sandbox demonstration bucket"
  # bridgecrew:skip=CKV_AWS_144: "Cross-region replication is disabled for this demo bucket"
  tags = {
    Name = "${var.project_name}-assets"
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
