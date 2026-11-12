const db = require('../persistence');

module.exports = async (req, res) => {
    const id = req.params.id;
    await db.removeItem(id);
    res.sendStatus(200);
    console.log("Tâche supprimée");
    return;
};
