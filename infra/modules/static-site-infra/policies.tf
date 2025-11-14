data "aws_iam_policy_document" "bucket_policy" {
  statement {
    sid = "AllowCloudfrontServicePrincipalReadOnly"
    effect = "Allow"

    principals {
      type = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
        "s3:GetObject"
    ]

    resources = [
        "${aws_s3_bucket.s3-bucket.arn}/*"
    ]

    condition {
      test = "StringEquals"
      variable = "AWS:SourceArn"
      values = [aws_cloudfront_distribution.cdn.arn]
    }
  }
}