// Server side of postmongo (https://github.com/iuab/postmongo), can also be used independently, POST only, as in the examples:
// 1. by passing parameter values with the URL
// x=jQuery.post('http://localhost:1337/?u=workshop&p=informatics&url=dharma.mongohq.com&port=10014&db=tcgaBoard&exe=console.log(dt)',JSON.stringify({x:[1,2,3]}),function(r){console.log(r)})
// 2. by including a .parm structure in the POSTed data
// x=jQuery.post('http://localhost:1337/tcgaBoard',JSON.stringify({parm:{"u":"workshop","p":"informatics","url":"dharma.mongohq.com","port":"10014","db":"lala","exe":"console.log(dt)"}}),function(r){console.log(r)})
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
            var parm={};
            requrl[1].split('&').forEach(function(p){var pp=p.split('=');parm[pp[0]]=pp[1]});
            req.on('data',function(x){ // x is the data passed by the post call
                var dt=JSON.parse(x);
                if(!!dt.parm){ // import parameters from data, if they exist
                    for(var pr in dt.parm){
                        if(!parm[pr]){parm[pr]=dt.parm[pr]}
                    }
                }
                var MONGOHQ_URL='mongodb://'
                if(!!parm.u){MONGOHQ_URL+=parm.u+':'+parm.p+'@'};
                if(!parm.port){parm.port='27017'};
                if(!parm.db){parm.db='test'};
                if(!parm.url){parm.url='localhost'};
                MONGOHQ_URL+=parm.url+':'+parm.port+'/'+parm.db;
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
