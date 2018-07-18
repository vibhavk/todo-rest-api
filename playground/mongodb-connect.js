const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,client)=>{
    if(err){
       return console.log('Unable to connect');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');
    // db.collection('Todos').insertOne({
    //     text:'Something to do',
    //     completed: false
    // },(err,result)=>{
    //     if(err){
    //         return console.log('Unable to insert todo', err);
    //     }
    //     console.log(JSON.stringify(result.ops,undefined,2));
    // });

    // db.collection('Users').insertOne({
    //     name:'Leroy',
    //     age:'26',
    //     location:'Budapest',
    // },(err,result)=>{
    //     if(err){
    //         return console.log('Unable to register user to database', err);
    //     }
    //     console.log(result.ops[0]._id.getTimestamp());
    // });

    client.close();
});