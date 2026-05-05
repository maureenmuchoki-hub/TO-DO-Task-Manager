const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  completed:   { type: Boolean, default: false },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category:    { type: String, default: 'General' },
  dueDate:     { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);