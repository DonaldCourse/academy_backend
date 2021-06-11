const Categories = require('../models/Catagories');

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