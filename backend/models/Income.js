const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount']
    },
    source: {
      type: String,
      required: [true, 'Please select/add a source'],
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Income', IncomeSchema);
