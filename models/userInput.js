const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userInputSchema = new Schema ({
  date: { type: String, required: true},
  top: { type: String, required: true},
  bottom: { type: String, required: true},
  outerwear: { type: String, required: true},
  others: { type: String},
  userFeels: { type: String, required: true},
  createdBy: { type: Schema.Types.ObjectId, ref: 'dateLog' }
});

module.exports = mongoose.model('userInput', userInputSchema);
