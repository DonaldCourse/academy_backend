const mongoose = require('mongoose');
const CourseReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title for the review'],
        trim: true,
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5'],
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses',
        required: true,
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Students',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {

});

CourseReviewSchema.statics.getAvergeRating = async function (courseID, action) {

    const obj = await this.aggregate([
        {
            $match: { course_id: courseID }
        },
        {
            $group: {
                _id: '$course_id',
                rating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        await this.model('Courses').findByIdAndUpdate(course_id, {
            rating: Math.ceil(obj[0].rating / 10) * 10
        });

        await this.model('Courses').findByIdAndUpdate(course_id, {
            count_rating: count_rating + (action ? 1 : (-1))
        });
    } catch (error) {
        console.log(error);
    }

    console.log(obj);
};

ReviewSchema.post('save', function () {
    this.constructor.getAvergeRating(this.course_id, true);
});

ReviewSchema.pre('remove', function () {
    this.constructor.getAvergeRating(this.course_id, false);
});

module.exports = mongoose.model('CourseReview', CourseReviewSchema);