import ordersNamespce from "./namespaces/orders.js";
import tempSessionNamespace from "./namespaces/temp.sessions.socket.js";
import qrCodeNamespace from "./namespaces/qrcode.socket.js";
const setupSocketNamespaces = (io) => {
  const orders = io.of("/orders");
  const orders_by_table = io.of("/orders-by-table");
  const tempSession = io.of("/get-temp-sessions");
  const qrCode = io.of("/check-qrcode");
  ordersNamespce.orderNamespace(orders);
  ordersNamespce.orderByTableNamespce(orders_by_table);
  tempSessionNamespace(tempSession);
  qrCodeNamespace(qrCode);
};

export default setupSocketNamespaces;
