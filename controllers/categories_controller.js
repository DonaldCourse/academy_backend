const path = require('path');
const asyncHandler = require('../middlewares/async');
const Categories = require('../models/Categories');
const ErrorResponse = require('../utils/errorResponse');
const CategoriesSevice = require('../services/categories_service');
const { getNestedChildren } = require('../utils/buildTree');
const lodash = require('lodash');
const { validationResult } = require('express-validator');
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

exports.findAllCategoriesOfAdmin = asyncHandler(async (req, res, next) => {
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

        res.status(200).send({ "status": "success", "data": result });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

exports.findAllCategoriesOfTeacher = asyncHandler(async (req, res, next) => {
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
        data = lodash.drop(result);

        res.status(200).send({ "status": "success", "data": data });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

exports.getCategoryDetail = asyncHandler(async (req, res, next) => {
    try {
        const category = await Categories.findOne({ _id: req.params.id });
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
    console.log(req.params.categoryId);
    let category
    if (!name) {
        category = await Categories.findByIdAndUpdate(req.params.categoryId, { $set: { "name": name, "slug": slugify(name) } });
    } else if (!parent_id) {
        category = await Categories.findByIdAndUpdate(req.params.categoryId, { $set: { "parent": parent_id } });
        CategoriesSevice.buildHierarchyAncestors(category._id, parent_id);
    } else {
        category = await Categories.findByIdAndUpdate(req.params.categoryId, { $set: { "parent": parent_id, "name": name, "slug": slugify(name) } });
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

function slugify(string) {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return string.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w\-]+/g, '') // Remove all non-word characters
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
}

