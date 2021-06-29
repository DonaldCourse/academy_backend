const mongoose = require('mongoose');
const TutorSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    introduction: {
        type: String,
        trim: true,
    },
    intro_video: {
        type: String,
        trim: true,
    },
    education: {
        type: String,
        trim: true,
    },
    professional_background: {
        type: String,
        trim: true,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Tutors', TutorSchema);