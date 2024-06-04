import { Router } from "express";
import {
  GetAllTempleates,
  getTemplatebyId,
  createTemplate,
} from "../controllers/template.controller";

const templateRoute = Router();

templateRoute.get("/templates", GetAllTempleates);
templateRoute.get("/template?:id", getTemplatebyId);
templateRoute.post("/template", createTemplate);

export { templateRoute };
