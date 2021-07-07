const Course_Register = require("../models/Course_Register");

exports.findAllCourseRegister = async (req, condition) => {
    let query;
    console.log(condition);
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    if (condition) {
        query = Course_Register.find(JSON.parse(queryStr)).where(condition);
    } else {
        query = Course_Register.find(JSON.parse(queryStr));
    }
    if (req.query.select) {
        const fields = req.query.select.split(',');
        query = query.select(fields);
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
        console.log(sortBy);

    } else {
        query = query.sort('created_at');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let total = 0;
    if (condition) {
        total = await Course_Register.where(condition).countDocuments();
    } else {
        total = await Course_Register.countDocuments();
    }
    query = query.skip(startIndex).limit(limit);

    query = query.populate({
        path: 'student_id',
        populate: { path: 'user_id', select: 'name email avatar' }
    }).populate('course_id');

    const results = await query;
    const totalItems = total;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        success: true,
        list: results,
        totalItems: totalItems,
        currentPage: currentPage,
        totalPages: totalPages
    }

}