# document_manager.py
import json
import uuid
import base64 # For handling file uploads (if passed directly)
from common_utils import get_response, get_user_id_from_event, dynamodb_client, s3_client, DOCUMENTS_TABLE, S3_BUCKET_NAME

def upload_document(event, context):
    """Lambda function to handle document uploads (metadata to DynamoDB, file to S3)."""
    user_id = get_user_id_from_event(event)
    if not user_id:
        return get_response(401, {'message': 'Unauthorized: User ID missing.'})

    try:
        body = json.loads(event['body'])
        
        file_name = body['fileName']
        file_type = body['fileType']
        file_size = body['fileSize'] # Size in bytes, for metadata
        upload_date = body['uploadDate']
        
        # In a real scenario, the file itself might be base64 encoded in the request body
        # or the frontend would get a pre-signed S3 URL to upload directly.
        # For this example, we'll assume metadata is sent, and S3 upload happens separately
        # or is handled by a different mechanism (e.g., pre-signed URLs).

        # Generate a unique key for S3 to prevent overwrites
        s3_object_key = f"{user_id}/{uuid.uuid4()}-{file_name}"
        
        # You would typically generate a pre-signed URL for the frontend to upload directly to S3
        # Or, if the file is small and sent base64 encoded in the request:
        # file_content_base64 = body.get('fileContent')
        # if file_content_base64:
        #     file_content = base64.b64decode(file_content_base64)
        #     s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=s3_object_key, Body=file_content)
        # else:
        #     print("Warning: No file content provided for direct upload. Only metadata stored.")

        # Store document metadata in DynamoDB
        document_id = str(uuid.uuid4())
        dynamodb_client.put_item(
            TableName=DOCUMENTS_TABLE,
            Item={
                'userId': {'S': user_id},
                'documentId': {'S': document_id}, # Sort Key
                'fileName': {'S': file_name},
                'fileType': {'S': file_type},
                'fileSize': {'N': str(file_size)}, # Store as Number
                'uploadDate': {'S': upload_date},
                's3Key': {'S': s3_object_key},
                's3Bucket': {'S': S3_BUCKET_NAME},
                'downloadUrl': {'S': f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{s3_object_key}"} # Public URL
            }
        )
        return get_response(200, {'message': 'Document metadata saved successfully!', 'documentId': document_id, 's3Key': s3_object_key})

    except Exception as e:
        print(f"Error uploading document for {user_id}: {e}")
        return get_response(500, {'message': f'Internal server error: {str(e)}'})

def get_documents(event, context):
    """Lambda function to retrieve all document metadata for a user."""
    user_id = get_user_id_from_event(event)
    if not user_id:
        return get_response(401, {'message': 'Unauthorized: User ID missing.'})

    try:
        response = dynamodb_client.query(
            TableName=DOCUMENTS_TABLE,
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={':uid': {'S': user_id}}
        )
        documents = []
        for item in response.get('Items', []):
            doc_data = {
                'userId': item['userId']['S'],
                'documentId': item['documentId']['S'],
                'fileName': item['fileName']['S'],
                'fileType': item['fileType']['S'],
                'fileSize': int(item['fileSize']['N']), # Convert to int
                'uploadDate': item['uploadDate']['S'],
                's3Key': item['s3Key']['S'],
                's3Bucket': item['s3Bucket']['S'],
                'downloadUrl': item['downloadUrl']['S']
            }
            documents.append(doc_data)
        return get_response(200, {'documents': documents})
    except Exception as e:
        print(f"Error getting documents for {user_id}: {e}")
        return get_response(500, {'message': f'Internal server error: {str(e)}'})