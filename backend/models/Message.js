const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatRefernce: {
        type: String,
        required: true
    },
    messages: {
        type: Array,
        "default": []
    }
});

module.exports = messageSchema