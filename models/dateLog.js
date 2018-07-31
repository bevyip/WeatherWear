const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dateLogSchema = new Schema ({
  date: { type: String, required: true},
  top: { type: String, required: true},
  bottom: { type: String, required: true},
  outerwear: { type: String, required: true},
  others: { type: String},
  userFeels: { type: String, required: true},
  location: { type: String, required: true},
  long: { type: String, required: true},
  lat: { type: String, required: true},
  weather: { type:  Schema.Types.ObjectId, ref: 'weather', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('dateLog', dateLogSchema);
