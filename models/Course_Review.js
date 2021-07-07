const mongoose = require('mongoose');
const CourseReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title for the review'],
        trim: true,
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
        await this.model('Courses').findByIdAndUpdate(courseID, {
            rating: Math.round(obj[0].rating * 2) / 2
        });
        // let course = await this.model('Courses').findOne({ _id: courseID });
        // await this.model('Courses').findByIdAndUpdate(courseID, {
        //     count_rating: course.count_rating + (action ? 1 : (-1))
        // });
    } catch (error) {
        console.log(error);
    }

    console.log(obj);
};

CourseReviewSchema.post('save', function () {
    this.constructor.getAvergeRating(this.course_id, true);
});

CourseReviewSchema.pre('remove', function () {
    this.constructor.getAvergeRating(this.course_id, false);
});

module.exports = mongoose.model('CourseReview', CourseReviewSchema);