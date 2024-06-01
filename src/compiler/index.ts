import handlebars from "handlebars";
import { newaccount } from "../emails/register";

function compilerNewaccount(name: string, email: string, password?: string) {
  const template = handlebars.compile(newaccount);
  const htmlBody = template({
    name: name,
    email: email,
    password: password ? password : "password123",
    loginlink: process.env.FRONTEND_LOGIN_URL,
  });
  return htmlBody;
}

export { compilerNewaccount };
