var mongoose = require('mongoose');

var Todo = mongoose.model('Todo',{
    text:{
        type:String,
        required:true,
        minlength:1,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    completedAt:{
        type:Number,
        default:null
    },
    _creator:{ //single quotes to represent that the field is an ObjectID
        required:true,
        type:mongoose.Schema.Types.ObjectId
    }
});

module.exports = {Todo};