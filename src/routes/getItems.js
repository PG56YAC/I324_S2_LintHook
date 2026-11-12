const db = require('../persistence');

module.exports = async (req, res) => {
    const items = await db.getItems();
    const total = items.length;
    res.send(items);
};
