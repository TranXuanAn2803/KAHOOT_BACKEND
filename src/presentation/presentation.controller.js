const Presentation = require("./presentation.model");
const {deleteByPresent} = require("../slide/slide.controller");
const GroupPresentation=require("./group/groupPresentation.model")
const UserGroup = require("../group/user_group.model");
const Group = require("../group/group.model");

const { User } = require('../user/user.model');
const { Types } = require('mongoose');

const getMyPrensent = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).send('User not found');
  }
  try {
    const present = await Presentation.find({
      $or: [{ created_by: user._id }, { collaborators: user._id }],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'created_by',
        model: User,
        select: 'username email',
      })
      .lean();
    return res.status(200).send({ data: present });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: 'Error in database conection' });
  }
};
const getAllCollaborators = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).send('User not found');
  }
  try {
    const present = await Presentation.find({
      $or: [{ created_by: user._id }],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'created_by',
        model: User,
        select: 'username email',
      })
      .populate({
        path: 'collaborators',
        model: User,
        select: 'username email',
      })
      .lean();
    console.log('present ', present);
    return res.status(200).send({ data: present });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: 'Error in database conection' });
  }
};
const getById = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const presentation = await Presentation.findOne({ _id: id })
      .populate({
        path: 'created_by',
        model: User,
        select: 'username email name',
      })
      .lean();
    if (!presentation) return res.status(400).send('Presentation not found');
    console.log(presentation);
    if (String(presentation.created_by._id) !== String(user._id)) {
      return res.status(400).send('You cannot access this presentation');
    }
    return res.status(200).send({ data: presentation });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: 'Error in database conection' });
  }
};

const add = async (req, res) => {
  const user = req.user;
  const { name } = req.body;
  if (!user) {
    return res.status(400).send('User not found');
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
    return res.status(400).send({ message: 'Error in database conection' });
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
    let { name, code } = req.body;
    try {
        const present = await Presentation.updateOne(
        { _id: id },
        {
            name: name,
            link_code: code,
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
  if (!presentation) return res.status(400).send('Presentation not found');
  if (
    String(presentation.created_by) !== String(user._id) ||
    presentation.status !== 0
  )
    return res.status(400).send('You cannot access this presentation');
  try {
    await deleteByPresent(id);
    const present = await Presentation.deleteOne({ _id: id });
    return res.status(200).send({
      data: present,
      message: `Delete successfully presentation id ${id}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: 'Error in database conection' });
  }
};
const addCollaborator = async (req, res) => {
  console.log('req.body ', req.body);
  const { idPresentation, email } = req.body;
  console.log('email ', email, idPresentation);
  const presentation = await Presentation.findOne({ _id: idPresentation });
  console.log(
    '🚀 ~ file: presentation.controller.js:130 ~ addUserToPresentation ~ presentation',
    presentation
  );
  const user = await User.findOne({ email: email });
  console.log(
    '🚀 ~ file: presentation.controller.js:132 ~ addUserToPresentation ~ user',
    user
  );
  if (!presentation || !user) {
    return res.status(400).send('Presentation not found');
  }
  console.log(user._id.equals(presentation.created_by));
  if (user._id.equals(presentation.created_by)) {
    return res.status(400).send('Cannot add yourself as an collaborator');
  }
  console.log(
    '🚀 ~ file: presentation.controller.js:155 ~ addCollaborator ~ presentation',
    presentation.collaborators
  );
  const newCollaborators = presentation.collaborators.push(user._id);
  console.log(
    '🚀 ~ file: presentation.controller.js:155 ~ addCollaborator ~ newCollaborators',
    newCollaborators
  );

  await Presentation.updateOne(
    {
      _id: idPresentation,
    },
    { $push: { collaborators: user._id } }
  );
  return res.status(200).send('Successfully added');
};
const deleteCollaborator = async (req, res) => {
  const { idPresentation, collaborator } = req.params;
  const user = await User.findOne({ username: collaborator });
  await Presentation.updateOne(
    { _id: idPresentation },
    {
      $pull: {
        collaborators: user._id,
      },
    }
  );

  return res.status(200).send('delete collaborator successfully!');
};
const bulkDelete = async (req, res) => {
  const user = req.user;
  const { id } = req.body;
  const presentation = await Presentation.find({ _id: id });
  if (!presentation) return res.status(400).send('Presentation not found');
  const notExist = presentation.filter((p) => {
    return String(p.created_by) !== String(user._id) || p.status !== 0;
  });
  if (notExist && notExist.length > 0)
    return res.status(400).send('You cannot access some presentations');
  try {
    id.map(async (index) => {
      await deleteByPresent(index);
    });
    const present = await Presentation.deleteMany({ _id: id });
    await Presentation.deleteMany({ _id: id });
    return res.status(200).send({
      data: present,
      message: `Delete successfully presentation in array ${id}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: 'Error in database conection' });
  }
};
const validatePublicForm = async (id, pin) => {
  const presentation = await Presentation.findOne({
    _id: id,
    status: { $ne: 0 },
  });

  return presentation;
};


const addCollabor=async(req, res)=>{
    const { id } = req.params;
    const user = req.user;
    const {email}= req.body;
    const presentation = await Presentation.findOne({ _id: id });
    if (!presentation) return res.status(400).send("Presentation not found");
    if (String(presentation.created_by) !== String(user._id))
    {
        return res.status(400).send("You cannot access this presentation");
    }
    const collabor =await _getUserByEmail(email);
    try {
        for (let c of collabor){
            const isExits= await _checkCollaborRole(id, c._id);
            console.log(isExits)
            if(isExits) continue;
            await Presentation.updateOne({_id: id}, {
                $push: {collaborators: c._id}});
        }
        const present = await Presentation.findOne({ _id: id });

        return res.status(200).send({ data: present , message:  `Add collaborators successfully`  });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }
}
const removeCollabor=async(req, res)=>{
    const { id } = req.params;
    const user = req.user;
    const {email}= req.body;
    const presentation = await Presentation.findOne({ _id: id });
    if (!presentation) return res.status(400).send("Presentation not found");
    if (String(presentation.created_by) !== String(user._id)){
        return res.status(400).send("You cannot access this presentation");
    }
    const collabor =await _getUserByEmail(email);
    try {
        for (let c of collabor){
            const isExits= await _checkCollaborRole(id, c._id);
            if(!isExits) continue;
            await Presentation.updateOne({_id: id}, {
                $pull: {collaborators: c._id}});
        }
        const present = await Presentation.findOne({ _id: id });

        return res.status(200).send({ data: present , message:  `Remove collaborators successfully`  });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }

}
const setCollaborators= async (req, res)=>{
    const { id } = req.params;
    const user = req.user;
    const {email}= req.body;
    const presentation = await Presentation.findOne({ _id: id });
    if (!presentation) return res.status(400).send("Presentation not found");
    if (String(presentation.created_by) !== String(user._id))
    {
        return res.status(400).send("You cannot access this presentation");
    }
    try {
        const collabor =await _getUserByEmail(email);
        await Presentation.updateOne({_id: id}, {collaborators: []});
        for (let c of collabor){
            const isExits= await _checkCollaborRole(id, c._id);
            console.log(isExits)

            if(isExits) continue;
            const add=await Presentation.updateOne({_id: id}, {
                $push: {collaborators: c._id}});
        }
        const present = await Presentation.findOne({ _id: id });

        return res.status(200).send({ data: present , message:  `Add collaborators successfully`  });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }

}
const getColaborator=async (req, res)=>{
    const { id } = req.params;
    const user = req.user;
    const presentation = await Presentation.findOne({ _id: id });
    if (!presentation) return res.status(400).send("Presentation not found");
    const checkRole= await _checkCollaborRole(id, user._id)
    if (!checkRole)
    {
        return res.status(400).send("You cannot access this presentation");
    }
    try {
        const colaborator = await Presentation.findOne({ _id: id }, { collaborators: 1}).populate({ path: 'collaborators', model: User, 'select': 'username email name' }).lean();
        return res.status(200).send({ data: colaborator });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }
}
const _checkCollaborRole=async(id, userId)=>{
    const presentation = await Presentation.findOne({ _id: id });
    if(!presentation||!userId) return false;

    if (String(presentation.created_by) === String(userId))   return true;
    // console.log(presentation.collaborators)
    const notExist = presentation.collaborators.filter((c)=>{
        return (String(c) === String(userId))
    })
    console.log(notExist)
    if (notExist&&notExist.length>0)   return true;
    return false;
}
const sharePresent=async(req, res)=>{
    const { id } = req.params;
    const user = req.user;
    const {groupId}= req.body;
    const presentation = await Presentation.findOne({ _id: id });
    if (!presentation) return res.status(400).send("Presentation not found");
    const group = await Group.findOne({ id: groupId, is_deleted: false });
    if (!group) return res.status(400).send("Group not found");
    const checkRole= await _checkCollaborRole(id, user._id)
    const isGroupOwner = await _isOwner(user, groupId)
    if (!checkRole||!isGroupOwner)
    {
        return res.status(400).send("You cannot access this feature");
    }
    try {
        const groupPresent = await GroupPresentation.find({group_id: groupId,presentation_id: id});
        if (groupPresent && groupPresent.length > 0) {
            return res.status(400).send("This presetation already shared");
        }
        const newShare = {group_id: groupId,presentation_id: id};
        const member = await GroupPresentation.create(newShare);
        return res.status(200).send({ data: member , message:  `Share this presentation to a group successfully`  });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }
}
const removeSharingPresent=async(req, res)=>{
    const { id } = req.params;
    const groupPresent = await Presentation.findOne({ _id: id }).lean();
    if (!groupPresent) return res.status(400).send("Sharing presentation not found");
    try {
        const presentation = await Presentation.findOne({ _id: groupPresent.presentation_id });
        if (!presentation) return res.status(400).send("Presentation not found");
        const group = await Group.findOne({ id: groupPresent.group_id, is_deleted: false });
        if (!group) return res.status(400).send("Group not found");
        const checkRole= await _checkCollaborRole(groupPresent.presentation_id, user._id)
        const isGroupOwner = await _isOwner(user, groupPresent.group_id)
        if (!checkRole||!isGroupOwner)
        {
            return res.status(400).send("You cannot access this feature");
        }
        await Presentation.deleteOne({ _id: id });
        return res.status(200).send({ data: groupPresent , message:  `Remove the presentation from group successfully`  });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }

}
const getSharingPresent=async(req, res)=>{
    const { id } = req.params;
    const group = await Group.findOne({ id: id, is_deleted: false });
    if (!group) return res.status(400).send("Group not found");
    try {
        let groupPresent = await Presentation.findOne({ group_id: id }).lean();
        const present = await Presentation.find({ _id: groupPresent.presentation_id },{name:1, created_by: 1}).populate({path: "created_by",model: User,select: "username email name",}).lean();
        groupPresent={...groupPresent, present}
        return res.status(200).send({ data: groupPresent });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }

}
const toggleStatus = async(req, res)=>{
    const user = req.user;
    const { id } = req.params;
    const presentation = await Presentation.findOne({ _id: id });
    if (!presentation) return res.status(400).send("Presentation not found");
    const checkRole= await _checkCollaborRole(id, user._id)
    if (!checkRole) {
        return res.status(400).send("You cannot access this presentation");
    }
    let { status } = req.body;
    if(status) status= Math.max(Math.min(status,3),0);
    try {
        if(status==3)
        {
            let { groupId } = req.body;
            const groupPresent = await GroupPresentation.find({group_id: groupId,presentation_id: id});
            if (!groupPresent) return res.status(400).send("Sharing presentation not found");
            const checkGroupPermission= (await _isOwner(user, groupId))||(await _isCoOwner(user, groupId))
            if(!checkGroupPermission) return res.status(400).send("You must be an owner or co-owner to share this presentation");
        }
        const present = await Presentation.updateOne({ _id: id },{status: status,link_code: code,}
        );
        return res.status(200).send({ data: present , message:  `Update successfully presentation id ${id}` });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ message: "Error in database conection" });
    }

}
const _getUserByEmail = async (email) => {
    const user = await User.find({ email: email, is_deleted: false });
    return user;
};
const _isOwner = async (user, groupId) => {
    const userGroup = await UserGroup.findOne({
        group_id: groupId,
        user_id: user.id,
        is_deleted: false,
    });
    if (userGroup?.role == "owner") return true;
    return false;
};
const _isCoOwner = async (user, groupId) => {
    const userGroup = await UserGroup.findOne({
        group_id: groupId,
        user_id: user.id,
        is_deleted: false,
    });
    if (userGroup?.role == "co-owner") return true;
    return false;
};

module.exports = {
    getMyPrensent,
    add,
    update,
    deleteById,
    getById,
    bulkDelete,
    validatePublicForm,
    addCollabor,
    removeCollabor,
    setCollaborators,
    getColaborator,
    getAllCollaborators,
    addCollaborator,
    deleteCollaborator
};
