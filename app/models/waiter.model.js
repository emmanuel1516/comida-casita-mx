import mongoose from 'mongoose';

const waiterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
});

export const Waiter = mongoose.model('Waiter', waiterSchema);