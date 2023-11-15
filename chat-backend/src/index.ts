import "reflect-metadata";
import app from "./server";
import "dotenv/config";
import logger from "./configs/logger.config";

const MODULE_NAME = "Server";

app.listen(process.env.SERVER_PORT, () => {
    logger.info(`Server is running on port ${process.env.SERVER_PORT || 8080}.`, { method: MODULE_NAME });
});

