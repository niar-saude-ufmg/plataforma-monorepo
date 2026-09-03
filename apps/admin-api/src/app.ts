import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import { AppError } from "./errors/app-error.js";
import { adminRouter } from "./routes/admin.js";
import { healthRouter } from "./routes/health.js";
import { usersRouter } from "./routes/users.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/admin/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/admin/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use("/health", healthRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/users", usersRouter);

// Handler central de erro: decide o status HTTP a partir do tipo do erro,
// nunca do texto da mensagem. Fica depois de todas as rotas de propósito
// (é assim que o Express reconhece um error handler).
app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    response.status(400).json({ errors: error.errors });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  response.status(500).json({ error: "Erro interno" });
});
