const socketIO = require("socket.io");
const PresentationControler = require("./presentation/presentation.controller");
const SlideControler = require("./slide/slide.controller");

const {
  addUserAnswer,
  getSlideByOptionId,
  getTotalAnswerBySlide,
} = require("./slide/option/option.method");
const chatMethod = require("./chat/chat.method");
const questionMethod = require("./question/question.method");

const { Server } = require("socket.io");

const socketSetup = (httpServer) => {
  console.log("Hello this is socket server");
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.log("Hello this is socket server");

    socket.on("disconnect", ({ id, username, reason }) => {
      console.log("Socket " + id + " was disconnected");
      console.log(reason);
      io.to(id).emit("user-disconnect", { data: { username: username } });
    });
    socket.on("init-game", async ({ id, groupId, user }) => {
      try {
        let present = await PresentationControler.validatePublicForm(id);
        console.log("present");
        const current_session = await PresentationControler.getSessionMethod(
          id,
          groupId
        );

        const checkJoinPresentingPermisstion =
          await PresentationControler.checkJoinPresentingPermisstion(
            id,
            groupId,
            user
          );
        console.log("check init game", present, checkJoinPresentingPermisstion);

        if (!present || !current_session || !checkJoinPresentingPermisstion)
          return io.to(id).emit("new-session-for-game", {
            status: "error",
            data: { message: "Session noot found" },
          });
        else {
          console.log("presentation current_session ", current_session);
          await socket.join(current_session);
          io.in(current_session).emit("new-session-for-game", {
            status: "sucess",
            data: { current_session: current_session },
          });

          console.log("rooms ", socket.rooms);
        }
      } catch (err) {
        console.error(err);
      }
    });
    // socket.on('start-game', async (id) => {
    //   try {
    //     let present = await PresentationControler.validatePublicForm(id);

    //     if (!present)
    //       socket
    //         .to(id)
    //         .emit('game-started', {
    //           status: 'error',
    //           message: 'Present not found',
    //         });
    //     else {
    //       socket
    //         .to(id)
    //         .emit('game-started', { status: 'succes', data: { id: id } });
    //     }
    //   } catch (err) {
    //     console.error(err);
    //     socket
    //       .to(id)
    //       .emit('game-started', { status: 'error', message: err.message });
    //   }
    // });
    socket.on("next-slide", async ({ id, presentationId, user }) => {
      try {
        let present = await PresentationControler.validatePublicForm(
          presentationId
        );
        console.log("next-slide present ", present);
        const checkPermission =
          await PresentationControler.checkPermissionPresenting(
            presentationId,
            id,
            user
          );
        console.log("next-slide checkPermission present ", checkPermission);

        if (!present || !checkPermission)
          return io.to(id).emit("slide-changed", {
            status: "400",
            message: "Present not found",
          });
        const nextSlide = await PresentationControler.updateCurrentSlide(
          presentationId,
          id
        );
        console.log("next-slide nextSlide", nextSlide);
        if (!nextSlide) {
          io.to(id).emit("slide-changed", {
            status: "400",
            message: "Next slide not found",
          });
        } else {
          return io.to(id).emit("slide-changed", {
            status: "200",
            data: {},
          });
        }
      } catch (err) {
        console.error(err);
        next(err.message);
      }
    });
    socket.on("show-result", async ({ id, slideId, presentationId, user }) => {
      try {
        let present = await PresentationControler.validatePublicForm(
          presentationId
        );
        const checkPermission =
          await PresentationControler.checkPermissionPresenting(
            presentationId,
            id,
            user
          );
        if (!present || !checkPermission)
          io.to(id).emit("slide-result", {
            status: "error",
            message: "Present not found",
          });
        else {
          let total = await getTotalAnswerBySlide(slideId);
          console.log(total);
          if (!total)
            io.to(id).emit("slide-result", {
              status: "error",
              message: "Error in getting slide result",
            });
          else
            socket
              .to(id)
              .emit("slide-result", { status: "sucess", data: { total } });
        }
      } catch (err) {
        console.error(err);
        if (!present)
          socket
            .to(id)
            .emit("slide-result", { status: "error", message: err.message });
      }
    });

    socket.on(
      "add-chat-message",
      async ({ id, presentationId, username, message }) => {
        try {
          let present = await PresentationControler.validatePublicForm(
            presentationId
          );
          if (!present) {
            io.to(id).emit("user-adding-message-chat", {
              status: "error",
              message: "Present not found",
            });
          } else {
            const chat = await chatMethod.add(
              id,
              presentationId,
              username,
              message
            );
            console.log(chat);

            io.to(id).emit("user-adding-message-chat", {
              status: "sucess",
              data: { chat },
            });
          }
        } catch (err) {
          console.error(err);
          io.to(id).emit("user-adding-message-chat", {
            status: "error",
            message: err.message,
          });
        }
      }
    );
    socket.on(
      "add-question",
      async ({ id, presentationId, username, content }) => {
        try {
          let present = await PresentationControler.validatePublicForm(
            presentationId
          );
          if (!present) {
            io.to(id).emit("user-adding-question", {
              status: "error",
              message: "Present not found",
            });
          } else {
            const question = await questionMethod.add(
              id,
              presentationId,
              username,
              content
            );
            console.log(question);
            io.to(id).emit("user-adding-question", {
              status: "sucess",
              data: { question },
            });
          }
        } catch (err) {
          console.error(err);
          io.to(id).emit("user-adding-question", {
            status: "error",
            message: err.message,
          });
        }
      }
    );
    socket.on(
      "mark-answered-question",
      async ({ id, presentationId, questionId, user }) => {
        try {
          let present = await PresentationControler.validatePublicForm(
            presentationId
          );
          const checkPermission =
            await PresentationControler.checkPermissionPresenting(
              presentationId,
              id,
              user
            );

          if (!present || !checkPermission) {
            io.to(id).emit("host-mark-question", {
              status: "error",
              message: "Present not found",
            });
          } else {
            const answered = await questionMethod.toggleStatus(questionId);
            console.log({ questionId: questionId, isAnswered: answered });
            io.to(id).emit("host-mark-question", {
              status: "sucess",
              data: { questionId: questionId, isAnswered: answered },
            });
          }
        } catch (err) {
          console.error(err);
          io.to(id).emit("host-mark-question", {
            status: "error",
            message: err.message,
          });
        }
      }
    );
    socket.on("upvote-question", async ({ id, presentationId, questionId }) => {
      try {
        let present = await PresentationControler.validatePublicForm(
          presentationId
        );
        if (!present) {
          io.to(id).emit("user-voting-question", {
            status: "error",
            message: "Present not found",
          });
        } else {
          const vote = await questionMethod.upVote(questionId);
          console.log({ questionId: questionId, vote: vote });

          io.to(id).emit("user-voting-question", {
            status: "sucess",
            data: { questionId: questionId, vote: vote },
          });
        }
      } catch (err) {
        console.error(err);
        io.to(id).emit("user-voting-question", {
          status: "error",
          message: err.message,
        });
      }
    });

    socket.on(
      "send-answer-to-host",
      async ({ id, presentationId, username, options }) => {
        try {
          let present = await PresentationControler.validatePublicForm(
            presentationId
          );
          if (!present) {
            io.to(id).emit("get-answer-from-player", {
              status: "error",
              message: "Present not found",
            });
          } else {
            await addUserAnswer(username, options);
            const slideId = await getSlideByOptionId(options);
            let total = await getTotalAnswerBySlide(slideId);
            console.log({ username, options, total });
            io.to(id).emit("get-answer-from-player", {
              status: "sucess",
              data: { username, options, total },
            });
          }
        } catch (err) {
          console.error(err);
          io.to(id).emit("get-answer-from-player", {
            status: "error",
            message: err.message,
          });
        }
      }
    );
  });
};

module.exports = { socketSetup };
