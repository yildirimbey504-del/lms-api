import express from "express"
import { configDotenv } from "dotenv"
import appRouter from "./routers/index.js"
import fileUpload from "express-fileupload"
import fs from "fs"
import path from "path"

configDotenv()


const app = express()
app.use(express.json())
app.use(fileUpload({ limits: { fileSize: 100 * 1024 * 1024 }, abortOnLimit: true }))

app.use(appRouter)

app.use((error, req, res, next) => {
  const status = Number(error.status || error.statusCode) || 500;
  if (status >= 500) {
    fs.appendFileSync(path.join(process.cwd(), "src", "log", "logger.txt"),
      `[${new Date().toISOString()}] ${req.method} ${req.url} ${error.message}\n`);
  }
  return res.status(status).json({ status, message: status >= 500 ? "Internal server error" : error.message });
});
app.listen(process.env.PORT || 3000, () => console.log("Server is running...."));
