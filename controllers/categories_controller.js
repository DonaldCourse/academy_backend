const path = require('path');
const asyncHandler = require('../middlewares/async');
const Categories = require('../models/Categories');
const ErrorResponse = require('../utils/errorResponse');
const CategoriesSevice = require('../services/categories_service');
const { getNestedChildren } = require('../utils/buildTree');

exports.createCategories = asyncHandler(async (req, res, next) => {
    let parent = req.body.parent ? req.body.parent : null;
    const categories = new Categories({ name: req.body.name, parent })
    try {
        let newCategory = await categories.save();
        CategoriesSevice.buildAncestors(newCategory._id, parent);
        res.status(201).json({
            success: true,
            data: newCategory
        });
    } catch (err) {
        return next(new ErrorResponse(err, 500));
    }
});

exports.findAllCategories = asyncHandler(async (req, res, next) => {
    try {
        const result = await Categories.find()
            .select({
                "_id": true,
                "name": true,
                "parent": true,
                "ancestors._id": true,
                "ancestors.slug": true,
                "ancestors.name": true
            }).exec();

        data = getNestedChildren(JSON.parse(JSON.stringify(result)), null);
        res.status(200).send({ "status": "success", "data": JSON.parse(JSON.stringify(data)) });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

exports.getCategoryDetail = asyncHandler(async (req, res, next) => {
    try {
        const category = await Categories.findOne({ _id: req.params.categoryId });
        if (!category) {
            return next(new ErrorResponse("Category not found", 400));
        }
        res.status(200).send({ "status": "success", "data": category });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

exports.updateCategoriesOfAdmin = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
    }

    const { name, parent_id } = req.body;
    let category
    if (!name) {
        category = await Categories.findByIdAndUpdate(category_id, { $set: { "name": name } });
    } else if (!parent_id) {
        category = await Categories.findByIdAndUpdate(category_id, { $set: { "parent": parent_id } });
        CategoriesSevice.buildHierarchyAncestors(category._id, parent_id);
    } else {
        category = await Categories.findByIdAndUpdate(category_id, { $set: { "parent": parent_id, "name": name } });
        CategoriesSevice.buildHierarchyAncestors(category._id, parent_id);
    }

    res.status(200).json({
        success: true,
        data: category
    });
});

exports.findDescendants = asyncHandler(async (req, res, next) => {
    try {
        const result = await Catagories.find({ "ancestors._id": req.query.category_id })
            .select({ "_id": true, "name": true })
            .exec();
        res.status(201).send({ "status": "success", "result": result });
    } catch (err) {
        res.status(500).send(err);
    }
})

