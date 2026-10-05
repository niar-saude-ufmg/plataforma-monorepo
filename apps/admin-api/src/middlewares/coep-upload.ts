import multer from "multer";
import { AppError } from "../errors/app-error.js";

export const uploadCoepDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype !== "application/pdf" || !file.originalname.toLowerCase().endsWith(".pdf")) {
      callback(new AppError("O documento do COEP deve ser um arquivo PDF", 400));
      return;
    }

    callback(null, true);
  }
}).single("coep_document");
