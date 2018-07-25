const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs')

var UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        minlength:1,
        trim:true,
        unique:true,
        validate:{
            validator:validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    tokens:[{
        access:{
            required:true,
            type:String
        },
        token:{
            required:true,
            type:String
        }
    }]
});

UserSchema.methods.toJSON = function(){ //overriding toJSON method to selectively send only safe info back
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject,['_id','email']);
};

UserSchema.methods.generateAuthToken = function (){
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id:user._id.toHexString(),access},'abc123').toString();

    user.tokens = user.tokens.concat([{access,token}]);

    return user.save().then(()=>{
        return token; //the value will get passed as the success argument for next then call
    });
};

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;

    try{
        decoded = jwt.verify(token,'abc123');
    } catch(e){
        return Promise.reject(); //return a rejected promise for catch in server.js to process
    }

    return User.findOne({ //single quotes are because findOne method when searching for nested properties, require single quotes...added to _id just for consistency!
        '_id':decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function(email,password){
    var User = this;

    return User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject();
        }

        return new Promise((resolve,reject)=>{ //since bcryptjs supports only callbacks so we are wrapping it into a promise
            bcrypt.compare(password,user.password,(err,res)=>{
                if(res){
                    resolve(user);
                } else{
                    reject();
                }
            });
        });
    });
};

//middleware below,careful!
UserSchema.pre('save',function(next){
    var user = this;

    if(user.isModified('password')){ //user.password gets modified only when user created and we want to use hashing only on creation of user, right?
        bcrypt.genSalt(10, (err,salt)=>{
            bcrypt.hash(user.password,salt,(err,hash)=>{
                user.password = hash;
                next();
            });
        });
    } else{
        next();
    }
});

var User = mongoose.model('User',UserSchema);

module.exports = {User};