module.exports = function(RED) {
    "use strict";
    const crypto = require("crypto");
    const url = require('url');
    const { google } = require('googleapis');

    function GoogleNode(n) {
        RED.nodes.createNode(this,n);
        this.displayName = n.displayName;
        this.scopes = n.scopes;
    }
    RED.nodes.registerType("google-credentials",GoogleNode,{
        credentials: {
            displayName: {type:"text"},
            clientId: {type:"text"},
            clientSecret: {type:"password"},
            accessToken: {type:"password"},
            refreshToken: {type:"password"},
            expireTime: {type:"password"}
        }
    });

    RED.httpAdmin.get('/google-credentials/auth', function(req, res){
        console.log('google-credentials/auth');
        if (!req.query.clientId || !req.query.clientSecret ||
            !req.query.id || !req.query.callback) {
            res.send(400);
            return;
        }
        const node_id = req.query.id;
        const callback = req.query.callback;
        const credentials = {
            clientId: req.query.clientId,
            clientSecret: req.query.clientSecret
        };
        const scopes = req.query.scopes;

        const csrfToken = crypto.randomBytes(18).toString('base64').replace(/\//g, '-').replace(/\+/g, '_');
        credentials.csrfToken = csrfToken;
        credentials.callback = callback;
        res.cookie('csrf', csrfToken);
        res.redirect(url.format({
            protocol: 'https',
            hostname: 'accounts.google.com',
            pathname: '/o/oauth2/auth',
            query: {
                access_type: 'offline',
                approval_prompt: 'force',
                scope: scopes,
                response_type: 'code',
                client_id: credentials.clientId,
                redirect_uri: callback,
                state: node_id + ":" + csrfToken,
            }
        }));
        RED.nodes.addCredentials(node_id, credentials);
    });

    RED.httpAdmin.get('/google-credentials/auth/callback', function(req, res) {
        console.log('google-credentials/auth/callback');
        if (req.query.error) {
            return res.send("google.error.error", {error: req.query.error, description: req.query.error_description});
        }
        var state = req.query.state.split(':');
        var node_id = state[0];
        var credentials = RED.nodes.getCredentials(node_id);
        if (!credentials || !credentials.clientId || !credentials.clientSecret) {
            console.log("credentials not present?");
            return res.send("google.error.no-credentials");
        }
        if (state[1] !== credentials.csrfToken) {
            return res.status(401).send("google.error.token-mismatch");
        }

        const oauth2Client = new google.auth.OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            credentials.callback
        );

        oauth2Client.getToken(req.query.code)
        .then((value) => {
            credentials.accessToken = value.tokens.access_token;
            credentials.refreshToken = value.tokens.refresh_token;
            credentials.expireTime = value.tokens.expiry_date;
            credentials.tokenType = value.tokens.token_type;
            credentials.displayName = value.tokens.scope.substr(0, 40);

            delete credentials.csrfToken;
            delete credentials.callback;
            RED.nodes.addCredentials(node_id, credentials);
            res.send('Authorized');
        })
        .catch((error) => {
            return res.send('Could not receive tokens');
        });
    });
};