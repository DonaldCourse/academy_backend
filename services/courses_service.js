const Categories = require('../models/Categories');
const Courses = require('../models/Courses');

exports.findAllCourses = async (req, condition) => {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'categoriesId'];
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
        query = query.sort('-created_at');
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

    query = query.populate('lecturer_id').populate('categories_id');

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

exports.SearchCourses = async (req) => {
    let query;
    query = Courses.find({ $text: { $search: `"${req.query.q}"` } }, { score: { $meta: "textScore" } }).where({ is_published: true }).sort({ score: { $meta: "textScore" } });
    let total = 0;
    total = await Courses.find({ $text: { $search: `"${req.query.q}"` } }).where({ is_published: true }).countDocuments();
    if (req.query.sort) {
        if (req.query.sort == "most-registed") {
            query = query.sort('-count_register');
        } else if (req.query.sort == "highest-rated") {
            query = query.sort('-count_rating');
        } else {
            query = query.sort('-created_at');
        }
    } else {
        query = query.sort({ created_at: -1 });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    query = query.skip(startIndex).limit(limit);

    query = query.populate('lecturer_id').populate('categories_id');

    const results = await query;
    const bestSeller = await query.select("_id").sort("-count_register").skip(startIndex).limit(3);
    const newest = await query.select("_id").sort("-created_at").skip(startIndex).limit(3);

    const totalItems = total;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        list: results,
        bestSeller: bestSeller,
        newest: newest,
        totalItems: totalItems,
        currentPage: currentPage,
        totalPages: totalPages,
    }
}

exports.SearchCategories = async (req) => {

    const categories_id = await Courses.aggregate([
        { $match: { $text: { $search: `"${req.query.q}"` } } },
        {
            $group: { _id: "$categories_id" }
        },
    ]);

    console.log(categories_id);
    let categories = []
    if (categories_id.length > 0) {
        categories = await Categories.find({ $or: categories_id })
    }
    return categories
}

