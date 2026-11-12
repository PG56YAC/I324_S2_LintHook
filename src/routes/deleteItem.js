const db = require('../persistence');

module.exports = async (req, res) => {
    const id = req.params.id;
        await db.removeItem(id);
    res.sendStatus(200);
    return;
};
console.log('Tâche supprimée');
