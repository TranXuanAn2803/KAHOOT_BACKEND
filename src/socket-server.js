const socketIO = require("socket.io");
const Presentation = require("./presentation/presentation.model");
const { addUserAnswer } = require("./slide/option/option.method");
const { Server } = require("socket.io");

// const io = socketIO(3001, {
//     cors: {
//         origin: '*',
//     },
// }).sockets;

const socketSetup_ = () => {
  io.on("connection", (socket) => {
    socket.on("disconnect", (reason) => {
      console.log("Socket " + socket.id + " was disconnected");
      console.log(reason);
    });
    socket.on("init-game", async (pin, id, next) => {
      socket.join(game.pin);
      try {
        let present = await Presentation.find({ _id: id, link_code: pin });
        if (!present) next("present not found");
        else {
          socket.join(id);
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });
    socket.on("start-game", async (id, next) => {
      try {
        let present = await Presentation.find({ _id: id });
        if (!present) next("present not found");
        else {
          socket.to(id).emit("game-started", id);
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });
    socket.on("next-slide", async (id, next) => {
      try {
        let present = await Presentation.find({ _id: id });
        if (!present) next("present not found");
        else {
          socket.to(id).emit("slide-changed");
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });

    socket.on("send-answer-to-host", async (id, slideId, username, next) => {
      try {
        let present = await Presentation.find({ _id: id });
        if (!present) {
          next("present not found");
          addUserAnswer(username, slideId);
        } else {
          socket.to(id).emit("get-answer-from-player", username, slideId);
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });
  });
};

const socketSetup = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    socket.on("disconnect", (reason) => {
      console.log("Socket " + socket.id + " was disconnected");
      console.log(reason);
    });
    socket.on("init-game", async (pin, id, next) => {
      socket.join(game.pin);
      try {
        let present = await Presentation.find({ _id: id, link_code: pin });
        if (!present) next("present not found");
        else {
          socket.join(id);
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });
    socket.on("start-game", async (id, next) => {
      try {
        let present = await Presentation.find({ _id: id });
        if (!present) next("present not found");
        else {
          socket.to(id).emit("game-started", id);
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });
    socket.on("next-slide", async (id, next) => {
      try {
        let present = await Presentation.find({ _id: id });
        if (!present) next("present not found");
        else {
          socket.to(id).emit("slide-changed");
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });

    socket.on("send-answer-to-host", async (id, slideId, username, next) => {
      try {
        let present = await Presentation.find({ _id: id });
        if (!present) {
          next("present not found");
          addUserAnswer(username, slideId);
        } else {
          socket.to(id).emit("get-answer-from-player", username, slideId);
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });
  });
};

module.exports = { socketSetup };
