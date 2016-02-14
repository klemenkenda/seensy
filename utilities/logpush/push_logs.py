# dependancy on Requests
# pip install requests

# imports
import os
import sys
import requests
import datetime
import urllib
import codecs

# configuration
config = {}
config["dir"] = "logs/"
config["dsLocation"]  = "http://localhost:9611"
config["dsRequest"] = "/data/add-measurement/"
headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

print("Starting streaming ...")

# list files in the log file directory
fList = os.listdir(config["dir"])
#fList.sort(key=lambda x: datetime.datetime.strptime(x.split('-')[1].split('.')[0], '%Y%m%d'))
fList.sort()

def streamLog(fName):
    print("\n\nStreaming: " + fName)
    size = os.path.getsize(fName)
    i = 0
    fe = open('invalid_requests.txt', 'w')
    with codecs.open(fName, 'Urb', encoding='utf-8') as f:
        for line in f:
            try:
                i = i + len(line)
                print(str(i) + " / " + str(size) + " " + str(round(float(i)/size, 3)*100) + "%")
                sys.stdout.flush()
                
                sline = line.strip()
                
                r = requests.post(config["dsLocation"] + config["dsRequest"], data=sline, headers=headers)
                if r.status_code <> 200:
                    fe.write(sline + '\n')
            except requests.exceptions.RequestException as e:
                print e
    
    fe.close()
    return

for fName in fList:
    if os.path.isfile(config["dir"] + fName) == True:
        streamLog(config["dir"] + fName)