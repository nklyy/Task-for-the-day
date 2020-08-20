const { Schema, model } = require('mongoose');

const schema = new Schema({
    title: {
        type: String,
        required: true,
    },
    date: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false
    }
})

module.exports = model('Todo', schema);