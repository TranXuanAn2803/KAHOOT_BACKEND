const Presentation = require("./presentation.model");
const { User } = require("../user/user.model");
const { Types } = require("mongoose");

const getMyPresentation = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).send("User not found");
  }
  try {
    const present = await Presentation.find({ created_by: user._id })
      .sort({ createdAt: -1 })
      .lean();
    present.forEach((present) => {
      present.owner = user.name || user.username;
      delete present.created_by;
    });
    return res.status(200).json({ presentationList: present });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const getPresentationById = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  if (!user) {
    return res.status(400).send("User not found");
  }
  try {
    const present = await Presentation.findOne({ _id: id });
    console.log("presentation found by id ", present);
    return res.status(200).send(present);
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const add = async (req, res) => {
  const user = req.user;
  const { name } = req.body;
  if (!user) {
    return res.status(400).send("User not found");
  }
  try {
    const existedPresentation = await Presentation.findOne({
      name: name,
      created_by: user._id,
    });

    if (existedPresentation == null) {
      const newPresent = {
        _id: new Types.ObjectId(),
        name: name,
        link_code: Math.floor(Math.random() * 1000000000),
        collaborators: [],
        created_by: user._id,
      };
      var presentation = await Presentation.create(newPresent);
      console.log(presentation);
      presentation.owner = user.name;
      delete presentation.created_by;
      return res.status(200).send({ presentation: presentation });
    }
    return res.status(400).send({ message: `The presentation ${name} exist` });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const update = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const presentation = await Presentation.findOne({ _id: id });
  if (!presentation) return res.status(400).send("Presentation not found");
  if (String(presentation.created_by) !== String(user._id)) {
    return res.status(400).send("You cannot access this presentation");
  }
  const { name, code } = req.body;

  try {
    const present = await Presentation.updateOne(
      { _id: id },
      {
        name: name,
        code: code,
      }
    );

    return res.status(200).send({ data: { ...present } });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const deleteById = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const presentation = await Presentation.findOne({ _id: id });
  if (!presentation) return res.status(400).send("Presentation not found");
  console.log(String(presentation.created_by) !== String(user._id));
  console.log(presentation);
  if (
    String(presentation.created_by) !== String(user._id) ||
    presentation.status !== 0
  )
    return res.status(400).send("You cannot access this presentation");
  try {
    const present = await Presentation.deleteOne({ _id: id });
    return res.status(200).send({ data: { ...present } });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
module.exports = {
  getMyPresentation,
  getPresentationById,
  add,
  update,
  deleteById,
};
