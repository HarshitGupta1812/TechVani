import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Make optional to allow guest usage if needed
  },
  type: {
    type: String,
    enum: ['youtube', 'document'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subject: String,
  inputLang: String,
  outputLang: String,
  outputFormat: {
    type: String,
    enum: ['audio', 'text'],
    required: true,
  },
  resultUrl: String, // Path to stored audio result
  summary: String,   // Text summary
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('History', historySchema);
