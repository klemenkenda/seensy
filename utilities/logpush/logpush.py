# dependancy on Requests
# pip install requests

# imports
import os
import requests
import urllib

# configuration
config = {};
config["dir"] = "logs/";
config["dsLocation"]  = "http://localhost:9611";
config["dsRequest"] = "/data/add-measurement/";

print("Starting streaming ...");

# list files in the log file directory
fList = os.listdir(config["dir"]);

def streamLog(fName):
    print("\n\nStreaming: " + fName);
    size = os.path.getsize(fName);
    f = open(fName);

    i = 0;

    for line in f:
        try:
            i = i + len(line);
            line.rstrip();
            # line = line[:55000];
            # line = '[{"node":{"id":"miren-traffic-kromberk-0209-11","name":"miren-traffic-kromberk11","subjectid":"miren-traffic-kromberk-0209-11","lat":45.957808,"lng":13.663796,"measurements":[{"sensorid":"miren-traffic-kromberk-0209-11-circulation","value":"24","timestamp":"2014-12-28T03:47:18.000","type":{"id":"traffic_circulation","name":"traffic_circulation","phenomenon":"traffic_circulation","UoM":"vehicles/h"}},{"sensorid":"miren-traffic-kromberk-0209-11-gap","value":"161.4","timestamp":"2014-12-28T03:47:18.000","type":{"id":"traffic_gap","name":"traffic_gap","phenomenon":"traffic_gap","UoM":"seconds"}},{"sensorid":"miren-traffic-kromberk-0209-11-speed","value":"79","timestamp":"2014-12-28T03:47:18.000","type":{"id":"traffic_speed","name":"traffic_speed","phenomenon":"traffic_speed","UoM":"km/h"}}]}},{"node":{"id":"miren-traffic-kromberk-0209-21","name":"miren-traffic-kromberk21","subjectid":"miren-traffic-kromberk-0209-21","lat":45.957808,"lng":13.663796,"measurements":[{"sensorid":"miren-traffic-kromberk-0209-21-circulation","value":"36","timestamp":"2014-12-28T03:47:18.000","type":{"id":"traffic_circulation","name":"traffic_circulation","phenomenon":"traffic_circulation","UoM":"vehicles/h"}},{"sensorid":"miren-traffic-kromberk-0209-21-gap","value":"95.2","timestamp":"2014-12-28T03:47:18.000","type":{"id":"traffic_gap","name":"traffic_gap","phenomenon":"traffic_gap","UoM":"seconds"}},{"sensorid":"miren-traffic-kromberk-0209-21-speed","value":"71","timestamp":"2014-12-28T03:47:18.000","type":{"id":"traffic_speed","name":"traffic_speed","phenomenon":"traffic_speed","UoM":"km/h"}}]}}]'            
            print(str(i) + " / " + str(size) + "\r");
            # TODO:
            #   Split JSON into chunks - maybe by node, or even by sensor and push it multiple times
            #   Altenatively - force NodeJS to accept GET requests larger than 80kb
            r = requests.get(config["dsLocation"] + config["dsRequest"], { 'data': line });            
        except requests.exceptions.RequestException as e:
            print e;
        
    return;

for fName in fList:
    if os.path.isfile(config["dir"] + fName) == True:
        streamLog(config["dir"] + fName);