import { Router } from "express";
import {
  GetAllTempleates,
  getTemplatebyId,
} from "../controllers/template.controller";

const templateRoute = Router();

templateRoute.get("/templates", GetAllTempleates);
templateRoute.get("/template?:id", getTemplatebyId);

export { templateRoute };
