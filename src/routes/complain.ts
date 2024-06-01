import { Router } from "express";
import { GetAllComplaints } from "../controllers/complain.controller";

const complainRoute = Router();

complainRoute.get("/complains", GetAllComplaints);

export { complainRoute };
