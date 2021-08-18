const Students = require('../models/Students');

exports.findAllStudent = async (req, condition) => {
    let query;
    console.log(condition);
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    if (condition) {
        query = Students.find(JSON.parse(queryStr)).where(condition);
    } else {
        query = Students.find(JSON.parse(queryStr));
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
        total = await Students.where(condition).countDocuments();
    } else {
        total = await Students.countDocuments();
    }
    query = query.skip(startIndex).limit(limit);

    query = query.populate({path : 'user_id', select: 'email name'});

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