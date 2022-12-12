const Slide = require("./slide.model");
const {addOptionsBySlide, addUserAnswer, getTotalAnswerBySlide} = require("./option/option.method");
const Option = require("./option/option.model");
const Presentation = require("../presentation/presentation.model");
const { User } = require("../user/user.model");
const { Types } = require("mongoose");

const getByPresent = async (req, res) => {
    const user = req.user;
    const {id} = req.params;
    if (!user) {
        return res
        .status(400)
        .send(
            "User not found"
        );
    }
    try {
        let slides = await Slide.find({presentation_id: id}).sort({ index: 1 }).lean();
        for(let s of slides){
            const options=await Option.find({slide_id:s._id}).sort({ index: 1 }).lean();
            s.options=options;
        }
        if(!slides||slides.length==0)
            return res.status(400).send("Slide not found");
        return res.status(200).send({ data: {...slides} });
    }
    catch(err){
        console.error(err);
        return res.status(400).send({message: "Error in database conection"})
    }
};
const updateMutiSlide = async (req, res) => {
    const user = req.user;
    const {slides}= req.body;
    const {id} = req.params;
    const presentation = await Presentation.findOne({_id: id});
    if (!presentation) 
        return res.status(400).send("Presentation not found");
    if (String(presentation.created_by)!==String(user._id)) 
        return res.status(400).send("You cannot access this presentation");
    const prevSlide = await Slide.find({presentation_id: id});
    try {
        if (prevSlide&&prevSlide.length> 0) {
            prevSlide.map(async(p)=>{
                await Slide.deleteOne({ _id: p._id });  
            })
        }
        let newSlides=[];
        slides.map(async(s)=>{
            const slideId = new Types.ObjectId();
            newSlides.push({
                _id: slideId,
                question: s.question,
                presentation_id: id,
                index: s.index,
            })
            await addOptionsBySlide(slideId, s.options);
        })
        const slide = await Slide.insertMany(newSlides);          
        return res.status(200).send({ data: {...slide} });
    }
    catch(err){
        console.error(err)
        return res.status(400).send({message: "Error in database conection"})
    }
};
const deleteById = async (req, res) => {
    const {id} = req.params;
    const slide = await Slide.findOne({_id: id});
    if (!slide) 
        return res.status(400).send("Slide not found");
    try {

        await Presentation.deleteOne({ _id: id });
        return res.status(200).send({ data: {...slide} });
    }
    catch(err){
        console.error(err);
        return res.status(400).send({message: "Error in database conection"})
    }
};
const test1 = async (req, res) => {
    const user = req.user;
    const {id} = req.params;
    const data = await addUserAnswer(user.username, id);
    return res.status(200).send({ data: {...data} });

};
const test2 = async (req, res) => {
    const {id} = req.params;
    const data = await getTotalAnswerBySlide(id)
    return res.status(200).send({ data: {...data} });
};

module.exports = {
    updateMutiSlide,
    getByPresent,
    deleteById,
    test1,
    test2
}