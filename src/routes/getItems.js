const db = require('../persistence');

module.exports = async (req, res) => {
    let items = await db.getItems();
    var total = items.length;
    res.send(items);
};
