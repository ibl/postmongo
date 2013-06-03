#postmongo
- - -

Client-side javascript mongo. The goal is to enable a within-browser operation of mongodb with a syntax as close as possible as what is supported by mongodb's own mongo client application. 

Note postmongo relies exclusively on POST calls through node services such as postmongo.herokuapp.com. Therefore, those services provide a ***HTTP API to mongodb*** which is not RESTful. 

More important, note also that this project is a place holder for a safer and more elegant implementation by Alex Grüneberg's, based on his Ming client [https://bitbucket.org/agrueneberg/ming].

- - -
##Demo

1. load script from https://raw.github.com/ibl/postmongo/master/postmongo.js
2. open the browser console.
3. connect to local mongod
    db=new postmongo()
4. list contents of one of its collections with db.<some collection>.find()
5. now check the connection details for a remote library, kept in the variable "parm"
6. connect to that external mongodb with b = new postmongo(parm)
7. list entries in the collection patients with b.patient.find()