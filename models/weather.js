const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const weatherSchema = new Schema ({
  highTemp: { type: String, required: true},
  lowTemp: { type: String, required: true},
  avgwindchill: { type: String, required: true},
  highfeels: { type: String, required: true},
  lowfeels: { type: String, required: true},
  avetemp: { type: String, required: true},
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('weather', weatherSchema);
