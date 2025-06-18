# leave_manager.py
import json
import uuid # For generating unique IDs
from common_utils import get_response, get_user_id_from_event, dynamodb_client, LEAVES_TABLE

def submit_leave(event, context):
    """Lambda function to submit a leave request."""
    user_id = get_user_id_from_event(event)
    if not user_id:
        return get_response(401, {'message': 'Unauthorized: User ID missing.'})

    try:
        body = json.loads(event['body'])
        leave_id = str(uuid.uuid4()) # Generate a unique ID for the leave request
        leave_type = body['leaveType']
        start_date = body['startDate']
        end_date = body['endDate']
        reason = body.get('reason', '')
        status = body.get('status', 'Pending')
        submitted_at = body.get('submittedAt', '') # Should be provided by frontend
        
        # Put item in DynamoDB
        dynamodb_client.put_item(
            TableName=LEAVES_TABLE,
            Item={
                'userId': {'S': user_id},
                'leaveId': {'S': leave_id}, # Sort Key
                'leaveType': {'S': leave_type},
                'startDate': {'S': start_date},
                'endDate': {'S': end_date},
                'reason': {'S': reason},
                'status': {'S': status},
                'submittedAt': {'S': submitted_at}
            }
        )
        return get_response(200, {'message': 'Leave request submitted successfully!', 'leaveId': leave_id})

    except Exception as e:
        print(f"Error submitting leave for {user_id}: {e}")
        return get_response(500, {'message': f'Internal server error: {str(e)}'})

def get_leaves(event, context):
    """Lambda function to retrieve all leave requests for a user."""
    user_id = get_user_id_from_event(event)
    if not user_id:
        return get_response(401, {'message': 'Unauthorized: User ID missing.'})

    try:
        response = dynamodb_client.query(
            TableName=LEAVES_TABLE,
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={':uid': {'S': user_id}}
        )
        leaves = []
        for item in response.get('Items', []):
            leave_data = {k: v['S'] for k, v in item.items()}
            leaves.append(leave_data)
        return get_response(200, {'leaves': leaves})
    except Exception as e:
        print(f"Error getting leaves for {user_id}: {e}")
        return get_response(500, {'message': f'Internal server error: {str(e)}'})

# Additional functions (e.g., update_leave_status, delete_leave) can be added here