import json
labels = [
   {
      "Name":"Sam Serverless",
      "Confidence":93.90399932861328,
      "Geometry":{
         "BoundingBox":{
            "Width":0.5947700142860413,
            "Height":0.8297399878501892,
            "Left":0.1698099970817566,
            "Top":0.16569000482559204
         }
      }
   },
   {
      "Name":"Sam Serverless",
      "Confidence":14.204999923706055,
      "Geometry":{
         "BoundingBox":{
            "Width":0.24944999814033508,
            "Height":0.26958000659942627,
            "Left":0.4566600024700165,
            "Top":0.28042998909950256
         }
      }
   }
]

json_object = json.dumps(labels, indent=4)
#print(json_object)
  
json_object_read = json.loads(json_object)
target_name=labels[0]["Name"]
target_conf=labels[0]["Confidence"]
#print(target_name)
#print(target_conf)

labels_dict = {}

labels_dict["ID"] = str(target_name)
labels_dict["Conf"] = str(target_conf)

print(labels_dict )





