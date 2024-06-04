import { Router } from "express";
import {
  GetAllComplaints,
  acceptAcomplain,
  getComplainbyId,
} from "../controllers/complain.controller";

const complainRoute = Router();

complainRoute.get("/complains", GetAllComplaints);
complainRoute.get("/complains/accept?:id", acceptAcomplain);
complainRoute.get("/complains?:id", getComplainbyId);

export { complainRoute };
