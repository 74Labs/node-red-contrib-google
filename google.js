module.exports = function(RED) {

    "use strict";

    function encodeAPI(name, version) {
        return name + ':' + version;
    }

    function decodeAPI(api) {
        var a = api.split(':', 2);
        return {
            name: a[0],
            version: a[1]
        };
    }

    var google = require('googleapis');
    var discovery = google.discovery('v1');

    RED.httpAdmin.get('/google/apis', function(req, res) {
        discovery.apis.list({
            fields: "items(name,version)"
        }, function(err, data) {
            var response = [];
            data.items.forEach(function(v) {
                response.push(encodeAPI(v.name, v.version));
            });
            response.sort();
            res.json(response);
        });
    });

    RED.httpAdmin.get('/google/apis/:api/info', function(req, res) {

        var api = decodeAPI(req.params.api);

        discovery.apis.getRest({
            api: api.name,
            version: api.version,
            fields: "auth,methods,resources"
        }, function(err, data) {

            if (err) {
              return res.status(500).json(err);
            }

            var response = {
                operations: [],
                scopes: []
            };

            function processResources(d, parent) {
                var prefix = parent ? parent + '.' : '';
                if (d.methods) {
                    Object.keys(d.methods).forEach(function(k) {
                        response.operations.push(prefix + k);
                    });
                }
                if (d.resources) {
                    Object.keys(d.resources).forEach(function(k) {
                        processResources(d.resources[k], k);
                    });
                }
            }

            processResources(data);

            response.operations.sort();
            response.scopes = Object.keys(data.auth.oauth2.scopes);

            res.json(response);

        });
    });

    function GoogleConnectionNode(config) {
        var auth = null;
        RED.nodes.createNode(this, config);
        this.key = JSON.parse(config.key);
        this.scopes = config.scopes;
        this.getAuth = function() {
          if(!auth) {
            auth = new google.auth.JWT(
                this.key.client_email,
                null,
                this.key.private_key,
                this.scopes.split('\n'),
                null
            );
          }
          return auth;
        };
    }

    function GoogleNode(config) {

        RED.nodes.createNode(this, config);
        var node = this;
        node.config = RED.nodes.getNode(config.google);
        node.api = config.api;
        node.operation = config.operation;
        node.scopes = config.scopes;

        node.on('input', function(msg) {

            node.status({
                fill: 'blue',
                shape: 'dot',
                text: 'pending'
            });

            // var jwt = new google.auth.JWT(
            //     node.config.client_email,
            //     null,
            //     node.config.private_key,
            //     node.scopes.split('\n'),
            //     null
            // );

            var auth = node.config.getAuth();

            var api = decodeAPI(node.api);
            api = google[api.name]({
                version: api.version,
                auth: auth
            });

            auth.authorize(function(err, tokens) {

                if (err) {
                    node.status({
                        fill: 'red',
                        shape: 'dot',
                        text: 'error'
                    });
                    node.error(err);
                    return;
                }

                var props = node.operation.split('.');
                var operation = api;
                props.forEach(function(val) {
                    operation = operation[val];
                });

                operation(msg.payload, function(err, res) {

                    if (err) {
                        node.status({
                            fill: 'red',
                            shape: 'dot',
                            text: 'error'
                        });
                        node.error(err);
                        return;
                    }

                    node.status({
                        fill: 'yellow',
                        shape: 'dot',
                        text: 'success'
                    });

                    msg.payload = res;

                    node.send(msg);
                });
            });

        });
    }

    RED.nodes.registerType("google-conn", GoogleConnectionNode);
    RED.nodes.registerType("google", GoogleNode);

};
