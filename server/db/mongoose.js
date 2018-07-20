var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://vibhavkunj:Vibha1971!@ds245901.mlab.com:45901/todo-vibhav');

module.exports = {
    mongoose
}