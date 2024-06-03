import { Request, Response } from "express";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";

const RegisterNewCustomer = async (req: Request, res: Response) => {
  const { fullName, email, phone, location } = req.body;

  if (!fullName || !email || !phone || !location) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return res.status(400).json({
        message: "Customer with this email already exists",
        data: existingCustomer,
      });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        fullName,
        email,
        phone,
        location,
      },
    });

    return res.status(201).json({
      message: "Customer created successfully",
      data: newCustomer,
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const CreateComplaint = async (req: Request, res: Response) => {
  const { customerId, description } = req.body;
  if (!customerId || !description) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const customerExists = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customerExists) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const newComplaint = await prisma.complain.create({
      data: {
        complain: description,
        customerId,
        status: "pending",
      },
    });
    return res.status(201).json({
      message: "Complaint created successfully",
      data: newComplaint,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const GetAllCustomers = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const customers = await prisma.customer.findMany({
      include: {
        complain: true,
      },
    });

    return res.status(200).json({
      message: "customers retrieved successfully",
      data: customers,
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
export { RegisterNewCustomer, CreateComplaint, GetAllCustomers };
