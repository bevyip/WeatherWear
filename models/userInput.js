const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userInputSchema = new Schema ({
  top: { type: String, required: true},
  bottom: { type: String, required: true},
  outerwear: { type: String, required: true},
  others: { type: String, required: true},
  userFeels: { type: String, required: true}
});

module.exports = mongoose.model('userInput', userInputSchema);
