const path = require('path');
const asyncHandler = require('../middlewares/async');
const Catagories = require('../models/Catagories');
const ErrorResponse = require('../utils/errorResponse');
const CategoriesSevice = require('../services/categories_service');
exports.createCategories = asyncHandler(async (req, res, next) => {
    let parent = req.body.parent ? req.body.parent : null;
    const category = new Catagories({ name: req.body.name, parent })
    try {
        let newCategory = await category.save();
        CategoriesSevice.buildAncestors(newCategory._id, parent);
        res.status(201).json({
            success: true,
            data: newCategory
        });
    } catch (err) {
        return next(new ErrorResponse(err, 500));
    }
});

exports.findAllCategoriesOfRoot= asyncHandler(async (req, res, next) => {
    const root = await Catagories.findOne({"slug": "root"});
    try {
        const result = await Catagories.find({"parent": root._id})
            .select({
                "_id": true,
                "name": true,
                "ancestors._id": true,
                "ancestors.slug": true,
                "ancestors.name": true
            }).exec();
        res.status(200).send({ "status": "success", "data": result });
    } catch (err) {
        res.status(500).send(err);
    }
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

