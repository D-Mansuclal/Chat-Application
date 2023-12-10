import "reflect-metadata";
import app from "./server";
import "dotenv/config";
import logger from "./configs/logger.config";
import https from "https";
import fs from "fs";

const MODULE_NAME = "Server";

const options = {
    key: fs.readFileSync(__dirname + "/https/server.key"),
    cert: fs.readFileSync(__dirname + "/https/server.crt")
}

switch (process.env.NODE_ENV) {
    case "production":
        // TODO: Details on production CA
        https.createServer(options, app).listen(process.env.PROD_SERVER_PORT, () => {
            logger.info(`Server is running on port ${process.env.PROD_SERVER_PORT || 8443}.`, { method: MODULE_NAME });
        });
        break;
    case "development":
        https.createServer(options, app).listen(process.env.DEV_SERVER_PORT, () => {
            logger.info(`Server is running on port ${process.env.DEV_SERVER_PORT || 8000}.`, { method: MODULE_NAME });
        });
        break;
    case "test":
        https.createServer(options, app).listen(process.env.TEST_SERVER_PORT, () => {
            logger.info(`Server is running on port ${process.env.TEST_SERVER_PORT || 8888}.`, { method: MODULE_NAME });
        });
        break;
    default:
        https.createServer(options, app).listen(process.env.DEV_SERVER_PORT, () => {
            logger.info(`Server is running on port ${process.env.DEV_SERVER_PORT || 8000}.`, { method: MODULE_NAME });
        });
        break;
}
