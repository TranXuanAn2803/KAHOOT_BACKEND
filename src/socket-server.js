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
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]

    },
  });
  io.on("connection", (socket) => {
    socket.on("disconnect", ({ id, username, reason }) => {
      console.log("Socket " + id + " was disconnected");
      console.log(reason);
      io.in(id).emit("user-disconnect", { data: { username: username } });
    });
    socket.on("init-game", async ({ id, groupId, user }) => {
      console.log("int game props ", id, groupId, user);
      try {
        let present = await PresentationControler.validatePublicForm(id);
        const current_session = await PresentationControler.getSessionMethod(
          id,
          groupId
        );

        const checkJoinPresentingPermission = 
          await PresentationControler.checkJoinPresentingPermission(
            id,
            groupId,
            user
          );
        console.log(
          "check init game ",
          current_session,
          checkJoinPresentingPermission
        );
        if (!present || !current_session || !checkJoinPresentingPermission)
          return io.in(id).emit("new-session-for-game", {
            status: "error",
            data: { message: "Session not found" },
          });
        else {
          await socket.join(current_session);
          io.in(current_session).emit("new-session-for-game", {
            status: "sucess",
            data: { current_session: current_session },
          });
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
    socket.on("next-slide", async ({ id: sessionId, presentationId, user }) => {
      try {
        let present = await PresentationControler.validatePublicForm(
          presentationId
        );
        const checkPermission =
          await PresentationControler.checkPermissionPresenting(
            presentationId,
            sessionId,
            user
          );

        if (!present || !checkPermission)
          return io.in(sessionId).emit("slide-changed", {
            status: 400,
            message: "Present not found",
          });
        const nextSlide = await PresentationControler.updateCurrentSlide(
          presentationId,
          sessionId
        );
        console.log("next slide ", nextSlide);
        if (!nextSlide) {
          return io.in(sessionId).emit("slide-changed", {
            status: 400,
            message: "Next slide not found",
          });
        } else {
          present = await PresentationControler.validatePublicForm(
            presentationId
          );
          console.log("return next slide");
          return io.in(sessionId).emit("slide-changed", {
            status: 200,
            data: { currentSlide: present.current_slide },
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
          io.in(id).emit("slide-result", {
            status: "error",
            message: "Present not found",
          });
        else {
          let total = await getTotalAnswerBySlide(slideId);
          if (!total)
            io.in(id).emit("slide-result", {
              status: "error",
              message: "Error in getting slide result",
            });
          else
            socket
              .to(id)
              .emit("slide-result", { status: "sucess", data: { total } });
        }
      } catch (err) {
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
            io.in(id).emit("user-adding-message-chat", {
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

            io.in(id).emit("user-adding-message-chat", {
              status: "sucess",
              data: { chat },
            });
          }
        } catch (err) {
          io.in(id).emit("user-adding-message-chat", {
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
            io.in(id).emit("user-adding-question", {
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
            io.in(id).emit("user-adding-question", {
              status: "sucess",
              data: { question },
            });
          }
        } catch (err) {
          console.error(err);
          io.in(id).emit("user-adding-question", {
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
            io.in(id).emit("host-mark-question", {
              status: "error",
              message: "Present not found",
            });
          } else {
            const answered = await questionMethod.toggleStatus(questionId);
            io.in(id).emit("host-mark-question", {
              status: "sucess",
              data: { questionId: questionId, isAnswered: answered },
            });
          }
        } catch (err) {
          console.error(err);
          io.in(id).emit("host-mark-question", {
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
          io.in(id).emit("user-voting-question", {
            status: "error",
            message: "Present not found",
          });
        } else {
          const vote = await questionMethod.upVote(questionId);

          io.in(id).emit("user-voting-question", {
            status: "sucess",
            data: { questionId: questionId, vote: vote },
          });
        }
      } catch (err) {
        io.in(id).emit("user-voting-question", {
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
            io.in(id).emit("get-answer-from-player", {
              status: "error",
              message: "Present not found",
            });
          } else {
            await addUserAnswer(username, options);
            const slideId = await getSlideByOptionId(options);
            let total = await getTotalAnswerBySlide(slideId);
            io.in(id).emit("get-answer-from-player", {
              status: "sucess",
              data: { username, options, total },
            });
          }
        } catch (err) {
          console.error(err);
          io.in(id).emit("get-answer-from-player", {
            status: "error",
            message: err.message,
          });
        }
      }
    );
  });
};

module.exports = { socketSetup };
