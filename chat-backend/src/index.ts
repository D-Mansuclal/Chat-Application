import { Express } from "express";
import express from "express";
import "dotenv/config";
import cors from "cors";
import dataSource from "./configs/db.config";

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

console.log(dataSource.isInitialized);


app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on port ${process.env.SERVER_PORT || 8080}`);
});

