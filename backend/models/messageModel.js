const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    sender: { username: String, userId: String },
    receiver: { username: String, userId: String },
    content: String
}, { timestamps: true });
const messageModel = mongoose.model('message', messageSchema)




module.exports = messageModel