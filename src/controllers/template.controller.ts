import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";

const GetAllTempleates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.template.findMany();
    return res.status(200).json({ templates: templates });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getTemplatebyId = async (req: Request, res: Response) => {
  const id = req.query.id as string;

  if (!id) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const template = await prisma.template.findUnique({
      where: { id: Number(id) },
    });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    return res.status(200).json({ template: template });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const createTemplate = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { answer, question } = req.body;

  if (!answer || !question) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const newTemplate = await prisma.template.create({
      data: {
        answer: answer,
        question: question,
      },
    });

    return res.status(201).json({ message: "Template created successfully" });
  } catch (error) {
    console.error("Token error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { GetAllTempleates, getTemplatebyId, createTemplate };
