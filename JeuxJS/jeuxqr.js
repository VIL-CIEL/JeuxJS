class CQr {
    constructor() {
        this.question = '?';
        this.tempQuestion = '?';
        this.bonneReponse = '?';
        this.joueurs = new Array();
    }

    GetRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    };

    TraiterReponse(wsClient, message) {
        var mess = JSON.parse(message);
        var indexjoueur = this.joueurs.findIndex(function (j) {
            return j.nom === mess.nom;
        });

        if (mess.nom != '') {
            if (indexjoueur == -1) {

                var nJoueur = {
                    nom: mess.nom,
                    score: 0,
                    ws: wsClient
                };

                this.joueurs.push(nJoueur);
                indexjoueur = this.joueurs.findIndex(function (j) {
                    return j.nom === mess.nom;
                });
                this.EnvoyerResultatDiff();
            }
            if (mess.reponse == this.bonneReponse) {
                this.joueurs[indexjoueur].score += 1;
                this.question = 'Bonne reponse de ' + mess.nom;
                this.EnvoyerResultatDiff();
                setTimeout(() => {  //affichage de la question 3s après 
                    this.NouvelleQMult();
                }, 1000);
            }
            else {
                this.tempQuestion = this.question;
                this.question = 'Mauvaise reponse de ' + mess.nom;
                this.EnvoyerResultatDiff();
                setTimeout(() => {  //affichage de la question 3s après 
                    this.question = this.tempQuestion;
                    this.EnvoyerResultatDiff();
                }, 1000);
            }

        }
        else {
            this.tempQuestion = this.question;
            this.question = 'Aucun nom renseigné';
            this.EnvoyerResultatDiff();
            setTimeout(() => {  //affichage de la question 3s après 
                this.question = this.tempQuestion;
                this.EnvoyerResultatDiff();
            }, 1000);
        }

    };

    NouvelleQMult() {
        var x = this.GetRandomInt(11);
        var y = this.GetRandomInt(11);
        this.question = x + '*' + y + ' =  ?';
        this.bonneReponse = x * y;
        this.EnvoyerResultatDiff();
    };

    NouvelleQBase2to10() {
        var rInt = this.GetRandomInt(255);
        var b2 = this.ConvB2(rInt);
        this.question = 'Convertir ' + b2 + ' en base 10';
        this.bonneReponse = rInt;
        this.EnvoyerResultatDiff();
    };
    ConvB2(nmbr) {
        var b = '';
        while (nmbr > 0) {
            b += nmbr % 2;
            nmbr = Math.floor(nmbr / 2);
        }
        let reversed = '';
        for (let i = b.length - 1; i >= 0; i--) {
            reversed += b[i];
        }
        return reversed;
    }


    // Envoyer a tous les joueurs un message comportant les resultats du jeu 
    EnvoyerResultatDiff() {
        // recopie des joueurs dans un autre tableau joueursSimple sans ws 
        var joueursSimple = new Array;
        this.joueurs.forEach(function each(joueur) {
            joueursSimple.push({
                nom: joueur.nom,
                score: joueur.score
            });
        });

        var messagePourLesClients = {
            joueurs: joueursSimple,
            question: this.question
        };

        // broadcast aux joueurs connectés; 
        this.joueurs.forEach(function each(joueur) {
            if (joueur.ws != undefined) {
                joueur.ws.send(JSON.stringify(messagePourLesClients), function
                ack(error) {
                    console.log('    -  %s-%s', joueur.ws._socket._peername.address,
                        joueur.ws._socket._peername.port);
                    if (error) {
                        console.log('ERREUR websocket broadcast : %s',
                            error.toString());
                    }
                });
            }
        });
    } 

    Deconnecter(ws) {
        var indexjoueur = this.joueurs.findIndex(function (j) {
            return j.ws === ws;
        });
        if (indexjoueur != -1) {
            this.joueurs[indexjoueur].ws = undefined;
        }
    }
}

module.exports = CQr;