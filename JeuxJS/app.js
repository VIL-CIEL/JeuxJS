'use strict';
var Cjeuxqr = require('./jeuxqr.js');
// instanciation du jeux QR 
var jeuxQr = new Cjeuxqr; 

/*  *********************** Serveur Web ***************************   */
//
var express = require('express');
var exp = express();
exp.use(express.static(__dirname + '/www'));

exp.get('/', function (req, res) {
    console.log('Reponse a un client');
    res.sendFile(__dirname + '/www/qr.html');
});

exp.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Erreur serveur express');
});

/*  *************** serveur WebSocket express *********************   */
// 
var expressWs = require('express-ws')(exp);

// Connexion des clients à la WebSocket /echo et evenements associés 
exp.ws('/echo', function (ws, req) {

    console.log('Connection WebSocket %s sur le port %s',
        req.connection.remoteAddress, req.connection.remotePort);

    ws.on('message', function (message) {
        //message = ws._socket._peername.address + ws._socket._peername.port + ' : ' + message; 
        //aWss.broadcast(message);
        console.log('De %s %s, message :%s', req.connection.remoteAddress,
            req.connection.remotePort, message);
        ws.send(message);
    });

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s', 
        req.connection.remoteAddress, req.connection.remotePort);
        jeuxQr.Deconnecter(ws);
    }); 

});

/*  ****** Serveur web et WebSocket en ecoute sur le port 80  ********   */
//  
var portServ = 80;
exp.listen(portServ, function () {
    console.log('Serveur en ecoute');
});

/*  ****************** Broadcast clients WebSocket  **************   */
var aWss = expressWs.getWss('/echo');
var WebSocket = require('ws');
aWss.broadcast = function broadcast(data) {
    console.log("Broadcast aux clients navigateur : %s", data);
    aWss.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN) {
            client.send(data, function ack(error) {
                console.log("    -  %s-%s", client._socket.remoteAddress,
                    client._socket.remotePort);
                if (error) {
                    console.log('ERREUR websocket broadcast : %s', error.toString());
                }
            });
        }
    });
};

/*  *************** serveur WebSocket express /qr *********************   */
// 
exp.ws('/qr', function (ws, req) {

    console.log('Connection WebSocket %s sur le port %s', req.connection.remoteAddress,
        req.connection.remotePort);
    jeuxQr.NouvelleQMult();

    ws.on('message', TMessage);
    function TMessage(message) {
        jeuxQr.TraiterReponse(ws, message, req);
    }

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });

}); 