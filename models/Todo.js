const {Schema, model, Types} = require('mongoose');

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
  },
  owner: {
    type: Types.ObjectId,
    ref: 'User'
  }
})

module.exports = model('Todo', schema);