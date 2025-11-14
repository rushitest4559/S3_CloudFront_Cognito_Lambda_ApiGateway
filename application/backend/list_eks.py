import boto3
import json

def lambda_handler(event, context):
    # Use EC2 client to list all regions
    ec2_client = boto3.client('ec2')
    regions = [region['RegionName'] for region in ec2_client.describe_regions()['Regions']]
    
    all_eks_clusters = {}

    for region in regions:
        eks_client = boto3.client('eks', region_name=region)
        try:
            response = eks_client.list_clusters()
            cluster_names = response.get('clusters', [])
        except Exception:
            continue  # Skip regions where EKS is not available or has no clusters

        region_clusters = []

        for cluster_name in cluster_names:
            try:
                cluster_info = eks_client.describe_cluster(name=cluster_name)['cluster']
                cluster_details = {
                    "Name": cluster_info.get('name', 'N/A'),
                    "Status": cluster_info.get('status', 'N/A'),
                    "Version": cluster_info.get('version', 'N/A'),
                    "Arn": cluster_info.get('arn', 'N/A'),
                    "CreatedAt": cluster_info.get('createdAt').strftime("%Y-%m-%d %H:%M:%S") if cluster_info.get('createdAt') else 'N/A',
                    "Endpoint": cluster_info.get('endpoint', 'N/A'),
                    "Region": region
                }
                region_clusters.append(cluster_details)
            except Exception:
                continue

        if region_clusters:
            all_eks_clusters[region] = region_clusters

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
        },
        "body": json.dumps(all_eks_clusters)
    }
