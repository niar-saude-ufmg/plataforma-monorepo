import cors from "cors";
import express from "express";
import { adminRouter } from "./routes/admin.js";
import { healthRouter } from "./routes/health.js";
import { usersRouter } from "./routes/users.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/users", usersRouter);
