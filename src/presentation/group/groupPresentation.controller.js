const GroupPresentation = require("./groupPresentation.model");
const getGroupPresentation = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (!user) {
    return res.status(400).send("User not found");
  }
  try {
    const groupPresentation = await GroupPresentation.findOne({
      _id: id,
    });
    return res.status(200).send({ data: groupPresentation });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Error in database conection" });
  }
};
module.exports = {
  getGroupPresentation,
};
