const db = require('../persistence');

module.exports = async (req, res) => {
    const champs = {
        name: req.body.name,
        completed: req.body.completed,
        body: req.body.name,
    };

    if (req.body.completed === true) {
        console.log('terminée');
    } else if (req.body.completed === false) {
        console.log('en cours');
    }
    const id = req.params.id;
    await db.updateItem(id, champs);
    const item = await db.getItem(id);
    res.send(item);
};
