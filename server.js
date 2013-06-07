// Server side of postmongo (https://github.com/iuab/postmongo), can also be used independently, POST only, as in the examples:
// 1. by passing parameter values with the URL
// x=jQuery.post('http://localhost:1337/?u=workshop&p=informatics&url=dharma.mongohq.com&port=10014&db=tcgaBoard&exe=console.log(dt)',JSON.stringify({x:[1,2,3]}),function(r){console.log(r)})
// 2. by including a .db_parm structure in the POSTed data
// x=jQuery.post('http://localhost:1337/tcgaBoard',JSON.stringify({db_parm:{"u":"workshop","p":"informatics","url":"dharma.mongohq.com","port":"10014","db":"lala","exe":"console.log(dt)"}}),function(r){console.log(r)})
// for documentation on commands supported by .exe see node's mongodb package information at
// http://mongodb.github.io/node-mongodb-native/

var mongodb = require("mongodb");
var http = require("http");
var corser = require("corser"); // Thank you Alex - this is great :-)!!!
var log = console.log;
var port = process.env.PORT || 1337;
log('POSTmongo served at port '+port);

// Create Corser request listener.
var corserRequestListener = corser.create();

http.createServer(function (req, res) {
    // Route req and res through the request listener.
    corserRequestListener(req, res, function () {
        if (req.method === "OPTIONS") {
            // End CORS preflight request.
            res.writeHead(204);
            res.end();
        } else {
            res.writeHead(200);
            var pmatch = req.url.match(/\/([^\?\&\=]+)/);
            if(!!pmatch){req.url='?db='+pmatch[1]}; 
            if(!req.url.match(/\?/)){req.url+='/?'};          
            var requrl=req.url.split('?');
            var db_parm={};
            requrl[1].split('&').forEach(function(p){var pp=p.split('=');db_parm[pp[0]]=pp[1]});
            var xx="";
            req.on('data',function(x){
                xx+=x; // accumulate the data here
            });
            req.on('end',function(){ // when all teh data is posted
                var dt=JSON.parse(xx);
                if(!!dt.db_parm){ // import parameters from data, if they exist
                    for(var pr in dt.db_parm){
                        if(!db_parm[pr]){db_parm[pr]=dt.db_parm[pr]}
                    }
                }
                var MONGOHQ_URL='mongodb://'
                if(!!db_parm.u){MONGOHQ_URL+=db_parm.u+':'+db_parm.p+'@'};
                if(!db_parm.port){db_parm.port='27017'};
                if(!db_parm.db){db_parm.db='test'};
                if(!db_parm.url){db_parm.url='localhost'};
                MONGOHQ_URL+=db_parm.url+':'+db_parm.port+'/'+db_parm.db;
                mongodb.Db.connect(MONGOHQ_URL, function(error, client) {
                    dt.io={};
                    if(!error){
                        dt.io.connect=true; 
                        try{
                            eval(dt.exe);
                            dt.io.eval=true
                        }
                        catch(err){log('eval error:'+err);dt.io.evalErr=err.message};
                        //client.close(); -> this needs to be part of dt.exe
                    }
                    else {log(error);dt.io.connectError=error};
                    log(Date(),MONGOHQ_URL); //<-- console log 
                    //res.end(JSON.stringify(dt)); -> this needs to be part of dt.exe
                });
                
                //res.end("\n=====TheEnd=====\n");    
            }); 
        }
    });
}).listen(port);
