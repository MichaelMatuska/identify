import json
import os
import boto3
import logging
import string
import random
import urllib.parse
from botocore.exceptions import ClientError


def lambda_handler(event, context):
    # Create s3 client
    s3_client = boto3.client('s3')
    #  Create Rekognition Client
    client = boto3.client('rekognition')
    model_arn = 'arn:aws:rekognition:us-east-1:027366645575:project/MatuskaAB/version/MatuskaAB.2021-10-29T11.09.22/1635520162325'

    # Get the image object from the event 
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    print(key)   
    
    response = client.detect_custom_labels(
        ProjectVersionArn = model_arn,
        Image={
            'S3Object': {
                'Bucket': bucket, 
                'Name': key}
            },
        MinConfidence = 80
        )
    # Get the custom labels
    labels = response['CustomLabels']
    labels_dict = {}
    
    random_letters = ''.join(random.choice(string.ascii_letters) for i in range(10))
    target_name=labels[0]["Name"]
    target_conf=labels[0]["Confidence"]
    
    labels_dict["id"] = str(random_letters)
    labels_dict["__typename"] = str("Note")
    labels_dict["_lastChangedAt"] = '1637164079085'
    labels_dict["_version"] = '1'
    labels_dict["image"] = str(key)
    labels_dict["UpdatedAt"] = str("2021-11-17T15:47:59.061Z")
    labels_dict["createdAt"] = str("2021-11-17T15:47:59.061Z")
    labels_dict["conf"] = str(target_conf)
    labels_dict["description"] = str("DYNAMIC ADDED")
    labels_dict["name"] = str(target_name)
    
    print(labels_dict)
    
    #Add to Dynamo Table 
    dynamodb = boto3.resource('dynamodb')

    table = dynamodb.Table('Note-wjx7j3rrkndrdd7cnj2szbn4ju-dev')

    print("Adding image details:", labels_dict)
    table.put_item(Item=labels_dict)
    print("Success!!")

    #write image to final bucket and delete from incoming bucket
    s3 = boto3.resource('s3')
    finalbucket = 'matuskademo-dst'
    copy_source = {
        'Bucket': bucket,
        'Key': key
    }
    
    put_image_name = random_letters+'-'+key
    s3.meta.client.copy(copy_source, finalbucket, put_image_name)

    s3_client.put_object(
        Body = str(json_object),
        Bucket = finalbucket,
        Key = put_image_name+'.json'
    )
    
    # Delete file from incoming s3
    s3_client.delete_object(
    Bucket = bucket,
    Key = key
    )