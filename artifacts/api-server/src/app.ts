// @ts-nocheck
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

// Root path for testing
app.get("/", (req, res) => {
  res.json({ message: "Nexus AI API is live and healthy!" });
});

// Register all routes
app.use("/api", routes);

export default app;