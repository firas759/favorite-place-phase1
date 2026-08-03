const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  addedBy: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model('Place', placeSchema);