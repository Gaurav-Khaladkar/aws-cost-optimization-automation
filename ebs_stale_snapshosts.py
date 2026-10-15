import os
import boto3

def lambda_handler(event=None, context=None):
    ec2 = boto3.client('ec2')
    dry_run = os.getenv('DRY_RUN', 'false').lower() in ('true', '1', 'yes')

    print(f"[INFO] Starting EBS Stale Snapshot Cost Optimization Audit (DryRun={dry_run})...")

    # Get all EBS snapshots owned by this account
    response = ec2.describe_snapshots(OwnerIds=['self'])
    snapshots = response.get('Snapshots', [])
    print(f"[INFO] Total snapshots found: {len(snapshots)}")

    # Get all active EC2 instance IDs
    instances_response = ec2.describe_instances(Filters=[{'Name': 'instance-state-name', 'Values': ['running']}])
    active_instance_ids = set()

    for reservation in instances_response.get('Reservations', []):
        for instance in reservation.get('Instances', []):
            active_instance_ids.add(instance['InstanceId'])

    print(f"[INFO] Active running EC2 instances detected: {len(active_instance_ids)}")

    deleted_count = 0
    preserved_count = 0

    # Iterate through each snapshot and delete if it's not attached to any volume or the volume is not attached to a running instance
    for snapshot in snapshots:
        snapshot_id = snapshot['SnapshotId']
        volume_id = snapshot.get('VolumeId')

        if not volume_id:
            # Delete the snapshot if it's not attached to any volume
            if dry_run:
                print(f"[DRY RUN] Snapshot {snapshot_id} has no source volume. Would delete.")
            else:
                ec2.delete_snapshot(SnapshotId=snapshot_id)
                print(f"[DELETED] EBS snapshot {snapshot_id} as it was not attached to any volume.")
            deleted_count += 1
        else:
            # Check if the volume still exists
            try:
                volume_response = ec2.describe_volumes(VolumeIds=[volume_id])
                volumes = volume_response.get('Volumes', [])

                if not volumes or not volumes[0].get('Attachments'):
                    if dry_run:
                        print(f"[DRY RUN] Snapshot {snapshot_id} volume {volume_id} has no attachments. Would delete.")
                    else:
                        ec2.delete_snapshot(SnapshotId=snapshot_id)
                        print(f"[DELETED] EBS snapshot {snapshot_id} as it was taken from a volume not attached to any running instance.")
                    deleted_count += 1
                else:
                    preserved_count += 1
            except ec2.exceptions.ClientError as e:
                if e.response['Error']['Code'] == 'InvalidVolume.NotFound':
                    # The volume associated with the snapshot is not found (it might have been deleted)
                    if dry_run:
                        print(f"[DRY RUN] Snapshot {snapshot_id} associated volume {volume_id} not found. Would delete.")
                    else:
                        ec2.delete_snapshot(SnapshotId=snapshot_id)
                        print(f"[DELETED] EBS snapshot {snapshot_id} as its associated volume was not found.")
                    deleted_count += 1
                else:
                    print(f"[ERROR] Failed checking volume {volume_id} for snapshot {snapshot_id}: {e}")

    summary = {
        "status": "SUCCESS",
        "snapshots_scanned": len(snapshots),
        "snapshots_purged": deleted_count,
        "snapshots_preserved": preserved_count,
        "dry_run": dry_run
    }
    print(f"[SUMMARY] {summary}")
    return summary

if __name__ == '__main__':
    lambda_handler()

