const mongoose = require('mongoose');
const CourseFavoriteSchema = new mongoose.Schema({
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

CourseFavoriteSchema.statics.getCountWatch = async function (courseID, action) {
    try {
        let course = await this.model('Courses').findOne({ _id: courseID });
        console.log(course);
        await this.model('Courses').findByIdAndUpdate(courseID, {
            count_watch: course.count_watch + (action ? 1 : (-1))
        });
    } catch (error) {
        console.log(error);
    }
};

CourseFavoriteSchema.post('save', function () {
    this.constructor.getCountWatch(this.course_id, true);
});

CourseFavoriteSchema.pre('remove', function () {
    this.constructor.getCountWatch(this.course_id, false);
});

module.exports = mongoose.model('CourseRegister', CourseRegisterSchema);