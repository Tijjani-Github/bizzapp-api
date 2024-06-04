import { Router } from "express";
import {
  GetAllComplaints,
  acceptAcomplain,
} from "../controllers/complain.controller";

const complainRoute = Router();

complainRoute.get("/complains", GetAllComplaints);
complainRoute.get("/complains/accept?:id", acceptAcomplain);

export { complainRoute };
