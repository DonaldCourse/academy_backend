const mongoose = require('mongoose');
const CourseRegisterSchema = new mongoose.Schema({
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

CourseReviewSchema.statics.getCountRegister = async function (courseID, action) {
    try {
        await this.model('Courses').findByIdAndUpdate(courseID, {
            count_register: count_register + (action ? 1 : (-1))
        });
    } catch (error) {
        console.log(error);
    }

    console.log(obj);
};

ReviewSchema.post('save', function () {
    this.constructor.getCountRegister(this.course_id, true);
});

ReviewSchema.pre('remove', function () {
    this.constructor.getCountRegister(this.course_id, false);
});

module.exports = mongoose.model('CourseRegister', CourseRegisterSchema);