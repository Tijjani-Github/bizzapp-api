import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { account } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Sendmail } from "../utils/mailer";
import { compilerNewaccount } from "../compiler";
import {
  capitalizeFirstLetter,
  generateNumericOTP,
  getFirstName,
} from "../utils";

const Register = async (req: Request, res: Response) => {
  const {
    fullName,
    email,
    username,
    phone,
    location,
    password,
    image,
    gender,
    department,
    role,
  }: account = req.body;
  if (
    !fullName ||
    !email ||
    !username ||
    !phone ||
    !location ||
    !password ||
    !gender ||
    !department
  ) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      prisma.account.findUnique({ where: { email } }),
      prisma.account.findUnique({ where: { username } }),
    ]);
    if (existingUserByEmail || existingUserByUsername) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(
      password ? password : "password123",
      10
    );

    const user = await prisma.account.create({
      data: {
        fullName,
        role: role ? role : "agent",
        email,
        username,
        phone,
        location,
        password: hashedPassword,
        image: image ? image : "",
        gender,
        department,
      },
    });
    const { password: _, ...rest } = user;
    const capitalizedFirstName = getFirstName(fullName);

    await Sendmail({
      from: `BIZZ APP <support@bbizzapp.com>`,
      to: email,
      subject: "ACCOUNT CREATION",
      html: compilerNewaccount(capitalizedFirstName, email, password),
    }).then((response) => console.log(response));

    return res.status(201).json({
      success: true,
      message: "New account created",
      user: rest,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { Register };
