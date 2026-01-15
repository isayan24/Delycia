import ordersController from "../../controller/v1/web/orders.controller.js";
import socketAuthMiddleware from "../../middlewares/ws.auth.middleware.js";

const orderNamespace = (io) => {
  io.use(socketAuthMiddleware);
  io.on("connection", (socket) => {
    socket.on("all_orders", async (rid) => {
      const data = await ordersController.getOrders24Hours(rid);
      socket.emit("all_orders", data);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Client disconnected from /orders. Reason:", reason);
    });
  });
};

const orderByTableNamespce = (io) => {
  io.on("connection", (socket) => {
    socket.on("table_orders", async (playload) => {
      const data = await ordersController.getOrderByTable(playload);
      socket.emit("table_orders", data);
    });

    socket.on("disconnected", () => {
      console.log("Client disconnected from /orders-by-table");
    });
  });
};

export default { orderNamespace, orderByTableNamespce };
