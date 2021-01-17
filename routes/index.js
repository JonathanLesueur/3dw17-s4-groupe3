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
            table_result: table_result
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
        table_result: table_result
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
        }

        res.render('in-europe', { 
            title: 'Pays européens',
            pays: data
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
        }

        res.render('in-africa', { 
            title: 'Pays africains triés par superficie',
            pays: data
        });
    });

});

router.get('/dutch', function(req, res, next) {
    var db = req.db;
    var params = {
        TableName : "Countries",
        KeyConditionExpression: "#languagesKey = :languagesVal",
        ExpressionAttributeNames:{
            "#languagesKey": "languages.nld"
        },
        ExpressionAttributeValues: {
            ":languagesVal": "Dutch"
        }
    };
    req.dbClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
        }

        res.render('dutch', { 
            title: 'Pays parlant le néerlandais',
            pays: data
        });
    });

});

router.get('/between-area', function(req, res, next) {
    var db = req.db;
    var params = {
        TableName : "Countries",
        FilterExpression: "#area BETWEEN :s1 AND :s2",
        ExpressionAttributeNames: {
            "#area": "area",
        },
        ExpressionAttributeValues: {
             ":s1": 400000,
             ":s2": 500000 
        }
    };
    req.dbClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
        }

        res.render('between-area', { 
            title: 'Superficie entre 400 000 et 500 000km²',
            pays: data
        });
    });

});


router.get('/start-with', function(req, res, next) {
    var db = req.db;
    var letter = "D";
    var params = {
        TableName : "Countries",
        FilterExpression: "begins_with(#name,:letter)",
        ExpressionAttributeNames: {
            "#name": "name",
        },
        ExpressionAttributeValues: {
             ":letter": letter
        }
    };
    req.dbClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
        }

        res.render('start-with', { 
            title: 'Pays commençants par la lettre '+ letter,
            pays: data
        });
    });

});

module.exports = router;
