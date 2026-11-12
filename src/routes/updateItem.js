const db = require('../persistence');

module.exports = async (req, res) => {
    const champs = {
        name: req.body.name,
        completed: req.body.completed,
    };

    const id = req.params.id;

    await db.updateItem(id, champs);

    const item = await db.getItem(id);

    res.send(item);
};
