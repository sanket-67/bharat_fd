import express from "express";
import mongoose from "mongoose";
import { router as faqRoutes } from "./Routes/faqRoutes.js";
import dotenv from "dotenv";
const app = express();
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api/faqs", faqRoutes);




export default app;