import app from "./app.js";
import "dotenv/config";

const host = "192.168.0.115";
const port = process.env.PORT;

app.server.listen(port || 8080, () => {
  console.log(
    `Server has started : http://localhost:${process.env.PORT || 8080}`
  );
});
