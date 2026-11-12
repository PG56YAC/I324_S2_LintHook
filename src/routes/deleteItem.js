const db = require('../persistence');

module.exports = async (req, res) => {
    const id = req.params.id;
    try{
      await db.removeItem(id);
    } catch (e) {
      await db.removeItem(id)
      throw e;
    }
    res.sendStatus(200);
    return;
};
