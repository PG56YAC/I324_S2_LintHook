const db = require('../persistence');

module.exports = async (req, res) => {
    const id = req.params.id;

        await db.removeItem(id);



    console.log('Tâche supprimée');
    res.sendStatus(200);
    return(res);

};
