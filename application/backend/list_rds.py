import boto3
import json

def lambda_handler(event, context):
    # Use EC2 client to get the list of all AWS regions
    ec2_client = boto3.client('ec2')
    regions = [region['RegionName'] for region in ec2_client.describe_regions()['Regions']]
    
    all_rds_instances = {}

    for region in regions:
        rds_client = boto3.client('rds', region_name=region)
        try:
            response = rds_client.describe_db_instances()
        except rds_client.exceptions.ClientError:
            continue  # Skip regions where RDS might not be available

        region_instances = []

        for db in response.get('DBInstances', []):
            instance_info = {
                "DBInstanceIdentifier": db['DBInstanceIdentifier'],
                "Engine": db.get('Engine', 'N/A'),
                "DBInstanceClass": db.get('DBInstanceClass', 'N/A'),
                "InstanceCreateTime": db['InstanceCreateTime'].strftime("%Y-%m-%d %H:%M:%S"),
                "AvailabilityZone": db.get('AvailabilityZone', 'N/A'),
                "Status": db.get('DBInstanceStatus', 'N/A')
            }
            region_instances.append(instance_info)

        if region_instances:
            all_rds_instances[region] = region_instances

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
        },
        "body": json.dumps(all_rds_instances)
    }
