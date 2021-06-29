const Categories = require('../models/Categories');
const _ = require('lodash')
exports.buildAncestors = async (id, parent_id) => {
    let ancest = [];
    try {
        let parent_category = await Categories.findOne({ "_id": parent_id }, { "name": 1, "slug": 1, "ancestors": 1 }).exec();
        if (parent_category) {
            const { _id, name, slug } = parent_category;
            const ancest = [...parent_category.ancestors];
            ancest.unshift({ _id, name, slug })
            const category = await Categories.findByIdAndUpdate(id, { $set: { "ancestors": ancest } });
        }
    } catch (err) {
        console.log(err.message)
    }
}

exports.buildHierarchyAncestors = async (category_id, parent_id) => {
    if (category_id && parent_id)
        this.buildAncestors(category_id, parent_id)
    const result = await Categories.find({ 'parent': category_id }).exec();
    if (result)
        result.forEach((doc) => {
            this.buildHierarchyAncestors(doc._id, category_id)
        })
}