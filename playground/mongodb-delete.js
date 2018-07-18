const {MongoClient,ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,client)=>{
    if(err){
       return console.log('Unable to connect');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');
    // db.collection('Todos').deleteMany({text:'Eat mangoes'}).then((result)=>{
    //     console.log(result);
    // });

    //client.close();
    // db.collection('Todos').deleteOne({text:'Eat mangoes'}).then((result)=> console.log(result));

    db.collection('Todos').findOneAndDelete({text:'Eat mangoes'}).then((result)=> console.log(result));
});