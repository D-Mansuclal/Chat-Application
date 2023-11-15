import { Express } from "express";
import express from "express";
import cors from "cors";
import auth from "./routes/auth.route";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

app.use("/api/auth", auth);

export default app;
