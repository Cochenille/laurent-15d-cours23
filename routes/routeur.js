'use strict';

var express = require('express');
var routeur = express.Router();
var url_base = "http://localhost:8090";
//Importation de modèle Personne
var PersonneModel = require('../models/personneModel.js').Personne;
//ORM Mongoose
var mongoose = require('mongoose');
// Connexion à MongoDB avec Mongoose
mongoose.connect('mongodb://localhost:27017/HATEOAS-demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});


// Exemple de endpoint pour un objet unique avec HATOEAS
routeur.route('/personnes/:personne_id').get(function(req, res){

    console.log('consultation de la personne no.' + req.params.person_id);
        PersonneModel.findById(req.params.personne_id, function (err, personne) {
            if (err) throw err;
            if (personne){
            //en passant le tableau de links en paramètre, express-hateoas-links s'occupera de créer le champs 'Links' dans la réponse
                res.json(personne,[
                    { rel: "self", method: "GET", href: "http://localhost:8090/personnes/"+personne._id.toString() },
                    { rel: "delete", method: "DELETE", title: "Create Personne", href: "http://localhost:8090/personnes/"+personne._id.toString()}
                    ]);
            }
            else res.status(404).end();

        });
});


// Exemple HATOEAS pour une collection
routeur.get('/personnes', function(req, res){

    PersonneModel.find({},function(err,personnes){
        PersonneModel.find({}, function (err, personnes) {
            
            var resBody = [];
            personnes.forEach(personne => {
                //C'Est ici qu'on inclut les hyperliens que l'on souhaite joindre à chaque élément de la collection
                var links =[
                    {rel: "self",method: "GET",href: "http://localhost:8090/personnes/"+personne._id.toString()},
                    {rel: "delete",method: "DELETE",href: "http://localhost:8090/personnes/"+personne._id.toString()}
                ];
                var personToJson = personne.toJSON();
                var personnesAvecLink = {
                    person : personToJson,
                    links
                };
                resBody.push(personnesAvecLink);
            });
            if (err) throw err;
            res.json(resBody);
        });
    }); 
});





// express route to process the person creation
routeur.post('/personne', function(req, res){
    console.log('création d\'une personne');
    //création du modèle à partir du body de la requête
    var nouvellePersonne = new PersonneModel(req.body);
    //on sauvegarde dans la BD
    nouvellePersonne.save(function (err) {
        if (err) throw err;
        res.location(url_base+'/personnes/'+nouvellePersonne._id.toString());
        //si la sauvegarde fonctionne, on retourne 201 et on met le nouveau pokemon dans le body de la réponse
        res.status(201).json(nouvellePersonne,{rel: "self",method: "GET",href: "http://localhost:8090/personnes/"+nouvellePersonne._id.toString()},
        {rel: "delete",method: "DELETE",href: "http://localhost:8090/personnes/"+nouvellePersonne._id.toString()} );
    });
});

//En exportant l'objet routerAPI nous pourrons l'utiliser en dehors de ce fichier
module.exports = routeur;