const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('./../../models/user');
const {Todo} = require('./../../models/todo');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const dummyUsers = [{
    _id: userOneID,
    email:'abc@xyz.com',
    password: 'mehram',

    tokens:[{
        access:'auth',
        token: jwt.sign({_id:userOneID,access:'auth'},process.env.JWT_SECRET).toString()
    }]
},{
    _id: userTwoID,
    email:'xyz@xyz.com',
    password: 'mehramiy',

    tokens:[{
        access:'auth',
        token: jwt.sign({_id:userTwoID,access:'auth'},process.env.JWT_SECRET).toString()
    }]
}];

const dummyTodos = [{
    text: "dummy one", 
    _id:new ObjectID(),
    _creator:userOneID
},{
    text: "dummy two",
    _id:new ObjectID(),
    _creator:userTwoID,
    completed: true,
    completedAt: 666
}];

const populateTodos = (done)=>{
    Todo.remove({}).then(()=>{
        return Todo.insertMany(dummyTodos);
    }).then(()=>done());
};

const populateUsers = (done)=>{
    User.remove({}).then(()=>{
        var userOne = new User(dummyUsers[0]).save(); //these 2 will return promises of both users getting saved.
        var userTwo = new User(dummyUsers[1]).save();

        return Promise.all([userOne,userTwo]); //takes in array of promises it has wait for to be fulfilled inorder to fire up.
    }).then(()=>done());
};

module.exports = {
    dummyTodos,
    populateTodos,
    dummyUsers,
    populateUsers
};