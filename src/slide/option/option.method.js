const Option = require("./option.model");
const UserOption = require("./optionUser.model");
const Slide = require("../slide.model");

const { Types } = require("mongoose");
const { response } = require("express");
const { User } = require("../../user/user.model");

const addOptionsBySlide = async (slideId, options) => {
  const prevOptions = await Option.find({ slide_id: slideId });
  try {
    if (prevOptions && prevOptions.length > 0) {
      await prevOptions.map(async (p) => {
        await Option.deleteOne({ _id: p._id });
      });
    }
    let newOption = [];
    options.map(async (value, index) => {
      newOption.push({
        _id: new Types.ObjectId(),
        slide_id: slideId,
        index: index,
        content: value,
      });
    });
    const option = await Option.insertMany(newOption);
    console.log(option);
    return option;
  } catch (err) {
    console.error(err);
    return false;
  }
};
const addUserAnswer = async (username, options) => {
  const option = await Option.find({ _id: options });
  console.log("addUserAnswer ", option);
  if (!option) {
    console.error("option not found");
    return null;
  }
  try {
    let newAnswers = [];
    options.map(async (option) => {
      newAnswers.push({
        _id: new Types.ObjectId(),
        username: username,
        option_id: option,
      });
    });
    const answer = await UserOption.insertMany(newAnswers);
    return answer;
  } catch (err) {
    console.error(err);
    return null;
  }
};
const getSlideByOptionId = async (optionId) => {
  const option = await Option.findOne({ _id: optionId });
  if (!option) {
    console.error("option not found");
    return null;
  }
  try {
    return option.slide_id;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const getTotalAnswerBySlide = async (slideId) => {
  const slide = await Slide.findOne({ _id: slideId });
  if (!slide) {
    console.error("Slide not found");
    return false;
  }
  try {
    const options = await Option.find({ slide_id: slideId });
    let userAnswer = [];
    for (let option of options) {
      const [total, user] = await Promise.all([
        UserOption.count({ option_id: option.id }),
        UserOption.find({ option_id: option.id }, { username: 1 }).lean(),
      ]);
      let answer = {
        user: user,
        total: total,
        content: option.content,
        id: option.id,
      };
      userAnswer.push(answer);
    }
    return userAnswer;
  } catch (err) {
    console.error(err);
    return false;
  }
};
const deleteBySlide = async (id) => {
  try {
    const slide = await Slide.findOne({ _id: id });
    if (!slide) return false;
    const options = await Option.find({ slide_id: id });
    if (options && options.length > 0) {
      options.map(async (o) => {
        await UserOption.deleteMany({ option_id: o.id });
      });
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

module.exports = {
  addOptionsBySlide,
  addUserAnswer,
  getTotalAnswerBySlide,
  deleteBySlide,
  getSlideByOptionId,
};
