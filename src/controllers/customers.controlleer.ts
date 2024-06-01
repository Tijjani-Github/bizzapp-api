import { Request, Response } from "express";
import prisma from "../utils/prisma";

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

export { RegisterNewCustomer, CreateComplaint };
