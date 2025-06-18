# profile_manager.py
import json
from common_utils import get_response, get_user_id_from_event, dynamodb_client, PROFILES_TABLE

def get_profile(event, context):
    """Lambda function to retrieve user profile."""
    user_id = get_user_id_from_event(event)
    if not user_id:
        return get_response(401, {'message': 'Unauthorized: User ID missing.'})

    try:
        response = dynamodb_client.get_item(
            TableName=PROFILES_TABLE,
            Key={'userId': {'S': user_id}}
        )
        item = response.get('Item')
        if item:
            # DynamoDB returns item with type descriptors (e.g., {'S': 'value'})
            profile_data = {k: v['S'] for k, v in item.items()} # Simple conversion for string attributes
            return get_response(200, {'profile': profile_data})
        else:
            return get_response(200, {'profile': {}, 'message': 'Profile not found.'}) # Return empty profile
    except Exception as e:
        print(f"Error getting profile for {user_id}: {e}")
        return get_response(500, {'message': f'Internal server error: {str(e)}'})

def update_profile(event, context):
    """Lambda function to update user profile."""
    user_id = get_user_id_from_event(event) # Assumes userId is in event body or authorizer
    if not user_id:
        return get_response(401, {'message': 'Unauthorized: User ID missing.'})

    try:
        body = json.loads(event['body'])
        # Extract profile fields from the request body
        emp_id = body.get('empId')
        name = body.get('name')
        email = body.get('email')
        department = body.get('department')

        if not all([emp_id, name, email, department]):
            return get_response(400, {'message': 'Missing required profile fields.'})

        # Update item in DynamoDB
        dynamodb_client.put_item(
            TableName=PROFILES_TABLE,
            Item={
                'userId': {'S': user_id},
                'empId': {'S': emp_id},
                'name': {'S': name},
                'email': {'S': email},
                'department': {'S': department}
            }
        )
        return get_response(200, {'message': 'Profile updated successfully.'})

    except Exception as e:
        print(f"Error updating profile for {user_id}: {e}")
        return get_response(500, {'message': f'Internal server error: {str(e)}'})