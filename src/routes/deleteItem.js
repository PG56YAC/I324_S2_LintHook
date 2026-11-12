const db = require('../persistence');

module.exports = async (req, res) => {
    const id = req.params.id;
    try {
        await db.removeItem(id);
    } catch (e) {
        throw e;
    }
    res.sendStatus(200);

    console.log('Tâche supprimée');

};
