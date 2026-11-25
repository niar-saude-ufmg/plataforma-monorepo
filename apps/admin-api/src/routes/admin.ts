import { Router } from "express";
import {
  EVALUATION_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  USER_ROLE_LABELS
} from "@niar/contracts";

export const adminRouter = Router();

adminRouter.get("/meta", (_request, response) => {
  response.json({
    module: "admin",
    userRoles: USER_ROLE_LABELS,
    projectStatuses: PROJECT_STATUS_LABELS,
    evaluationStatuses: EVALUATION_STATUS_LABELS
  });
});
