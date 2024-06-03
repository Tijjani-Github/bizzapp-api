import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";

const getAlldepartments = async (req: Request, res: Response) => {
  const id = req.query.id as string;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    const departments = await prisma.department.findMany();
    return res.status(200).json({ departments: departments });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { getAlldepartments };
