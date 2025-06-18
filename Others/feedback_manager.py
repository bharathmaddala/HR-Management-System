# feedback_manager.py
import json
import uuid # For generating unique IDs
from common_utils import get_response, get_user_id_from_event, dynamodb_client, FEEDBACK_TABLE

def submit_feedback(event, context):
    """Lambda function to submit performance feedback."""
    user_id = get_user_id_from_event(event)
    if not user_id:
        return get_response(401, {'message': 'Unauthorized: User ID missing.'})

    try:
        body = json.loads(event['body'])
        feedback_id = str(uuid.uuid4())
        feedback_text = body['feedback']
        timestamp = body.get('timestamp', '') # Should be provided by frontend

        dynamodb_client.put_item(
            TableName=FEEDBACK_TABLE,
            Item={
                'userId': {'S': user_id},
                'feedbackId': {'S': feedback_id}, # Sort Key
                'feedback': {'S': feedback_text},
                'timestamp': {'S': timestamp}
            }
        )
        return get_response(200, {'message': 'Feedback submitted successfully!', 'feedbackId': feedback_id})

    except Exception as e:
        print(f"Error submitting feedback for {user_id}: {e}")
        return get_response(500, {'message': f'Internal server error: {str(e)}'})

def get_feedback(event, context):
    """Lambda function to retrieve all feedback for a user."""
    user_id = get_user_id_from_event(event)
    if not user_id:
        return get_response(401, {'message': 'Unauthorized: User ID missing.'})

    try:
        response = dynamodb_client.query(
            TableName=FEEDBACK_TABLE,
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={':uid': {'S': user_id}}
        )
        feedback_list = []
        for item in response.get('Items', []):
            feedback_data = {k: v['S'] for k, v in item.items()}
            feedback_list.append(feedback_data)
        return get_response(200, {'feedback': feedback_list})
    except Exception as e:
        print(f"Error getting feedback for {user_id}: {e}")
        return get_response(500, {'message': f'Internal server error: {str(e)}'})