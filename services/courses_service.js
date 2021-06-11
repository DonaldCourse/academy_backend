const Courses = require('../models/Courses');

exports.findAllCourses = async (req, populate, condition) => {
    let query;
    console.log(condition);
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    if (condition) {
        query = Courses.find(JSON.parse(queryStr)).where(condition);
    } else {
        query = Courses.find(JSON.parse(queryStr));
    }
    if (req.query.select) {
        const fields = req.query.select.split(',');
        query = query.select(fields);
        console.log(typeof fields);
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
        console.log(sortBy);

    } else {
        query = query.sort('createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let total = 0;
    if (condition) {
        total = await Courses.where(condition).countDocuments();
    } else {
        total = await Courses.countDocuments();
    }
    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    const results = await query;

    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    return {
        success: true,
        data: results,
        pagination: pagination
    }

}