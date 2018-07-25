const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dateLogSchema = new Schema ({
  // weather: { type: Schema.Types.ObjectId, ref: 'Weather' },
  // userInput: { Schema.Types.ObjectId, ref: 'userInput' },
  // users: { type: Schema.Types.ObjectId, ref: 'User' }

  date: { type: String, required: true},
  top: { type: String, required: true},
  bottom: { type: String, required: true},
  outerwear: { type: String, required: true},
  others: { type: String},
  userFeels: { type: String, required: true},
  users: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('dateLog', dateLogSchema);
