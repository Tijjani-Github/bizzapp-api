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
import jwt from "jsonwebtoken";

const {
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  JWT_EXPIRES_IN,
} = process.env;

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
  if (!fullName || !email || !department) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const [existingUserByEmail] = await Promise.all([
      prisma.account.findUnique({ where: { email } }),
    ]);
    if (existingUserByEmail) {
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
        username: username ? username : email,
        phone: phone ? phone : "",
        location: location ? location : "",
        password: hashedPassword,
        image: image ? image : "",
        gender: gender ? gender : "",
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

const Login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: "Please fill all fields" });
  }
  try {
    const user = await prisma.account.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid email/username or password" });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "Account was created with Google Auth. Create a password or login with Google",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid email/username or password" });
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        accountId: user.id,
      },
    });

    const { password: _, ...rest } = user;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: rest,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const ChangePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await prisma.account.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.account.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("ChangePassword error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

const RefreshToken = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const userId = decoded.userId;

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const newAccessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      success: true,
      refreshToken: newAccessToken,
    });
  } catch (error) {
    console.error("RefreshToken error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

const GetAllAccount = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    const users = await prisma.account.findMany();
    return res.status(200).json({ success: true, accounts: users });
  } catch (error) {
    console.error("RefreshToken error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

const GetallCollaboratons = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    const colaborations = await prisma.colaborations.findMany();
    return res
      .status(200)
      .json({ success: true, colaborations: colaborations });
  } catch (error) {
    console.error("RefreshToken error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAgentById = async (req: Request, res: Response) => {
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
    const user = await prisma.account.findUnique({
      where: { id },
      include: {
        complain: true,
        message: true,
        inmessage: true,
        collaboratingCollaborations: true,
        ownedCollaborations: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, agent: user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export {
  Register,
  Login,
  ChangePassword,
  RefreshToken,
  GetAllAccount,
  getAgentById,
  GetallCollaboratons,
};
