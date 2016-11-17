# seensy
Energy related stream processing engine.

[![Build Status](https://travis-ci.org/klemenkenda/seensy.svg)](https://travis-ci.org/klemenkenda/seensy)

## Installation


## Configuration

### Stream Aggregates

## Running



## API

### General
Namespace: (none)



### Data
Namespace: ```/data/```

| Function                      | Method	| Parameters                           | Description                      |
|:------------------------------|:---------:|:-------------------------------------|:---------------------------------|
| add-measurement               | GET/POST	| @JSON data						   | Adds measurements to the stores and calculates defined stream aggregates.     |
| add-measurement-update        | GET/POST	| @JSON data					       | Adds measurements to the stores, updates old values. No streaming aggregates. |
| add-measurement-no-control    | GET		| @JSON data						   | TODO |
| get-aggregate-store-structure | GET		| (none)							   | Returns aggregate store structure definition (JSON) for the current configuration. |	
| get-current-aggregates		| GET		| @string sensorName				   | Returns current aggregates (JSON) for a sensor. |
| get-nodes						| GET		| (none)							   | Returns list of all nodes. |
| get-measurements				| GET		| @string sensorName, @mysql-date startDate, @mysql-data endDate | Returns measurements for a selected sensor. |
| n-get-measurement				| GET		| @string sensorNames (delimited by comma), @mysql-date startDate, @mysql-data endDate | Returns measurements for selectd sensors. |
| get-aggregate					| GET		|
| n-get-aggregate				| GET		|
| get-aggregates				| GET		|
| n-get-aggregates				| GET		| 
| push-sync-stores				| GET		| (not documented)					   |
| add							| GET		| 


### QMiner
Namespace: ```/qm/```

### Model
Namespace: ```/model/```

Currently not implemented.


## Streaming API format
