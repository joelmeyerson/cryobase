const config = {
  aws_cognito_region: "us-east-1", // (required) - Region where Amazon Cognito project was created
  aws_user_pools_id:  "us-east-1_jfISkLHGg", // (optional) -  Amazon Cognito User Pool ID
  aws_user_pools_web_client_id: "59l85geov36gnrk0pj9rfg45dv", // (optional) - Amazon Cognito App Client ID (App client secret needs to be disabled)
  aws_cognito_identity_pool_id: "us-east-1:c6729a0c-1214-4b75-8059-2b62345c0427", // (optional) - Amazon Cognito Identity Pool ID
  aws_mandatory_sign_in: "enable" // (optional) - Users are not allowed to get the aws credentials unless they are signed in
}

export default config;
