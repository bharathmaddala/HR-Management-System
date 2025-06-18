# common_utils.py (A helper file for common logic)
import json
import os
import uuid
import boto3

# Initialize AWS clients
cognito_client = boto3.client('cognito-idp', region_name=os.environ.get('AWS_REGION'))
dynamodb_client = boto3.client('dynamodb', region_name=os.environ.get('AWS_REGION'))
s3_client = boto3.client('s3', region_name=os.environ.get('AWS_REGION'))

# Get table names from environment variables
PROFILES_TABLE = os.environ.get('PROFILES_TABLE', 'HRMS_Profiles')
LEAVES_TABLE = os.environ.get('LEAVES_TABLE', 'HRMS_Leaves')
FEEDBACK_TABLE = os.environ.get('FEEDBACK_TABLE', 'HRMS_Feedback')
DOCUMENTS_TABLE = os.environ.get('DOCUMENTS_TABLE', 'HRMS_Documents')
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME', 'f13tech-hrms-documents') # Replace with your S3 bucket name
COGNITO_USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')
COGNITO_CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')

def get_response(status_code, body):
    """Helper to format API Gateway responses."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', # Adjust for production
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
        'body': json.dumps(body)
    }

def get_user_id_from_event(event):
    """
    Extracts user ID from API Gateway event.
    Prioritizes Cognito Authorizer (for authenticated routes),
    then checks JSON body (for POST/PUT), then query string (for GET).
    """
    
    if 'requestContext' in event and 'authorizer' in event['requestContext'] and 'claims' in event['requestContext']['authorizer']:
        cognito_sub = event['requestContext']['authorizer']['claims'].get('sub')
        if cognito_sub:
            return cognito_sub

    if 'body' in event and event['body']:
        try:
            body = json.loads(event['body'])
            user_id_from_body = body.get('userId')
            if user_id_from_body:
                return user_id_from_body
        except json.JSONDecodeError:
            pass 

    if 'queryStringParameters' in event and event['queryStringParameters']: 
        user_id_from_query = event['queryStringParameters'].get('userId')
        if user_id_from_query:
            return user_id_from_query

    print(f"Warning: userId not found in event: {event}")
    return None # Return None if userId cannot be determined