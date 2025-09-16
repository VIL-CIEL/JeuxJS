var ipServeur = location.hostname;     // Adresse ip du serveur  
var ws;                             // Variable pour l'instance de la WebSocket.

window.onload = function () {
    if (TesterLaCompatibilite()) {
        ConnexionAuServeurWebsocket();
    }
    ControleIHM();
};

function TesterLaCompatibilite() {
    let estCompatible = true;
    if (!('WebSocket' in window)) {
        window.alert('WebSocket non support� par le navigateur');
        estCompatible = false;
    }
    return estCompatible;
};

/*  ***************** Connexion au serveur WebSocket ********************   */
// 
function ConnexionAuServeurWebsocket() {
    ws = new WebSocket('ws://' + ipServeur + '/qr');

    ws.onclose = function (evt) {
        window.alert('WebSocket close');
    };

    ws.onopen = function () {
        console.log('WebSocket open');
    };

    ws.onmessage = function (evt) {
        var mess = JSON.parse(evt.data);
        document.getElementById('messageRecu').value = mess['question'];
        document.getElementById('resultats').textContent = JSON.stringify(mess.joueurs);
    };
}


function ControleIHM() {
    document.getElementById('Envoyer').onclick = BPEnvoyer;
}

function BPEnvoyer() {
    ws.send(JSON.stringify({
        nom: document.getElementById('nom').value,
        reponse: document.getElementById('messageEnvoi').value
    }));
} 

