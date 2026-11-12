const db = require('../persistence');
const { v4: uuid } = require('uuid');

module.exports = async (req, res) => {
    const debug = false;
    if (req.body.name === debug) {
        return res.sendStatus(400);
    }

    const item = {
        id: uuid(),
        name: req.body.name,
        completed: false,
    };

    await db.storeItem(item);
    res.send(item);
};
