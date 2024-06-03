import express from "express";
import cors from "cors";
import https from "https";
import cron from "node-cron";
import { sayHelloController } from "./controllers";
import { errorHandler } from "./middlewares";
import { accroute } from "./routes/account";
import { cusoute } from "./routes/customers";
import { complainRoute } from "./routes/complain";
import { templateRoute } from "./routes/templates";
import { feed } from "./routes/feedback";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function keepAlive(url: string) {
  https
    .get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
    })
    .on("error", (error) => {
      console.error(`Error: ${error.message}`);
    });
}

// cron job to ping the server every minute and delete expired tokens every 5 minutes
cron.schedule("*/5 * * * *", () => {
  keepAlive("");
  console.log("pinging the server every minute");
});

app.get("/", sayHelloController);

app.use("/api/account", accroute);
app.use("/api", cusoute);
app.use("/api", complainRoute);
app.use("/api", templateRoute);
app.use("/api", feed);

app.use(errorHandler);

app.use(cors());
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
