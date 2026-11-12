const db = require('../persistence');

module.exports = async (req, res) => {
    const champs = {
        name: req.body.name,
        completed: req.body.completed,
        // eslint-disable-next-line no-dupe-keys
        name: req.body.name,
    };
    if (req.body.completed === true) { /* empty */ } else if (req.body.completed !== true) { /* empty */ } else { /* empty */ }
    const id = req.params.id;
    await db.updateItem(id, champs);
    const item = await db.getItem(id);
    res.send(item);
};
