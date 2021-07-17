const mongoose = require('mongoose');
const TutorSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    email: {
        type: String,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please use a valid email'
        ]
    },
    introduction: {
        type: String,
        trim: true,
        default: ''
    },
    intro_video: {
        type: String,
        trim: true,
        default: ''
    },
    education: {
        type: String,
        trim: true,
        default: ''
    },
    professional_background: {
        type: String,
        trim: true,
        default: ''
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