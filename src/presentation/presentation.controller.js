const Presentation = require("./presentation.model");
const {deleteByPresent} = require("../slide/slide.controller");

const { User } = require("../user/user.model");
const { Types } = require("mongoose");

const getMyPrensent = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(400).send("User not found");
    }
    try {
        const present = await Presentation.find({ created_by: user._id })
        .sort({ createdAt: -1 })
        .populate({
            path: "created_by",
            model: User,
            select: "username email name",
        })
        .lean();
        return res.status(200).send({ data: present });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }
};
const getById = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const presentation = await Presentation.findOne({ _id: id })
        .populate({
            path: "created_by",
            model: User,
            select: "username email name",
        })
        .lean();
        if (!presentation) return res.status(400).send("Presentation not found");
        console.log(presentation);
        if (String(presentation.created_by._id) !== String(user._id)) {
        return res.status(400).send("You cannot access this presentation");
        }
        return res.status(200).send({ data: presentation });
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
            presentation.owner = user.name;
            delete presentation.created_by;
            return res.status(200).send({
                presentation: presentation,
                message: `Add successfully presentation`,
            });
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
    let { name, code, status } = req.body;
    if(status) status= Math.max(Math.min(status,2),0);
    try {
        const present = await Presentation.updateOne(
        { _id: id },
        {
            name: name,
            link_code: code,
            status: status,
        }
        );
        return res.status(200).send({ data: present , message:  `Update successfully presentation id ${id}` });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }
    const user = req.user;
    const { id } = req.params;
    const presentation = await Presentation.findOne({ _id: id });
    if (!presentation) return res.status(400).send("Presentation not found");
    if (String(presentation.created_by) !== String(user._id)) {
        return res.status(400).send("You cannot access this presentation");
    }
    let { name, code, status } = req.body;
    if(status) status= Math.max(Math.min(status,2),0);
    try {
        const present = await Presentation.updateOne(
        { _id: id },
        {
            name: name,
            link_code: code,
            status: status,
        }
        );
        return res.status(200).send({ data: present , message:  `Update successfully presentation id ${id}` });
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
    if (String(presentation.created_by) !== String(user._id) ||presentation.status !== 0)
        return res.status(400).send("You cannot access this presentation");
    try {
        await deleteByPresent(id)
        const present = await Presentation.deleteOne({ _id: id });
        return res.status(200).send({
        data: present,
        message: `Delete successfully presentation id ${id}`,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }
};
const bulkDelete = async (req, res) => {
    const user = req.user;
    const { id } = req.body;
    const presentation = await Presentation.find({ _id: id });
    if (!presentation) return res.status(400).send("Presentation not found");
    const notExist = presentation.filter((p)=>{
        return (String(p.created_by) !== String(user._id)||p.status !== 0)
    })
    if (notExist &&notExist.length>0)
        return res.status(400).send("You cannot access some presentations");
    try {
        id.map(async(index)=>{await deleteByPresent(index)})
        const present = await Presentation.deleteMany({ _id: id });
        await Presentation.deleteMany({ _id: id })
        return res.status(200).send({ data: present , message:  `Delete successfully presentation in array ${id}`  });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }

};
const validatePublicForm = async(id, pin)=>
{
    const presentation = await Presentation.findOne({ _id: id, status:  { $ne: 0 } });
    return presentation;

}
module.exports = {
    getMyPrensent,
    add,
    update,
    deleteById,
    getById,
    bulkDelete,
    validatePublicForm,
};
