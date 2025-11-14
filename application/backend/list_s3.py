import boto3
import json
from datetime import datetime

def lambda_handler(event, context):
    s3_client = boto3.client('s3')

    response = s3_client.list_buckets()
    buckets = response.get('Buckets', [])

    all_buckets = {}

    for bucket in buckets:
        bucket_name = bucket['Name']
        creation_time = bucket['CreationDate'].strftime("%Y-%m-%d %H:%M:%S")

        # Get region of the bucket
        try:
            location = s3_client.get_bucket_location(Bucket=bucket_name)
            region = location.get('LocationConstraint') or 'us-east-1'  # default for classic buckets
        except Exception as e:
            region = 'Unknown'

        # Fetch additional bucket attributes
        bucket_info = {
            "Name": bucket_name,
            "Region": region,
            "CreationDate": creation_time
        }

        # Try to fetch storage class and versioning info (optional extras)
        try:
            versioning = s3_client.get_bucket_versioning(Bucket=bucket_name)
            bucket_info["Versioning"] = versioning.get('Status', 'Disabled')
        except Exception:
            bucket_info["Versioning"] = "Unknown"

        try:
            encryption = s3_client.get_bucket_encryption(Bucket=bucket_name)
            rules = encryption['ServerSideEncryptionConfiguration']['Rules']
            bucket_info["Encryption"] = rules[0]['ApplyServerSideEncryptionByDefault']['SSEAlgorithm']
        except Exception:
            bucket_info["Encryption"] = "None"

        # Add bucket under its region
        if region not in all_buckets:
            all_buckets[region] = []
        all_buckets[region].append(bucket_info)

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
        },
        "body": json.dumps(all_buckets)
    }
