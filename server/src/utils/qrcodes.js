import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import QRcode from "qrcode";

const qrcodeDir = path.join(process.cwd(), "public", "qrcodes");

if (!fs.existsSync(qrcodeDir)) fs.mkdirSync(qrcodeDir, { recursive: true });

const generate = async (rid, table_no) => {
  let randomID = randomBytes(5).toString("hex");
  randomID += `-${rid}-${table_no}`;
  //const URL = `http://192.168.0.115:5500/index.html?code=${randomID}`;
  const URL = `https://open.delycia.com/?code=${randomID}`;
  const filename = `${randomID}.png`;
  const filepath = path.join(qrcodeDir, filename);

  try {
    await QRcode.toFile(filepath, URL, {
      color: {
        dark: "#000000",
        light: "#FFECD5",
      },
      width: 512,
      scale: 10, //pixel density
    });

    const imageURL = `https://api.delycia.com/qrcodes/${filename}`;
    //const imageURL = `http://192.168.0.115:8020/qrcodes/${filename}`;
    console.log(imageURL);
    return { status: true, URL: imageURL, id: randomID };
  } catch (error) {
    return { status: false, error: error.message };
  }
};

//await generate(11);

export default { generate };
