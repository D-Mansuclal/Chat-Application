import "reflect-metadata";
import app from "./server";
import "dotenv/config";
import logger from "./configs/logger.config";

const MODULE_NAME = "Server";

switch (process.env.NODE_ENV) {
    case "production":
        app.listen(process.env.PROD_SERVER_PORT, () => {
            logger.info(`Server is running on port ${process.env.PROD_SERVER_PORT || 8080}.`, { method: MODULE_NAME });
        });
        break;
    case "development":
        app.listen(process.env.DEV_SERVER_PORT, () => {
            logger.info(`Server is running on port ${process.env.DEV_SERVER_PORT || 8000}.`, { method: MODULE_NAME });
        });
        break;
    case "test":
        app.listen(process.env.TEST_SERVER_PORT, () => {
            logger.info(`Server is running on port ${process.env.TEST_SERVER_PORT || 8888}.`, { method: MODULE_NAME });
        });
        break;
    default:
        app.listen(process.env.DEV_SERVER_PORT, () => {
            logger.info(`Server is running on port ${process.env.DEV_SERVER_PORT || 8000}.`, { method: MODULE_NAME });
        });
        break;
}
