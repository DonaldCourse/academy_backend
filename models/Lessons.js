const mongoose = require('mongoose');
const LessonsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course name'],
        trim: true,
    },

    thumbnail: {
        type: String,
        required: [true, 'Please add a thumbnail for video'],
    },

    video_url: {
        type: String,
        required: [true, 'Please add a url for video'],
    },

    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'Courses'
    },

    created_at: {
        type: Date,
        default: Date.now
    },

    updated_at: {
        type: Date,
        default: Date.now
    },
}, {

});

module.exports = mongoose.model('Lessons', LessonsSchema);