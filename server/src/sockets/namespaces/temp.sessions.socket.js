import tempSessionConroller from "../../controller/v1/app/temp.session.controller.js";

const tempSessionNamespace = (io) => {
  io.on("connection", (socket) => {
    socket.on("temp_sessions", async (playload) => {
      // let finalData = JSON.parse();
      // console.log("Socket data : ", SocketData);
      const data = await tempSessionConroller.getTempSessions(
        playload.table_no
      );
      socket.emit("temp_sessions", data);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected from /get-temp-sessions");
    });
  });
};

export default tempSessionNamespace;
