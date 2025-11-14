
resource "aws_s3_bucket" "s3-bucket" {
  bucket        = "${var.project_name}-bucket"
  region        = var.region
  force_destroy = true

  tags = {
    Name        = "${var.project_name}-bucket"
    Environment = "Dev"
    Created_By  = "Terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "block_public_access" {
  bucket                  = aws_s3_bucket.s3-bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.s3-bucket.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}

resource "aws_s3_bucket_website_configuration" "website-config" {
  bucket = aws_s3_bucket.s3-bucket.bucket
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "404.jpeg"
  }
}

