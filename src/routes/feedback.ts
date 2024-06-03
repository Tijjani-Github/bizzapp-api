import { Router } from "express";
import { makeFeedback, GetAllFeedback } from "../controllers/feedback.cnt";

const feed = Router();

feed.post("/feedback", makeFeedback);
feed.get("/feedback", GetAllFeedback);

export { feed };
