const Slide = require("./slide.model");
const {addOptionsBySlide, addUserAnswer, getTotalAnswerBySlide, deleteBySlide} = require("./option/option.method");
const Option = require("./option/option.model");
const Presentation = require("../presentation/presentation.model");
const { User } = require("../user/user.model");
const { Types } = require("mongoose");
const UserOption = require("./option/optionUser.model");

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
        const presentation = await Presentation.findOne({_id: id}, { name: 1}).lean();
        if (!presentation)
            return res.status(400).send("Presentation not found");
        let slides = await Slide.find({presentation_id: id}).sort({ index: 1 }).lean();
        for(let s of slides){
            const options=await Option.find({slide_id:s._id}).sort({ index: 1 }).lean();
            s.options=options;
        }
        presentation.slides=slides
        return res.status(200).send({ data: presentation });
    }
    catch(err){
        console.error(err);
        return res.status(400).send({message: "Error in database conection"})
    }
};
const getById = async (req, res) => {
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
        let slides = await Slide.find({_id: id}).lean();
        if(!slides||slides.length==0)
            return res.status(400).send("Slide not found");
        const options=await Option.find({slide_id:id}).sort({ index: 1 }).lean();
        slides.options=options;
        return res.status(200).send({ data: slides });
    }
    catch(err){
        console.error(err);
        return res.status(400).send({message: "Error in database conection"})
    }
};

const createSlide = async (req, res) => {
    const user = req.user;
    const {question, presentation_id, index, options} = req.body;
    const presentation = await Presentation.findOne({_id: presentation_id});
    if (!presentation) 
        return res.status(400).send("Presentation not found");
    if (String(presentation.created_by)!==String(user._id)) 
        return res.status(400).send("You cannot access this presentation");
    try {
        const exits = await Slide.find({presentation_id: presentation_id, index: index});
        if (exits&&exits.length>0) 
            return res.status(400).send("The index has been duplicated");
        const slideId = new Types.ObjectId();
        let newSlides={
            _id: new Types.ObjectId(),
            question: question, 
            presentation_id: presentation_id,
            index: index
        };
        const slide = await Slide.create(newSlides);          
        await addOptionsBySlide(slideId, options);        
        return res.status(200).send({ data: slide, message:  `Add successfully a slide`   });
    }
    catch(err){
        console.error(err)
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
            
            await deleteByPresent(id)
        }
        const uniqueSlide=[];
        for(i=0;i<slides.length;i++)
        {
            
            if(!uniqueSlide.find(x => x.index === slides[i].index))
                {
                    uniqueSlide.push(slides[i]);
                }
        }
        let newSlides=[];
        await uniqueSlide.map(async(s)=>{
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
        return res.status(200).send({ data: slide, message:  `Add successfully muti slide`   });
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
        await Slide.deleteOne({ _id: id })
        await UserOption.deleteMany({ slide_id: id });

        return res.status(200).send({ data: slide, message:  `Delete successfully slide id ${id}`  });
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
    return res.status(200).send({ data: data});

};
const test2 = async (req, res) => {
    const {id} = req.params;
    const data = await getTotalAnswerBySlide(id)
    return res.status(200).send({ data: data });
};
const deleteByPresent = async (id) => {
    try {
        const presentation = await Presentation.findOne({_id: id});
        if (!presentation) 
            return false;
        const slides = await Slide.find({presentation_id: id});
        if (slides&&slides.length> 0) {
            slides.map(async(s)=>{
                await deleteBySlide(s._id);
                await Slide.deleteOne({ _id: s._id });
            })
        }
        return true;
    }
    catch(err){
        console.error(err)
        return false;
    }

};
const getSlideMethod =async(presentation_id)=>
{
    try {
        const presentation = await Presentation.findOne({_id: presentation_id}, { name: 1}).lean();
        if (!presentation)
            return null;
        let slides = await Slide.find({presentation_id: id}).sort({ index: 1 }).lean();
        for(let s of slides){
            const options=await Option.find({slide_id:s._id}).sort({ index: 1 }).lean();
            s.options=options;
        }
        presentation.slides=slides
        return presentation;
    }
    catch(err){
        console.error(err)
        return null;
    }


}
module.exports = {
    updateMutiSlide,
    getByPresent,
    deleteById,
    createSlide,
    getById,
    deleteByPresent,
    getSlideMethod
}