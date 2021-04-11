const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
});

module.exports = userSchema