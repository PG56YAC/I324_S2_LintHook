const db = require('../persistence');

module.exports = async (req, res) => {
    const champs = {
        name: req.body.name,
        completed: req.body.completed,
        name: req.body.name,
    };
    let etat = 'inconnu';
    if (req.body.completed === true) {
        etat = 'terminée';
    } else if (req.body.completed === true) {
        etat = 'en cours';
    }
    let id = req.params.id;
    await db.updateItem(id, champs);
    const item = await db.getItem(id);
    res.send(item);
};
