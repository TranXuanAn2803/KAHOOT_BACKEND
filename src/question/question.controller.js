const {getAllQuestion} = require("./question.method");


const getAll = async (req, res) => {
    const presentationId= req.params.id;
    const {sessionId} = req.body;
    try {
        const question = await getAllQuestion(sessionId, presentationId)
        return res.status(200).send({ data: question });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: 'Error in database conection' });
    }
};
module.exports= {getAll};