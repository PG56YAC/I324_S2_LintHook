const db = require('../persistence');

module.exports = async (req, res) => {
    const {id} = req.params;
    await db.removeItem(id);
    res.sendStatus(200);
    return;
};