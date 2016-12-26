# Generic Google API Client for Node-RED

Node-RED node for Google APIs. 

## Work in Progress

Changes are coming.

Configuration node name was changed at v.0.1.0: _google conn_ -> _google-conn_

## Features

This node is a wrapper for official Google APIs Node.js Client: [google-api-nodejs-client](https://github.com/google/google-api-nodejs-client).

List of available APIs are delivered online via [Google API Discovery Service](https://developers.google.com/discovery/).

Package contains two nodes. There is configuration node made for maintaining connection to Google API Services (_google-conn_) and regular node providing posibility to call any method of any API exposed via official Google's Node.js Client.

## How to Install

Run the following command in the root directory of your Node-RED install

```
npm install node-red-contrib-google
```

or for a global installation
```
npm install -g node-red-contrib-google
```

## Using the Node

1. Generate service account key at [Google API Console](https://console.developers.google.com/apis/credentials/serviceaccountkey).

  * Choose JSON type and save service key file.
  * Paste content of that file into JSON Key field of your _google-conn_ node.
  
