import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

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

export { GetAllTempleates, getTemplatebyId };
