const {User} = require("../user/user.model");
const Question = require("./question.model")
const Presentation = require("../presentation/presentation.model")

const getAllQuestion = async (session_id, presentation_id) => {
    try {
        const question = await Question.find({ session_id: session_id, presentation_id: presentation_id })
        .sort({ createdAt: -1 })
        .lean();
        return question;
    } catch (err) {
        console.error(err);
        return false;
    }
};
const add = async (session_id, presentation_id, username, content) => {
    
    const present = await Presentation.findOne({ id: presentation_id });
    if (!present) return false;
    try {
        const newQuestion = {
            session_id: session_id,
            presentation_id: presentation_id,
            question: content,
            created_by: username,
        };
        const question = await Question.create(newQuestion);
        return question;
        } catch (err) {
        return false;
    }
};
const upVote = async (question_id) => {
    
    const question = await Question.findOne({ id: question_id });
    if (!question) return false;
    try {
        const newVotes=question.vote+1;
        const  newQuestion = await Question.updateOne({ id: question_id },
        {
            vote: newVotes,
        }
        );
        return newVotes;
        } catch (err) {
        console.log(err);

        return false;
    }
};
const toggleStatus =async(question_id)=>{
    const question = await Question.findOne({ id: question_id });
    if (!question) return false;
    try {
        const newStatus=!question.is_answered;
        const  newQuestion = await Question.updateOne({ id: question_id },{is_answered: newStatus}
        );
        console.log(  await Question.findOne({ id: question_id }))
        return newStatus;
        } catch (err) {
        console.log(err);
        return false;
    }
}
module.exports={
    getAllQuestion,
    add,
    upVote,
    toggleStatus
}