export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "identify472aad56": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        }
    },
    "storage": {
        "s3a7d2aa18": {
            "BucketName": "string",
            "Region": "string"
        }
    },
    "api": {
        "identify": {
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        }
    },
    "predictions": {
        "identifyLabels99b9901d": {
            "region": "string",
            "type": "string"
        },
        "identifyEntities1562bab4": {
            "region": "string",
            "collectionId": "string",
            "celebrityDetectionEnabled": "string",
            "maxEntities": "string"
        }
    },
    "function": {
        "RekognitionIndexFacesTriggerfbe9f406": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    }
}