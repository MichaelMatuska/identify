import json
import logging
import boto3

def lambda_handler(event, context):
   
   txt = ""
   myeventID = ""
   m = ""

   for record in event['Records']:
      txt = txt + record['eventName']

   for record in event['Records']:
      myeventID = record['eventID']

   n = str(len(event['Records']))
   k = record['dynamodb']['Keys']['username']['S']
   m = 'Successfully processed %s records. Keys: %s.' % (n, k)
   message = {"message": m}

   client = boto3.client('sns')
   response = client.publish(
      TargetArn = "arn:aws:sns:us-east-1:027366645575:DBStream",
      Message = json.dumps({'default': json.dumps(message)}),
      MessageStructure = 'json'
   )

   return {
      'statusCode': 200,
      'body': json.dumps('-' + txt + '-')
   }