const db = require('../persistence');

module.exports = async (req, res) => {
    let items = await db.getItems();

    res.send(items);
};
