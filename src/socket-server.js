const socketIO = require("socket.io");
const Presentation = require("./presentation/presentation.model");
const PresentationControler = require("./presentation/presentation.controller");

const { addUserAnswer, getTotalAnswerBySlide } = require("./slide/option/option.method");
const { Server } = require("socket.io");

const socketSetup_ = () => {
  const io = socketIO(3002, {
    cors: {
      origin: "*",
    },
  }).sockets;
  io.on("connection", (socket) => {
    socket.on("disconnect", (reason) => {
      console.log("Socket " + socket.id + " was disconnected");
      console.log(reason);
    });
    socket.on("init-game", async (pin, id, next) => {
      socket.join(game.pin);
      try {
        let present = await PresentationControler.validatePublicForm(id, pin);
        if (!present||present.link_code!=pin) next("present not found");
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
        let present = await PresentationControler.validatePublicForm(id);
            
        if (!present) socket.to(id).emit("game-started", {status: "error", message:"Present not found"});
        else {
          socket.to(id).emit("game-started", {status: "succes", data:{id: id}});
        }
      } catch (err) {
        console.error(err);
        socket.to(id).emit("game-started", {status: "error", message:err.message});
      }
    });
    socket.on("next-slide", async (id, next) => {
      try {
        let present = await PresentationControler.validatePublicForm(id);
        if (!present) socket.to(id).emit("slide-changed", {status: "error", message:"Present not found"});
        else {          
          socket.to(id).emit("slide-changed", {status: "sucess", data:{}});
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });

    socket.on("send-answer-to-host", async (id, username, options) => {
      try {
        let present = await PresentationControler.validatePublicForm(id);
        if (!present) {
          socket.to(id).emit("get-answer-from-player", {status: "error", message:"Present not found"});
          addUserAnswer(username, slideId);
        } else {
          socket.to(id).emit("get-answer-from-player",  {status: "sucess", data:{username, options}});
        }
      } catch (err) {
        console.error(err);
        socket.to(id).emit("get-answer-from-player", {status: "error", message:err.message});

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
        let present = await PresentationControler.validatePublicForm(id, pin);
        if (!present||present.link_code!=pin) next("present not found");
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
        let present = await PresentationControler.validatePublicForm(id);
            
        if (!present) socket.to(id).emit("game-started", {status: "error", message:"Present not found"});
        else {
          socket.to(id).emit("game-started", {status: "succes", data:{id: id}});
        }
      } catch (err) {
        console.error(err);
        socket.to(id).emit("game-started", {status: "error", message:err.message});
      }
    });
    socket.on("next-slide", async (id, next) => {
      try {
        let present = await PresentationControler.validatePublicForm(id);
        if (!present) socket.to(id).emit("slide-changed", {status: "error", message:"Present not found"});
        else {          
          socket.to(id).emit("slide-changed", {status: "sucess", data:{}});
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });
    socket.on("show-result", async (id, slideId) => {
      try {
        let present = await PresentationControler.validatePublicForm(id);
        if (!present) socket.to(id).emit("slide-result", {status: "error", message:"Present not found"});
        else {          
          let total = await getTotalAnswerBySlide(slideId)
          if (!total) socket.to(id).emit("slide-result", {status: "error", message:"Error in getting slide result"});
          else 
            socket.to(id).emit("slide-result", {status: "sucess", data:{total}});
        }
      } catch (err) {
        console.error(err);
          if (!present) socket.to(id).emit("slide-result", {status: "error", message:err.message});
      }
    });

    socket.on("send-answer-to-host", async (id, username, options) => {
      try {
        let present = await PresentationControler.validatePublicForm(id);
        if (!present) {
          socket.to(id).emit("get-answer-from-player", {status: "error", message:"Present not found"});
          await addUserAnswer(username, slideId);
        } else {
          socket.to(id).emit("get-answer-from-player",  {status: "sucess", data:{username, options}});
        }
      } catch (err) {
        console.error(err);
        socket.to(id).emit("get-answer-from-player", {status: "error", message:err.message});
      }
    });
  });
};

module.exports = { socketSetup };
