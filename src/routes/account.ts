import { Register } from "../controllers/account.controlller";
import { Router } from "express";

const accroute = Router();

accroute.post("/register", Register);

export { accroute };
