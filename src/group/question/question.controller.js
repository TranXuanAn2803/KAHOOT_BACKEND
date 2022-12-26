const Group = require("../group.model");
const UserGroup = require("../user_group.model");
const {User} = require("../../user/user.model");
const Question = require("./question.model")
const getGroupQuestion = async (req, res) => {
    const user = req.user;
    try {
        const group = await Group.findOne({ id: id, is_deleted: false });
        if (!group) return res.status(400).send("Group not found");
        const isMember = await _isGroupMember(user, id);
        if (!isMember) return res.status(400).send("You are not allowed to access this");
        const question = await Question.find({ group_id: id })
        .sort({ createdAt: -1 })
        .populate({
            path: "created_by",
            model: User,
            select: "username email name",
        })
        .lean();
        return res.status(200).send({ data: question });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }
};
const add = async (req, res) => {
    const user = req.user;
    const { question } = req.body;
    
    const group = await Group.findOne({ id: id, is_deleted: false });
    if (!group) return res.status(400).send("Group not found");
    const isMember = await _isGroupMember(user, id);
    if (!isMember) return res.status(400).send("You are not allowed to access this");

    try {
        const newQuestion = {
            group_id: name,
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
    
        return res.status(400).send({ message: `The presentation ${name} exist` });
    } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
    }
};

const _isGroupMember = async (user, groupId) => {
    const userGroup = await UserGroup.find({
        group_id: groupId,
        user_id: user.id,
        is_deleted: false,
    });
    if (!userGroup||userGroup==0) return false;
    return true;
};
