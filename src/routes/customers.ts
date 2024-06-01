import {
  RegisterNewCustomer,
  CreateComplaint,
} from "../controllers/customers.controlleer";
import { Router } from "express";

const cusoute = Router();

cusoute.post("/customers/register", RegisterNewCustomer);
cusoute.post("/customers/complaint", CreateComplaint);

export { cusoute };
