import { Express } from "express";
import express from "express";
import "dotenv/config";
import cors from "cors";
import logger from "./configs/logger.config";
import auth from "./routes/auth.route";

const app: Express = express();
const MODULE_NAME = "Server";
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

app.use("/api/auth", auth);

app.listen(process.env.SERVER_PORT, () => {
    logger.info(`Server is running on port ${process.env.SERVER_PORT || 8080}.`, { method: MODULE_NAME });
});

