const Presentation = require("./presentation.model");
const { User } = require("../user/user.model");
const { Types } = require("mongoose");

const getMyPrensent = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res
        .status(400)
        .send(
            "User not found"
        );
    }
    try {
        const present = await Presentation.find({created_by: user._id}).sort({ createdAt: -1 }).lean();
        return res.status(200).send({ data: {...present} });
    }
    catch(err){
        console.error(err);
        return res.status(400).send({message: "Error in database conection"})
    }
};
const getById = async (req, res) => {
    const {id} = req.params;
    const user = req.user;

    try {
        const presentation = await Presentation.findOne({_id: id}).populate({ path: 'created_by', model: User, select: 'username email' }).lean();
        if (!presentation) 
            return res.status(400).send("Presentation not found");
        console.log(presentation);
        if (String(presentation.created_by._id)!==String(user._id)) 
        {
            return res.status(400).send("You cannot access this presentation");
        }
        return res.status(200).send({ data: {...presentation} });

    }
    catch(err){
        console.error(err);
        return res.status(400).send({message: "Error in database conection"})
    }
};

const add = async (req, res) => {
  const user = req.user;
  const { name } = req.body;
  if (!user) {
    return res.status(400).send("User not found");
  }
  try {
    const newPresent = {
      _id: new Types.ObjectId(),
      name: name,
      link_code: Math.floor(Math.random() * 1000000000),
      collaborators: [],
      created_by: user._id,
    };
    const present = await Presentation.create(newPresent);

    return res.status(200).send({ data: { ...present } });
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
    getMyPrensent,
    add,
    update,
    deleteById,
    getById
}