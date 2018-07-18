const {MongoClient,ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,client)=>{
    if(err){
       return console.log('Unable to connect');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');
    // db.collection('Todos').findOneAndUpdate({text:'Eat mangoes'},
    // {$set:{completed:true}},{returnOriginal: false})
    //     .then((result)=> console.log(result));

    db.collection('Users').findOneAndUpdate({name:'Louis'},{
    $set:{name:'Louis the XVI'},
    $inc:{age:1}
    },
    {returnOriginal: false})
        .then((result)=> console.log(result));    
});