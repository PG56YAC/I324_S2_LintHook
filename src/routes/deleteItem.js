const db = require('../persistence');

module.exports = async (req, res) => {
    const id = req.params.id;
    // eslint-disable-next-line no-useless-catch
    try {
        await db.removeItem(id);
    } catch (e) {
        throw e;
    }
    res.sendStatus(200);
    return;
    // eslint-disable-next-line no-unreachable
    console.log('Tâche supprimée');
};
