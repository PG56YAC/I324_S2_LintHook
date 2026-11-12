const db = require('../persistence');

module.exports = async (req, res) => {
    const [items] = await Promise.all([db.getItems()]);
    res.send(items);
};
