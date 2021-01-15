var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/create-table', function(req, res, next) {
    var db = req.db;
    var params = {
        TableName : "Countries",
        KeySchema: [       
            { AttributeName: "region", KeyType: "HASH"},  //Partition key
            { AttributeName: "name", KeyType: "RANGE" }  //Sort key
        ],
        AttributeDefinitions: [       
            { AttributeName: "region", AttributeType: "S" },
            { AttributeName: "name", AttributeType: "S" }
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 10, 
            WriteCapacityUnits: 10
        }
    };
    
    db.createTable(params, function(err, data) {
        var table_result = '';
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
            table_result = 'Unable to create table. Error JSON.';
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
            table_result = 'Created table. Table description JSON.';
        }
        res.render('create-table', { 
            title: 'Création de la table',
            'table_result': table_result
        });
    });
});

/* GET home page. */
router.get('/insert-data', function(req, res, next) {
    var db = req.db;
    var table_result = '';
    var allCountries = JSON.parse(fs.readFileSync('./src/countries.json', 'utf8'));
    allCountries.forEach(function(country) {
        table_result = '';
        var params = {
            TableName: "Countries",
            Item: {
                "region":  country.region,
                "name": country.name.official,
                "info":  country.info,
                "tld": country.tld,
                "cca2": country.cca2,
                "ccn3": country.ccn3,
                "cca3": country.cca3,
                "cioc": country.cioc,
                "independant": country.independant,
                "status": country.status,
                "unMember": country.unMember,
                "currencies": country.currencies,
                "idd": country.idd,
                "capital": country.capital,
                "altSpellings": country.altSpellings,
                "subregion": country.subregion,
                "languages": country.languages,
                "translations": country.translations,
                "latlng": country.latlng,
                "landlocked": country.landlocked,
                "borders": country.borders,
                "area": country.area,
                "flag": country.flag,
                "demonyms": country.demonyms
            }
        };
        
        req.dbClient.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add country", country.title, ". Error JSON:", JSON.stringify(err, null, 2));
                table_result = "Unable to add country" + country.title;
            } else {
                console.log("PutItem succeeded:", country.title);
                table_result = "PutItem succeeded:" + country.title;
            }
        });
    });
    res.render('insert-data', { 
        title: 'Insertion des données',
        'table_result': table_result
    });
});

module.exports = router;
