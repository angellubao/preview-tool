#!/bin/bash

# Build the project
npm run build

# Configure AWS credentials (you'll need to set these up first)
# aws configure

# Create S3 bucket (replace YOUR-BUCKET-NAME with your desired bucket name)
BUCKET_NAME="preview-tool-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Upload files to S3
aws s3 sync dist/ s3://$BUCKET_NAME --acl public-read

# Set bucket policy for public access
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

echo "Your website is now available at: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com" 