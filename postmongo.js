// postmongo client javascript library
console.log('postmongo loaded');

if(!window.jQuery){ // load jQuery if not there already
	(function(){
		var s = document.createElement('script');
		s.src = "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js";
		document.head.appendChild(s);
		console.log('jQuery added to the document head');
	})()
}

// connection specific components
postmongo=function(db_parm,cb0,err){ // object with connection parameters, see code for details
	// Process initial parameters
	if(!db_parm){db_parm={}};
	this.db_parm = db_parm ;
	// mininal defaults
	this.db_parm.server = this.db_parm.server || 'http://localhost:1337'; // default action is server in the localhost
	this.db_parm.url = this.db_parm.url || 'localhost'; // mongod address
	this.db_parm.port = this.db_parm.port || '27017'; // default mongod port
	this.db_parm.db = this.db_parm.db || 'test';  // default mongodb database
	
	// check for parms in db, which can be used to transmit url and port
	if(!!this.db_parm.db.match(/[\/\:]/g)){
		if(this.db_parm.db.match(/[\/\:]/g).length==2){
			this.db_parm.url=this.db_parm.db.match(/[^\:]+\:/g)[0].slice(0,-1);
			this.db_parm.port=this.db_parm.db.match(/\:[\d]+\//g)[0].slice(1,-1);
			this.db_parm.db=this.db_parm.db.match(/\/[^\/]+/g)[0].slice(1);
		}
	}


	// notify no authentication
	//if(!this.db_parm.u){console.log('no username provided')}
	//if(!this.db_parm.p){console.log('no password provided')}

	// Assemble connection string
	this.connector=this.db_parm.server+'/?url='+this.db_parm.url+'&port='+this.db_parm.port+'&db='+this.db_parm.db;
	if(!!this.db_parm.u){this.connector += '&u='+this.db_parm.u};
	if(!!this.db_parm.p){this.connector += '&p='+this.db_parm.p};
	if(!this.db_parm.dt){this.db_parm.dt={}};

	// Connect
	//if(!cb){cb=function(r){console.log(r)}}
	
	if(!cb0){
		cb0=function(r){ // default callback is to register collections as properties of this db
			//console.log(r);
			var db = postmongo.dbs[this.url]; // remember each db connected is tracked by the mothership
			db.showCollections(undefined,db);
			//db=postmongo.dbs[postmongo.dbi];
		}
		//this=postmongo.dbs[postmongo.dbi];
	}
	if(!this.db_parm.dt.exe){this.db_parm.dt.exe='res.end(JSON.stringify(dt));client.close()'}
	this.res = jQuery.post(this.connector,JSON.stringify(this.db_parm.dt),cb0);
	// MONGO client commands
	this.exe=function(cmd,exe_cb,dt){
		if(!dt){dt={}};
		return postmongo.exe(cmd,exe_cb,dt,this.connector)
	};
	this.showCollections=function(cbk,db){ // mongo: "show collections", callback function is teh sole input
		if(!db){db=this};
		this.exe('client.collectionNames(function(error,names){dt.names=names;res.end(JSON.stringify(dt.names));client.close();});',function(c){
					if(!cbk){cbk=function(x){console.log(x.map(function(xi){return xi.name}))}};
					c = JSON.parse(c);
					//db = postmongo.dbs[this.url]; // remember each db connected is tracked by the mothership
					postmongo.dbs[this.url]=db; // remember each db connected is tracked by the mothership
					if(!!db.col_names){// if they exist, clean them from database methods
						db.col_names.forEach(function(n){
							delete db[n];
						})
					}
					db.col_names=[];
					//console.log('Collections found:');
					c.forEach(function(ci){
						var cname=ci.name.match(/([^\.]+)\.(.*)/);
						db.db_name=cname[1]; // should be the same for all
						db.col_names.push(cname[2]);
						db[cname[2]]={col_name:cname[2]};
						// COLLECTION METHODS HERE //
						// move here all the methods associated with collections, such as find
						Object.getOwnPropertyNames(postmongo.col).forEach(function(m){ // for each method in postmongo.col
							db[cname[2]][m]=postmongo.col[m];
						});
						db[cname[2]].db=db; // this will come handy when collections are dropped
						//db[cname[2]].find=postmongo.col.find;
						//db[cname[2]].count=postmongo.col.count;
						//console.log(cname[2]); // list collections
					})
					cbk(c);
				});
	//this = postmongo.dbs[postmongo.dbi];
	};
	this.createCollection=function(col_name,cbk){
		var db = this;
		postmongo.exe('client.createCollection("'+col_name+'",function(err){res.end(JSON.stringify(err));client.close()});',function(x){
			db.showCollections(cbk);
		});
	};
	this.colFind=function(col,q,q_cb){  // equivalent to mongo's db.col.find(q)
			// code missing here to make sure col collection exists and create otherwise
			if(!q_cb){q_cb=function(x){console.log(x)}};
			//this.exe('log(client.collection("lala"));res.end();client.close();',cb);
			this.exe('client.collection("'+col+'",function(err,col){col.find('+q+').toArray(function(err,docs){res.end(JSON.stringify(docs));client.close()})});',q_cb);
		}

	if(!postmongo.dbs){postmongo.dbs={}}; // keep track of connections in the template object
	postmongo.dbs[this.connector]=this; // 
	postmongo.dbi=this.connector; // keep track of current db
}

postmongo.exe=function(cmd,cbk,dt,db){ // command to be executed, callback on dt result, data to be used (dt), and target database 
	if(!cbk){cbk=function(x){console.log(JSON.parse(x))}};
	if(!db){db = postmongo.dbi} // default is current
	if(typeof(db)=='string'){db=postmongo.dbs[db]};
	if(!!dt){db.db_parm.dt=dt}; // if dt is provided, use it
	var db_parm = db.db_parm;
	db_parm.dt.exe=cmd;
	// ready for action
	return new postmongo(db_parm,cbk);
}



// Methods assigned to each collection

postmongo.col={
	find:function(q,q_cb){
		if(typeof(q)!='string'){q=JSON.stringify(q)};
		postmongo.exe('client.collection("'+this.col_name+'",function(err,col){col.find('+q+').toArray(function(err,docs){res.end(JSON.stringify(docs));client.close()})});',q_cb);
	},
	findCount:function(q,q_cb){ // to mimick find().count() 
		if(typeof(q)!='string'){q=JSON.stringify(q)};
		postmongo.exe('client.collection("'+this.col_name+'",function(err,col){col.find('+q+').toArray(function(err,docs){res.end(JSON.stringify(docs.length));client.close()})});',q_cb);
	},
	count:function(q_cb){
		postmongo.exe('client.collection("'+this.col_name+'",function(err,col){col.find({}).toArray(function(err,docs){res.end(JSON.stringify(docs.length));client.close()})});',q_cb);
	},
	save:function(docs,cbk){
		postmongo.exe('client.collection("'+this.col_name+'",function(err,col){col.insert('+JSON.stringify(docs)+',{safe: true},function(err,docs){res.end(JSON.stringify(docs.map(function(di){return di._id})));client.close()})});',cbk);
	},
	drop:function(cbk){
		var db = this.db;
		postmongo.exe('client.dropCollection("'+this.col_name+'",function(err){res.end(JSON.stringify(err));client.close()});',function(x){
			db.showCollections(cbk);
		});
	}
	
}


// Utils

// 1. by passing parameter values with the URL
// x=jQuery.post('http://localhost:1337/?u=workshop&p=informatics&url=dharma.mongohq.com&port=10014&db=tcgaBoard&exe=console.log(dt)',JSON.stringify({x:[1,2,3]}),function(r){console.log(r)})
// 2. by including a .db_parm structure in the POSTed data
// x=jQuery.post('http://localhost:1337/tcgaBoard',JSON.stringify({db_parm:{"u":"workshop","p":"informatics","url":"dharma.mongohq.com","port":"10014","db":"lala","exe":"console.log(dt)"}}),function(r){console.log(r)})


// connection independent component


parm={
	server:'https://postmongo.herokuapp.com',
	u:"workshop",
	p:"informatics",
	url:"dharma.mongohq.com",
	port:"10014",
	db:"tcgaBoard",
	dt:{x:1,exe:'dt.y=dt.x+10;res.end(JSON.stringify(dt));client.close();'}
}

// a = new postmongo(db_parm,function(x){res=JSON.parse(x);console.log(res)})



//x=jQuery.post('http://localhost:1337/tcgaBoard',JSON.stringify({db_parm:{"u":"workshop","p":"informatics","url":"dharma.mongohq.com","port":"10014","db":"lala","eval":"console.log(dt)"}}),function(r){console.log(r)})
