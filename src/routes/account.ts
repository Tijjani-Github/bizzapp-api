import {
  Register,
  Login,
  ChangePassword,
  RefreshToken,
  GetAllAccount,
  getAgentById,
  GetallCollaboratons,
} from "../controllers/account.controlller";
import { Router } from "express";

const accroute = Router();

accroute.post("/auth/register", Register);
accroute.post("/auth/login", Login);
accroute.post("/auth/change-password", ChangePassword);
accroute.get("/auth/refresh-token", RefreshToken);
accroute.get("/accounts", GetAllAccount);
accroute.get("/account?:id", getAgentById);
accroute.get("/collaborations", GetallCollaboratons);

export { accroute };
