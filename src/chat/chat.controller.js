const {getAllChat} = require("./chat.method");


const getAll = async (req, res) => {
    const presentationId= req.params.id;
    const {sessionId} = req.body;
    try {
        const chat = await getAllChat(sessionId, presentationId)
        return res.status(200).send({ data: chat });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: 'Error in database conection' });
    }
};
module.exports= {getAll};