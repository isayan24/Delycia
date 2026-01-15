import qrcodeController from "../../controller/v1/app/qrcode.controller.js";

const qrCodeNamespace = async (io) => {
  io.on("connection", (socket) => {
    console.log("Client Connected  ✅ :  /check-qrcode");
    socket.on("qr_codes", async (payload) => {
      console.log("QR Socket data : ", payload);
      let JSONdata = payload;
      const result = await qrcodeController.checkQR(
        JSONdata.table_no,
        JSONdata.rid
      );
      socket.emit("qr_codes", result);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected ❌ : /check-qrcode");
    });
  });
};

export default qrCodeNamespace;
