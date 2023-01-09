const Presentation = require("./presentation.model");
const { deleteByPresent } = require("../slide/slide.controller");
const Slide = require("../slide/slide.model");

const GroupPresentation = require("./group/groupPresentation.model");
const UserGroup = require("../group/user_group.model");
const Group = require("../group/group.model");
const { v4: uuidv4 } = require("uuid");

const { User } = require("../user/user.model");
const { Types } = require("mongoose");
const { ObjectID } = require("bson");

const getMyPrensent = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).send("User not found");
  }
  try {
    const present = await Presentation.find({
      $or: [{ created_by: user._id }, { collaborators: user._id }],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "created_by",
        model: User,
        select: "username email",
      })
      .lean();
    return res.status(200).send({ data: present });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const getMyOwnPrensent = async (req, res) => {
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
        select: "username email",
      })
      .lean();
    return res.status(200).send({ data: present });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};

const getAllCollaborators = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).send("User not found");
  }
  try {
    const present = await Presentation.find({
      $or: [{ created_by: user._id }],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "created_by",
        model: User,
        select: "username email",
      })
      .populate({
        path: "collaborators",
        model: User,
        select: "username email",
      })
      .lean();
    console.log("present ", present);
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
  const checkRole = await _checkCollaborRole(id, user._id);
  if (!checkRole) return res.status(400).send("Presentation not found");
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
    return res.status(200).send({
      data: present,
      message: `Update successfully presentation id ${id}`,
    });
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
  if (
    String(presentation.created_by) !== String(user._id) ||
    presentation.status !== 0
  )
    return res.status(400).send("You cannot access this presentation");
  try {
    await deleteByPresent(id);
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
const addCollaborator = async (req, res) => {
  console.log("req.body ", req.body);
  const { idPresentation, email } = req.body;
  console.log("email ", email, idPresentation);
  const presentation = await Presentation.findOne({ _id: idPresentation });
  console.log(
    "🚀 ~ file: presentation.controller.js:130 ~ addUserToPresentation ~ presentation",
    presentation
  );
  const user = await User.findOne({ email: email });
  console.log(
    "🚀 ~ file: presentation.controller.js:132 ~ addUserToPresentation ~ user",
    user
  );
  if (!presentation || !user) {
    return res.status(400).send("Presentation not found");
  }
  console.log(user._id.equals(presentation.created_by));
  if (user._id.equals(presentation.created_by)) {
    return res.status(400).send("Cannot add yourself as an collaborator");
  }
  console.log(
    "🚀 ~ file: presentation.controller.js:155 ~ addCollaborator ~ presentation",
    presentation.collaborators
  );
  const newCollaborators = presentation.collaborators.push(user._id);
  console.log(
    "🚀 ~ file: presentation.controller.js:155 ~ addCollaborator ~ newCollaborators",
    newCollaborators
  );

  await Presentation.updateOne(
    {
      _id: idPresentation,
    },
    { $push: { collaborators: user._id } }
  );
  return res.status(200).send("Successfully added");
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

  return res.status(200).send("delete collaborator successfully!");
};
const bulkDelete = async (req, res) => {
  const user = req.user;
  const { id } = req.body;
  const presentation = await Presentation.find({ _id: id });
  if (!presentation) return res.status(400).send("Presentation not found");
  const notExist = presentation.filter((p) => {
    return String(p.created_by) !== String(user._id) || p.status !== 0;
  });
  if (notExist && notExist.length > 0)
    return res.status(400).send("You cannot access some presentations");
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
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const validatePublicForm = async (id) => {
  const presentation = await Presentation.findOne({
    _id: id,
    status: { $gt: 1 },
  });

  return presentation;
};
const getCurrentSession = async (req, res) => {
  const { id } = req.params;
  const { groupId } = req.body;
  try {
    const presentation = await Presentation.findOne({
      _id: id,
    });
    console.log("presentation find in current session ", id, presentation);
    if (!presentation || !presentation.status)
      return res.status(400).send("Session not found");

    switch (presentation.status) {
      case 2: {
        const groupPresent = await GroupPresentation.findOne({
          group_id: groupId,
          presentation_id: id,
        }).lean();
        if (!groupPresent) {
          return res
            .status(400)
            .send({ message: "Group presentation not found" });
        }
        return res
          .status(200)
          .send({ data: { session: groupPresent.current_session } });
      }
      case 3: {
        return res
          .status(200)
          .send({ data: { session: presentation.current_session } });
      }
    }
    return res.status(400).send("Session not found");
  } catch (err) {
    console.error(err);
    return res.status(400).send("Session not found");
  }
};
const checkJoinPresentingPermission = async (id, groupId, user) => {
  try {
    const presentation = await Presentation.findOne({
      _id: id,
    });
    if (!presentation || !presentation.status) return null;

    switch (presentation.status) {
      case 2: {
          let group =null;
          if ((typeof groupId === 'string' || groupId instanceof String)&&groupId.length>24 )
          {

            group={id: groupId}
          }
          else{
            group = await Group.findOne({
                _id: groupId,
              });
          }
        if(!group) return false;
        const userGroup = await UserGroup.find({
          group_id: group._id,
          user_id: user.id,
          is_deleted: false,
        });
        if (!userGroup || userGroup.length == 0) {
          return false;
        }
        return true;
      }
      case 3: {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const updateCurrentSlide = async (id, sessionId) => {
  try {
    const presentation = await Presentation.findOne({
      _id: id,
    });
    console.log("updateCurrentSlide ", presentation);
    if (!presentation || !presentation.status) return false;
    switch (presentation.status) {
      case 2: {
        const groupPresent = await GroupPresentation.findOne({
          presentation_id: id,
          current_session: sessionId,
        }).lean();
        console.log("updateCurrentSlide groupPresent ", groupPresent);
        const nextSlide = await Slide.find({
          presentation_id: id,
          index: { $gt: groupPresent.current_slide },
        }).lean();
        console.log("updateCurrentSlide nextSlide ", nextSlide);
        if (!nextSlide || !nextSlide.length) return false;
        await GroupPresentation.updateOne(
          { current_session: sessionId, presentation_id: id },
          { current_slide: nextSlide[0].index }
        );
        return true;
      }
      case 3: {
        const nextSlide = await Slide.find({
          presentation_id: id,
          index: { $gt: presentation.current_slide },
        })
          .sort({ index: 1 })
          .lean();
        if (!nextSlide || !nextSlide.length) return false;
        await Presentation.updateOne(
          { _id: id },
          { current_slide: nextSlide[0].index }
        );
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
};
const getCurrentSlide = async (req, res) => {
  const id = req.params.id;
  const { sessionId } = req.body;

  try {
    const presentation = await Presentation.findOne({
      _id: id,
    });
    if (!presentation || !presentation.status)
      res.status(400).send("Presentation not found");
    switch (presentation.status) {
      case 2: {
        const groupPresent = await GroupPresentation.findOne({
          presentation_id: id,
          current_session: sessionId,
        }).lean();
        return res
          .status(200)
          .send({ data: { current_slide: groupPresent.current_slide } });
      }
      case 3: {
        return res
          .status(200)
          .send({ data: { current_slide: presentation.current_slide } });
      }
    }
    return res.status(400).send("Presentation is not available");
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const getPresentingRole = async (req, res) => {
  const id = req.params.id;
  const { sessionId } = req.body;
  let user = req.user;
  try {
    if (!user) res.status(200).send({ data: { role: "user" } });

    const presentation = await Presentation.findOne({
      _id: id,
    });
    if (!presentation || !presentation.status)
      res.status(400).send("Presentation not found");
    switch (presentation.status) {
      case 2: {
        const groupPresent = await GroupPresentation.findOne({
          presentation_id: id,
          current_session: sessionId,
        }).lean();
        const checkPermission =
          (await _isCoOwner(user, groupPresent.group_id)) ||
          (await _isOwner(user, groupPresent.group_id));
        if (!groupPresent || !checkPermission) {
          return res.status(200).send({ data: { role: "user" } });
        }
        return res.status(200).send({ data: { role: "admin" } });
      }
      case 3: {
        if (String(presentation.created_by) !== String(user._id)) {
          return res.status(200).send({ data: { role: "user" } });
        }
        return res.status(200).send({ data: { role: "admin" } });
      }
    }
    res.status(200).send({ data: { role: "user" } });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};

const checkPermissionPresenting = async (id, sessionId, user) => {
  try {
    const presentation = await Presentation.findOne({
      _id: id,
    });
    console.log(
      "checkPermissionPresenting presentation ",
      presentation,
      sessionId
    );
    if (!presentation || !presentation.status || !user || !user._id)
      return false;
    switch (presentation.status) {
      case 2: {
        const groupPresent = await GroupPresentation.findOne({
          presentation_id: id,
          current_session: sessionId,
        }).lean();
        const checkPermission =
          (await _isCoOwner(user, groupPresent.group_id)) ||
          (await _isOwner(user, groupPresent.group_id));
        if (!groupPresent || !checkPermission) {
          return false;
        }
        return true;
      }
      case 3: {
        console.log(user._id);
        console.log(presentation.created_by);

        if (String(presentation.created_by) !== String(user._id)) {
          return false;
        }
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const addCollabor = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { email } = req.body;
  const presentation = await Presentation.findOne({ _id: id });
  if (!presentation) return res.status(400).send("Presentation not found");
  if (String(presentation.created_by) !== String(user._id)) {
    return res.status(400).send("You cannot access this presentation");
  }
  const collabor = await _getUserByEmail(email);
  try {
    for (let c of collabor) {
      const isExits = await _checkCollaborRole(id, c._id);
      console.log(isExits);
      if (isExits) continue;
      await Presentation.updateOne(
        { _id: id },
        {
          $push: { collaborators: c._id },
        }
      );
    }
    const present = await Presentation.findOne({ _id: id });

    return res
      .status(200)
      .send({ data: present, message: `Add collaborators successfully` });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const removeCollabor = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { email } = req.body;
  const presentation = await Presentation.findOne({ _id: id });
  if (!presentation) return res.status(400).send("Presentation not found");
  if (String(presentation.created_by) !== String(user._id)) {
    return res.status(400).send("You cannot access this presentation");
  }
  const collabor = await _getUserByEmail(email);
  try {
    for (let c of collabor) {
      const isExits = await _checkCollaborRole(id, c._id);
      if (!isExits) continue;
      await Presentation.updateOne(
        { _id: id },
        {
          $pull: { collaborators: c._id },
        }
      );
    }
    const present = await Presentation.findOne({ _id: id });

    return res
      .status(200)
      .send({ data: present, message: `Remove collaborators successfully` });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const setCollaborators = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { email } = req.body;
  const presentation = await Presentation.findOne({ _id: id });
  if (!presentation) return res.status(400).send("Presentation not found");
  if (String(presentation.created_by) !== String(user._id)) {
    return res.status(400).send("You cannot access this presentation");
  }
  try {
    const collabor = await _getUserByEmail(email);
    await Presentation.updateOne({ _id: id }, { collaborators: [] });
    for (let c of collabor) {
      const isExits = await _checkCollaborRole(id, c._id);
      console.log(isExits);

      if (isExits) continue;
      const add = await Presentation.updateOne(
        { _id: id },
        {
          $push: { collaborators: c._id },
        }
      );
    }
    const present = await Presentation.findOne({ _id: id });

    return res
      .status(200)
      .send({ data: present, message: `Add collaborators successfully` });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const getColaborator = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const presentation = await Presentation.findOne({ _id: id });
  if (!presentation) return res.status(400).send("Presentation not found");
  const checkRole = await _checkCollaborRole(id, user._id);
  if (!checkRole) {
    return res.status(400).send("You cannot access this presentation");
  }
  try {
    const colaborator = await Presentation.findOne(
      { _id: id },
      { collaborators: 1 }
    )
      .populate({
        path: "collaborators",
        model: User,
        select: "username email name",
      })
      .lean();
    return res.status(200).send({ data: colaborator });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const _checkCollaborRole = async (id, userId) => {
  const presentation = await Presentation.findOne({ _id: id });
  if (!presentation || !userId) return false;
  if (String(presentation.created_by) === String(userId)) return true;
  // console.log(presentation.collaborators)
  const notExist = presentation.collaborators.filter((c) => {
    return String(c) === String(userId);
  });
  console.log(notExist);
  if (notExist && notExist.length > 0) return true;
  return false;
};
const sharePresent = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { groupId } = req.body;
  const presentation = await Presentation.findOne({ _id: id });
  if (!presentation) return res.status(400).send("Presentation not found");
  const group = await Group.findOne({ id: groupId, is_deleted: false });
  if (!group) return res.status(400).send("Group not found");
  const isGroupOwner = await _isOwner(user, groupId);
  if (String(presentation.created_by) !== String(user._id) || !isGroupOwner) {
    return res.status(400).send("You cannot access this feature");
  }
  try {
    const groupPresent = await GroupPresentation.find({
      group_id: group._id,
      presentation_id: id,
    });
    console.log(groupPresent);
    if (groupPresent && groupPresent.length > 0) {
      return res.status(400).send("This presetation already shared");
    }
    const newShare = { group_id: group._id, presentation_id: id };
    const member = await GroupPresentation.create(newShare);
    return res.status(200).send({
      data: member,
      message: `Share this presentation to a group successfully`,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const removeSharingPresent = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const groupPresent = await GroupPresentation.findOne({ _id: id }).lean();
  console.log(id, groupPresent);
  if (!groupPresent)
    return res.status(400).send("Sharing presentation not found");
  try {
    const presentation = await Presentation.findOne({
      _id: groupPresent.presentation_id,
    });
    if (!presentation) return res.status(400).send("Presentation not found");
    const group = await Group.findOne({
      _id: groupPresent.group_id,
      is_deleted: false,
    });
    if (!group) return res.status(400).send("Group not found");
    const isGroupOwner = await _isOwner(user, group.id);
    if (String(presentation.created_by) !== String(user._id) || !isGroupOwner) {
      return res.status(400).send("You cannot access this feature");
    }
    await GroupPresentation.deleteOne({ _id: id });
    return res.status(200).send({
      data: groupPresent,
      message: `Remove the presentation from group successfully`,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const getSharingPresent = async (req, res) => {
  const { id } = req.params;
  const group = await Group.findOne({ id: id, is_deleted: false });
  if (!group) return res.status(400).send("Group not found");
  try {
    let groupPresent = await GroupPresentation.find({
      group_id: group._id,
    }).lean();
    let result = [];
    for (let gp of groupPresent) {
      const present = await Presentation.findOne(
        { _id: gp.presentation_id },
        { name: 1, created_by: 1, status: 1 }
      )
        .populate({
          path: "created_by",
          model: User,
          select: "username email name",
        })
        .lean();

      result.push({ ...gp, present });
    }
    return res.status(200).send({ data: result });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const toggleStatus = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const presentation = await Presentation.findOne({ _id: id });
  if (!presentation) return res.status(400).send("Presentation not found");
  let { status, groupId } = req.body;
  if (status) status = Math.max(Math.min(status, 3), 0);
  const oldStatus = presentation.status;
  let newSessions = uuidv4();
  try {
    switch (status) {
      case 0: {
        newSessions =""
        switch (oldStatus) {
          case 1: {
            const checkRole = await _checkCollaborRole(id, user._id);
            if (!checkRole) {
              return res
                .status(400)
                .send("You cannot access presentation in status" + oldStatus);
            }
            break;
          }
          case 2: {
            const groupPresent = await GroupPresentation.findOne({
              group_id: groupId,
              presentation_id: id,
            }).lean();
            const checkPermission =
              (await _isCoOwner(user, groupId)) ||
              (await _isOwner(user, groupId));
            if (!groupPresent || !checkPermission) {
              return res
                .status(400)
                .send("You cannot access presentation in status " + oldStatus);
            }
            await GroupPresentation.updateOne(
              { group_id: groupId, presentation_id: id },
              { current_session: "", current_slide: 0 }
            );
            const ortherGroupPresent = await GroupPresentation.find({
              group_id: { $ne: groupId },
              presentation_id: id,
              current_session: { $ne: "" },
            }).lean();
            if(ortherGroupPresent&&ortherGroupPresent.current_session)
            {
              return res.status(200).send({
                  data: {},
                  message: `Update successfully presentation id ${id}`,
              });
            }
            break;
          }
          case 3: {
            if (String(presentation.created_by) !== String(user._id)) {
              return res
                .status(400)
                .send("You cannot access this presentation");
            }
            
            break;
          }
        }
        break;
      }
      case 1: {
        newSessions =""
        const checkRole = await _checkCollaborRole(id, user._id);
        console.log(oldStatus > 0 || !checkRole);
        console.log(oldStatus);
        if (oldStatus > 0 || !checkRole) {
          return res
            .status(400)
            .send("You cannot access presentation in status" + oldStatus);
        }
        break;
      }
      case 2: {
        const groupPresent = await GroupPresentation.findOne({
          group_id: ObjectID(groupId),
          presentation_id: ObjectID(id),
        }).lean();
        const checkPermission = (await _isCoOwner(user, groupId)) || (await _isOwner(user, groupId));
        console.log("checkPermission found", checkPermission, oldStatus);
        
        if (
          oldStatus == 1 ||
          oldStatus == 3 ||
          !groupPresent ||
          !checkPermission
        ) {
          return res
            .status(400)
            .send("You cannot access presentation in status" + oldStatus);
        }
        const ortherGroupPresent = await GroupPresentation.findOne({
          group_id: groupId,
          presentation_id: { $ne: id },
          current_session: { $ne: "" },
        }).lean();
        console.log("ortherGroupPresent ", ortherGroupPresent)
        if(ortherGroupPresent&&ortherGroupPresent.current_session)
        {
          return res
            .status(400)
            .send("There are another present stating in this group");
        }
        await GroupPresentation.updateOne(
          { group_id: groupId, presentation_id: id },
          { current_session: newSessions, current_slide: 0 }
        );
        newSessions =""

        break;
      }
      case 3: {
        console.log(
          "public presentation ",
          oldStatus,
          presentation.created_by,
          user._id
        );
        if (
          oldStatus > 0 ||
          String(presentation.created_by) !== String(user._id)
        ) {
          return res.status(400).send("You cannot access this presentation");
        }
        break;
      }
    }
    const present = await Presentation.updateOne(
      { _id: id },
      { status: status, current_slide: 0, current_session: newSessions }
    );
    return res.status(200).send({
      data: present,
      message: `Update successfully presentation id ${id}`,
    });
  } catch (err) {
    return res.status(400).send({ message: "Error in database conection" });
  }
};
const _getUserByEmail = async (email) => {
  const user = await User.find({ email: email, is_deleted: false });
  return user;
};
const _isOwner = async (user, groupId) => {
  let group =null;
  if ((typeof groupId === 'string' || groupId instanceof String)&&groupId.length>24 )
  {

    group={id: groupId}
  }
  else{
    group = await Group.findOne({
        _id: groupId,
      });
  }
  if(!group) return false;
  const userGroup = await UserGroup.findOne({
    group_id: group.id,
    user_id: user.id,
    is_deleted: false,
  });
  if (userGroup?.role == "owner") return true;
  return false;
};
const _isCoOwner = async (user, groupId) => {
  let group =null;
  if ((typeof groupId === 'string' || groupId instanceof String)&&groupId.length>24 )
  {
    group={id: groupId}
  }
  else{
    group = await Group.findOne({
        _id: groupId,
      });
  }
  if(!group) return false;
  const userGroup = await UserGroup.findOne({
    group_id: group.id,
    user_id: user.id,
    is_deleted: false,
  });
  if (userGroup?.role == "co-owner") return true;
  return false;
};
const getSessionMethod = async (id, groupId) => {
  try {
    const presentation = await Presentation.findOne({
      _id: id,
    });
    console.log("getSessionMethod presentation ", presentation);
    if (!presentation || !presentation.status) return null;

    switch (presentation.status) {
      case 2: {
        const groupPresent = await GroupPresentation.findOne({
          group_id: groupId,
          presentation_id: id,
        }).lean();
        await GroupPresentation.findOne({
          group_id: groupId,
          presentation_id: id,
        });
        return groupPresent.current_session;
      }
      case 3: {
        return presentation.current_session;
      }
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

module.exports = {
  getMyPrensent,
  getMyOwnPrensent,
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
  deleteCollaborator,
  toggleStatus,
  getCurrentSession,
  updateCurrentSlide,
  checkPermissionPresenting,
  getPresentingRole,
  getCurrentSlide,
  checkJoinPresentingPermission,
  sharePresent,
  removeSharingPresent,
  getSharingPresent,
  getSessionMethod,
};
