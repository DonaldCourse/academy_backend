const mongoose = require('mongoose');
const CoursesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course name'],
        trim: true,
    },

    overview: {
        type: String,
        required: [true, 'Please add a overview'],
    },

    description: {
        type: String,
        required: [true, 'Please add a description'],
    },

    minimum_skill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ["beginner", "intermediate", "advanced"]
    },

    weeks: {
        type: Number,
        default: 0
    },

    tuition: {
        type: Number,
        default: 0
    },

    discount: {
        type: Number,
        default: 0
    },

    avatar: {
        type: String,
        default: 'no-image.jpg'
    },

    rating: {
        type: Number,
        min: [1, 'Rating must be least 1'],
        max: [5, 'Rating must not be more than 5'],
        default: 1
    },

    count_rating: {
        type: Number,
        default: 0
    },

    count_register: {
        type: Number,
        default: 0
    },

    count_watch: {
        type: Number,
        default: 0
    },

    categories_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories',
        required: true,
    },

    lecturer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tutors',
        required: true,
    },

    is_published: {
        type: Boolean,
        default: false
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
    autoIndex: true
});

CoursesSchema.index({ title: 'text', description: 'text', overview: 'text' });
module.exports = mongoose.model('Courses', CoursesSchema);