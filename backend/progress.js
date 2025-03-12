import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const progressSchema = new mongoose.Schema({
    date: {
        type: Date
    },
    progress_tracker: {
        type: Number
    }
},
);