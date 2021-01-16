var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});


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
                "name": country.name.common,
                "languages": country.languages,
                "area": country.area
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

router.get('/in-europe', function(req, res, next) {
    var db = req.db;
    var params = {
        TableName : "Countries",
        KeyConditionExpression: "#regionKey = :regionVal",
        ExpressionAttributeNames:{
            "#regionKey": "region"
        },
        ExpressionAttributeValues: {
            ":regionVal": "Europe"
        }
    };
    req.dbClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            data.Items.forEach(function(item) {
                console.log(" -", item.year + ": " + item.title);
            });
        }

        res.render('in-europe', { 
            title: 'Pays européens',
            'pays': data
        });
    });

});

router.get('/in-africa', function(req, res, next) {
    var db = req.db;
    var params = {
        TableName : "Countries",
        KeyConditionExpression: "#regionKey = :regionVal",
        ExpressionAttributeNames:{
            "#regionKey": "region"
        },
        ExpressionAttributeValues: {
            ":regionVal": "Africa"
        }

    };
    req.dbClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            data.Items.forEach(function(item) {
                console.log(item);
            });
        }

        res.render('in-africa', { 
            title: 'Pays africains triés par superficie',
            'pays': data
        });
    });

});

module.exports = router;
