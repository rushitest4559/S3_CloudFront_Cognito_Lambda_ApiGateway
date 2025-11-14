import boto3
import json
from datetime import datetime
from botocore.exceptions import ClientError, EndpointConnectionError

def lambda_handler(event, context):
    # Use EC2 client in a standard region (us-east-1) to list all available regions
    try:
        ec2_client_global = boto3.client('ec2', region_name='us-east-1')
        regions = [region['RegionName'] for region in ec2_client_global.describe_regions()['Regions']]
    except Exception as e:
        # Handle cases where even region listing fails
        return {
            "statusCode": 500,
            "body": json.dumps({"Error": "Failed to retrieve regions", "Details": str(e)})
        }

    all_ec2_instances = {}
    region_errors = {}

    for region in regions:
        region_instances = []
        try:
            # 1. Create EC2 client for the current region
            ec2_client = boto3.client('ec2', region_name=region)
            
            # 2. Use a Paginator for describe_instances to handle large numbers of instances
            paginator = ec2_client.get_paginator('describe_instances')
            pages = paginator.paginate()

            # Iterate through pages and reservations
            for page in pages:
                for reservation in page.get('Reservations', []):
                    for instance in reservation.get('Instances', []):
                        
                        # Extract the 'Name' tag, default to 'N/A' if not present
                        instance_name = 'N/A'
                        for tag in instance.get('Tags', []):
                            if tag['Key'] == 'Name':
                                instance_name = tag['Value']
                                break

                        # Format datetime object for JSON serialization
                        launch_time = instance.get('LaunchTime')
                        launch_time_str = launch_time.strftime("%Y-%m-%d %H:%M:%S") if isinstance(launch_time, datetime) else 'N/A'
                        
                        # Construct the required instance details object
                        instance_details = {
                            "Name": instance_name,
                            "InstanceId": instance.get('InstanceId', 'N/A'),
                            "Type": instance.get('InstanceType', 'N/A'),
                            # Get the 'Name' of the state (e.g., 'running', 'stopped')
                            "State": instance.get('State', {}).get('Name', 'N/A'),
                            "LaunchTime": launch_time_str,
                            "Region": region
                        }
                        region_instances.append(instance_details)
        
        except ClientError as e:
            # Catches Authorization failures or InvalidRegion errors
            error_code = e.response['Error']['Code']
            # Suppress specific errors for regions where the service is inactive or not subscribed
            if error_code in ('UnauthorizedOperation', 'OptInRequired', 'InvalidClientTokenId'):
                 # For these common permission/opt-in errors, log them but continue
                region_errors[region] = f"ClientError: {error_code} - {e.response['Error']['Message']}"
                continue
            # For other ClientErrors, log and continue
            region_errors[region] = f"ClientError: {error_code} - {e.response['Error']['Message']}"
            continue

        except EndpointConnectionError:
            # Catches cases where the EC2 endpoint is not available (less common for EC2, but good to include)
            region_errors[region] = "EndpointConnectionError: Could not connect to EC2 endpoint."
            continue
            
        except Exception as e:
            # Catch all other unexpected exceptions
            region_errors[region] = f"Unknown Error: {str(e)}"
            continue

        # ONLY add the region to the final result if instances were found
        if region_instances:
            all_ec2_instances[region] = region_instances

    # Include errors in the final response body for debugging
    final_response_data = all_ec2_instances.copy()
    if region_errors:
        final_response_data['DebugErrors'] = region_errors

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
        },
        # Dump the final dictionary to the JSON string body
        "body": json.dumps(final_response_data)
    }