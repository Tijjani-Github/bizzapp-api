import {
  RegisterNewCustomer,
  CreateComplaint,
  GetAllCustomers,
} from "../controllers/customers.controlleer";
import { Router } from "express";

const cusoute = Router();

cusoute.post("/customers/register", RegisterNewCustomer);
cusoute.post("/customers/complaint", CreateComplaint);
cusoute.get("/customers", GetAllCustomers);
export { cusoute };
