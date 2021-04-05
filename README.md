# Generic Google API Client for Node-RED using OAuth2

Node-RED node for Google APIs.

This Node is based on the implementation by [74Labs](https://github.com/74Labs/node-red-contrib-google). It has been updated to use the latest version of the __googleapis__. Further the authorization workflows has been changed to __OAuth2__.

## Features

This node is a wrapper for official Google APIs Node.js Client: [google-api-nodejs-client](https://github.com/google/google-api-nodejs-client).

List of available APIs are delivered online via [Google API Discovery Service](https://developers.google.com/discovery/).

Package contains two nodes. There is configuration node made for maintaining connection to Google API Services (_google-credentials_) and regular node providing posibility to call any method of any API exposed via official Google's Node.js Client.

## How to Install

Run the following command in the root directory of your Node-RED install

```
npm install node-red-contrib-google-oauth2
```

or for a global installation
```
npm install -g node-red-contrib-google-oauth2
```

## Configuration

1. Generate OAuth credentials at [Google API Console](https://console.developers.google.com/apis/credentials/oauthclient).

  * Choose Web Application.
  * As `Authorized JavaScript origins` enter your Node-RED IP (_e.g. `http://localhost:1880`_)
  * As `Authorized redirect URIs` enter your Node-RED IP plus `/google-credentials/auth/callback` (_e.g. `http://localhost:1880/google-credentials/auth/callback`_)

2. Copy the `Client ID` and `Client secret` and paste them into the Config Node
