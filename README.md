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
|:-----------------------:|:------:|:------------------------------------:|:--------------------------------:|
| add-measurement         | GET    | @JSON (streaming API format) data    | Adds measurements to the stores and calculates defined stream aggregates. |
| add-measurement		  | POST   | Same as with GET					  | Same as with GET |

### QMiner
Namespace: ```/qm/```

### Model
Namespace: ```/model/```

Currently not implemented.


## Streaming API format
