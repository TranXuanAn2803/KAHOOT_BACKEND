const Option = require("./option.model");
const UserOption = require("./optionUser.model");
const Slide = require("../slide.model");

const { Types } = require("mongoose");
const { response } = require("express");

const addOptionsBySlide = async (slideId, options) => {
    const prevOptions = await Option.find({slide_id: slideId});
    try {
        if (prevOptions&&prevOptions.length> 0) {
            prevOptions.map(async(p)=>{
                await Option.deleteOne({ _id: p._id });  
            })
        }
        let newOption=[];
        options.map(async(value, index)=>{
            newOption.push({
                _id: new Types.ObjectId(),
                slide_id: slideId,
                index: index,
                content: value
            })
        })
        const option = await Option.insertMany(newOption);     
        console.log(option)     
        return option ;
    }
    catch(err){
        console.error(err);
        return false;
    }
};
const addUserAnswer = async(username, optionId)=>{
    const option = await Option.findOne({_id:optionId});     
    if(!option)
    {
        console.error("option not found");        
    }
    try {
        console.log({username:username,option_id: optionId})
        const answer = await UserOption.create({username:username,option_id: optionId});     
        console.log(answer)     
        return answer;
    }
    catch(err){
        console.error(err);
        return false;
    }
}
const getTotalAnswerBySlide =async(slideId)=>{
    const slide = await Slide.findOne({_id:slideId});     
    if(!slide)
    {
        console.error("Slide not found");        
    }
    try {
        const options = await Option.find({slide_id: slideId});
        let userAnswer=[]
        for (let option of options){
            const [total, user] = await Promise.all([
                UserOption.count({option_id: option.id}),
                UserOption.find({option_id: option.id}).lean()
            ]);
            let answer={user: user, total:total, content: option.content, id:option.id}
            userAnswer.push(answer)
        }
        return userAnswer ;
    }
    catch(err){
        console.error(err);
        return false;
    }
    
}

module.exports = {
    addOptionsBySlide,
    addUserAnswer,
    getTotalAnswerBySlide
}