const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    try {
        const bucketName = process.env.BUCKET_NAME;
        const params = {
            Bucket: bucketName,
            Prefix: '2025/',
            Delimiter: '/'
        };

        const data = await s3.listObjectsV2(params).promise();
        
        // Extract folder names from CommonPrefixes
        const folders = data.CommonPrefixes.map(prefix => {
            const path = prefix.Prefix;
            return path.split('/')[1]; // Get the folder name
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ folders })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ error: error.message })
        };
    }
}; 