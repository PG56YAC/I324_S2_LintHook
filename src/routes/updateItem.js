const db = require('../persistence');

module.exports = async (req, res) => {
    const champs = {
        name: req.body.name,
        completed: req.body.completed,

    };
    if (req.body.completed === true) {
                // eslint-disable-next-line no-dupe-else-if
    } else if (req.body.completed === true) {console.log("hello")
    }
    const id = req.params.id;
    await db.updateItem(id, champs);
    const item = await db.getItem(id);
    res.send(item);
};
