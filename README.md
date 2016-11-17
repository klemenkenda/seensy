# seensy
Energy related stream processing engine.

[![Build Status](https://travis-ci.org/klemenkenda/seensy.svg)](https://travis-ci.org/klemenkenda/seensy)

## Installation


## Configuration


## Running

## API

### General
Namespace: (none)



### Data
Namespace: ```/data/```

| Function                | Method | Parameters                           | Description                      |
|:------------------------|:------:|:-------------------------------------|:---------------------------------|
| add-measurement         | GET/POST    | @JSON data                      | Adds measurements to the stores and calculates defined stream aggregates.     |
| add-measurement-update  | GET/POST   | @JSON data					      | Adds measurements to the stores, updates old values. No streaming aggregates. |
| add-measurement-no-control | GET | @ JSON data | TODO |
| get-aggregate-store-structure |
| get-current-aggregates |
| get-nodes |
| get-measurements |
| n-get-measurement |
| get-aggregate |
| n-get-aggregate |
| get-aggregates |
| n-get-aggregates |
| push-sync-stores |
| add |


### QMiner
Namespace: ```/qm/```

### Model
Namespace: ```/model/```

Currently not implemented.


## Streaming API format
