function getNestedChildren(arr, parentId) {
    var out = []
    for (var i in arr) {
        if (arr[i].parent == parentId) {
            var children = getNestedChildren(arr, arr[i]._id)

            if (children.length) {
                arr[i].childrens = children
            }
            out.push(arr[i])
        }
    }
    return out
}

module.exports = {
    getNestedChildren
}