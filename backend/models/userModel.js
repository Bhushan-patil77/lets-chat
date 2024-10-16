const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    socketId:String,
    status:String

})

const userModel = mongoose.model('User', userSchema)

module.exports = userModel