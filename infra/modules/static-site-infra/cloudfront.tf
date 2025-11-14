resource "aws_cloudfront_origin_access_control" "oac" {
  name = "s3-oac"
  description = "Access control for S3 bucket via cloudfront"
  origin_access_control_origin_type = "s3"
  signing_behavior = "always"
  signing_protocol = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.s3-bucket.bucket_regional_domain_name
    origin_id = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = "s3-origin"

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "${var.project_name}_cloudfront"
    Environment = "Dev"
    Created_By = "Terraform"
  }
}