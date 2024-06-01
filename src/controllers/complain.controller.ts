import { Request, Response } from "express";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";

const GetAllComplaints = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const complaints = await prisma.complain.findMany({
      include: {
        complaint: true,
        attendee: true,
        feedback: true,
      },
    });

    return res.status(200).json({
      message: "Complaints retrieved successfully",
      data: complaints,
    });
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

export { GetAllComplaints };
