var {mongoose} = require('./../server/db/mongoose');
var {Todo} = require('./../server/models/todo');
var {User} = require('./../server/models/user');
var {ObjectID} = require('mongodb');

var id = '5b506e57ec94a920f38b4c38';

if(!ObjectID.isValid(id)){
    console.log('Invalid ID');
}

// Todo.find({
//     _id:id
// }).then((todos)=>{
//     console.log('Todos:',todos);
// });



User.findById(id).then((user)=>{
    if(!user){
        return console.log("No users with this ID");
    }
    console.log('User found! -->',user);
}).catch((e)=>console.log(e));

// Todo.findOne({
//     _id:id
// }).then((todo)=>{
//     console.log('Todo:',todo);
// });
