# auth_handler.py
import json
from common_utils import get_response, cognito_client, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID

def register_user(event, context):
    """Lambda function to handle user registration via Cognito."""
    try:
        body = json.loads(event['body'])
        email = body['email']
        password = body['password']

        # Call Cognito User Pool to sign up the user
        response = cognito_client.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=[
                {
                    'Name': 'email',
                    'Value': email
                },
            ]
        )
        # User needs to confirm their account (e.g., via email verification)
        # You would typically have a separate step or a confirmation flow
        return get_response(200, {'message': 'User registered successfully. Please confirm your account.'})

    except cognito_client.exceptions.UsernameExistsException:
        return get_response(400, {'message': 'Email already registered.'})
    except cognito_client.exceptions.InvalidPasswordException:
        return get_response(400, {'message': 'Password does not meet requirements.'})
    except Exception as e:
        print(f"Signup error: {e}")
        return get_response(500, {'message': f'Internal server error: {str(e)}'})

def login_user(event, context):
    """Lambda function to handle user login via Cognito."""
    try:
        body = json.loads(event['body'])
        email = body['email']
        password = body['password']

        response = cognito_client.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH', # Or 'USER_SRP_AUTH' for more secure flow
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )
        # If successful, response will contain authentication tokens
        # You would pass idToken and userId (sub claim) back to the frontend
        authentication_result = response['AuthenticationResult']
        id_token = authentication_result['IdToken']
        access_token = authentication_result['AccessToken']

        # Extract user ID (sub) from ID token (requires decoding JWT, not shown here for brevity)
        # For simplicity, let's assume Cognito provides it directly or you decode on frontend
        # In a real flow, you'd decode the JWT to get the 'sub' claim (user ID)
        # For demo, we'll return a dummy userId or rely on client to get it from token
        # A more robust way is to use AdminInitiateAuth and AdminRespondToAuthChallenge if used by backend
        
        # For now, let's just return some info and the token
        return get_response(200, {
            'message': 'Login successful!',
            'idToken': id_token,
            'accessToken': access_token,
            'userId': email # Placeholder: In real scenario, this would be Cognito Sub
        })

    except cognito_client.exceptions.NotAuthorizedException:
        return get_response(401, {'message': 'Invalid email or password.'})
    except cognito_client.exceptions.UserNotFoundException:
        return get_response(401, {'message': 'User not found.'})
    except Exception as e:
        print(f"Login error: {e}")
        return get_response(500, {'message': f'Internal server error: {str(e)}'})

# You would map /auth/signup to register_user and /auth/login to login_user