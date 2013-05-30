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
postmongo=function(parm,cb,err){ // object with connection parameters, see code for details
	//parm={
	//	server:'https://postmongo.herokuapp.com', // localhost port 1337, heroku foreman port 5000
	//	u:'username',
	//	p:'password',
	//	url:'dharma.mongohq.com', // url of mongod service, for example, mondbhq.com's
	//	port:'10014', // that would be the case of mongodbhq service, the default port is 27017
	//	db:'database', // the database targetted by this connection
	//}

	// Process initial parameters
	if(!parm){parm={}};
	this.parm = parm ;
	// mininal defaults
	this.parm.server = this.parm.server || 'http://localhost:1337'; // default action is server in the localhost
	this.parm.url = this.parm.url || 'localhost'; // mongod address
	this.parm.port = this.parm.port || '27017'; // default mongod port
	this.parm.db = this.parm.db || 'test';  // default mongodb database
	// notify no authentication
	if(!this.parm.u){console.log('no username provided')}
	if(!this.parm.p){console.log('no password provided')}

	// Assemble connection string
	this.connector=this.parm.server+'/?url='+this.parm.url+'&port='+this.parm.port+'&db='+this.parm.db;
	if(!!this.parm.u){this.connector += '&u='+this.parm.u};
	if(!!this.parm.p){this.connector += '&p='+this.parm.p};
	if(!this.parm.dt){this.parm.dt={}};

	// Connect
	if(!cb){cb=function(r){console.log(r)}}
	if(!this.parm.dt.exe){this.parm.dt.exe='res.end(JSON.stringify(dt));client.close()'}
	this.res = jQuery.post(this.connector,JSON.stringify(this.parm.dt),cb);
	// MONGO client commands
	this.exe=function(cmd,cb,dt){
		if(!cb){cb=function(x){console.log(x)}};
		if(!dt){dt={}};
		return postmongo.exe(cmd,cb,dt,this.connector)
	};
	this.showCollections=function(cb){ // mongo: "show collections", callback function is teh sole input
		if(!cb){cb=function(x){console.log(JSON.parse(x))}};
		this.exe('client.collectionNames(function(error,names){dt.names=names;res.end(JSON.stringify(dt.names));client.close();});',cb);
	};
	//this.colFind=function(col,q,cb){  // equivalent to mongo's db.col.find(q)
	//		// code missing here to make sure col collection exists and create otherwise
	//		if(!cb){cb=function(x){console.log(x)}};
	//		this.exe('client.collection("'+col+'",function(error,collection){dt.docs=collection.find('+q+')//;log(dt.docs);res.end();client.close();});',cb);
	//	}
	this.colFind=function(col,q,cb){  // equivalent to mongo's db.col.find(q)
			// code missing here to make sure col collection exists and create otherwise
			if(!cb){cb=function(x){console.log(x)}};
			//this.exe('log(client.collection("lala"));res.end();client.close();',cb);
			this.exe('client.collection("'+col+'",function(err,col){col.find('+q+').toArray(function(err,docs){res.end(JSON.stringify(docs));client.close()})});',cb);
		}



	/*
	this.col={
		find:function(col,q,cb){  // equivalent to mongo's db.col.find(q)
			// code missing here to make sure col collection exists and create otherwise
			if(!cb){cb=function(x){console.log(JSON.parse(x))}};
			this.exe('client.collection("'+col+'",function(error,collection){dt.docs=collection('+q+');res.end(JSON.stringify(dt.docs));client.close();});',cb);
		},
		save:function(col,dtArray,cb){  // equivalent to mongo's db.col.save
			// code missing here to make sure col collection exists and create otherwise
			if(!cb){cb=function(x){console.log(JSON.parse(x))}};
			// ...
		}


	}
	*/


//	this.exe=function(cmd){ // command to be executed
//		var cmd = this
//		this.parm.dt.exe=cmd;
//		this
//		console.log('executing ',cmd);
//	};
	if(!postmongo.dbs){postmongo.dbs={}}; // keep track of connections in the template object
	postmongo.dbs[this.connector]=this; // 
	postmongo.dbi=this.connector; // keep track of current db

	

}

postmongo.exe=function(cmd,cb,dt,db){ // command to be executed, callback on dt result, data to be used (dt), and target database 
	if(!db){db = postmongo.dbi} // default is current
	if(typeof(db)=='string'){db=postmongo.dbs[db]};
	if(!!dt){db.parm.dt=dt}; // if dt is provided, use it
	var parm = db.parm;
	parm.dt.exe=cmd;
	// ready for action
	return new postmongo(parm,cb);
}


// 1. by passing parameter values with the URL
// x=jQuery.post('http://localhost:1337/?u=workshop&p=informatics&url=dharma.mongohq.com&port=10014&db=tcgaBoard&exe=console.log(dt)',JSON.stringify({x:[1,2,3]}),function(r){console.log(r)})
// 2. by including a .parm structure in the POSTed data
// x=jQuery.post('http://localhost:1337/tcgaBoard',JSON.stringify({parm:{"u":"workshop","p":"informatics","url":"dharma.mongohq.com","port":"10014","db":"lala","exe":"console.log(dt)"}}),function(r){console.log(r)})


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

// a = new postmongo(parm,function(x){res=JSON.parse(x);console.log(res)})



//x=jQuery.post('http://localhost:1337/tcgaBoard',JSON.stringify({parm:{"u":"workshop","p":"informatics","url":"dharma.mongohq.com","port":"10014","db":"lala","eval":"console.log(dt)"}}),function(r){console.log(r)})
