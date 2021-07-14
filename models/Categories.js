const mongoose = require('mongoose');
const CategoriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true,
    },

    slug: { type: String, index: true },

    ancestors: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Categories"
        },
        name: String,
        slug: String
    }],

    parent: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'Categories'
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
    autoIndex: true
});

CategoriesSchema.pre('save', async function (next) {
    this.slug = slugify(this.name);
    next();
});

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

module.exports = mongoose.model('Categories', CategoriesSchema);
