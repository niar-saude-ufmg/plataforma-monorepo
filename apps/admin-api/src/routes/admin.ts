import { Router } from "express";
import { PROJECT_STATUS_LABELS, USER_ROLE_LABELS } from "@niar/contracts";

export const adminRouter = Router();

adminRouter.get("/meta", (_request, response) => {
  response.json({
    module: "admin",
    userRoles: USER_ROLE_LABELS,
    projectStatuses: PROJECT_STATUS_LABELS
  });
});
