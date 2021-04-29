//ORM Mongoose
var mongoose = require('mongoose');


//création du schéma pokemon
var personneSchema = new mongoose.Schema({
    name: String,
    jobTitle : String,
    telephone : String
});

// Crée le modèle à partir du schéma et l'Exporte pour pouvoir l'utiliser dans le reste du projet
module.exports.Personne = mongoose.model('Personne',personneSchema);