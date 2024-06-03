import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

const GetAllFeedback = async (req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany();
    return res.status(200).json({ feedbacks: feedbacks });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const makeFeedback = async (req: Request, res: Response) => {
  const { complainId, feedback, rating } = req.body;
  if (!complainId || !feedback || !rating) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const newFeedback = await prisma.feedback.create({
      data: {
        complainId: complainId,
        feedback: feedback,
        rating: rating ? Number(rating) : 4,
      },
    });
    return res.status(201).json({ feedback: newFeedback });
  } catch (error) {
    console.error("Error registering feedback:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { GetAllFeedback, makeFeedback };
