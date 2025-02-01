import express from "express";
import { getFAQs, getFAQById, createFAQ, translateFAQ } from "../controllers/faqController.js";

const router = express.Router();

router.get("/", getFAQs);
router.get("/:id", getFAQById);
router.post("/", createFAQ);
router.post("/:id/translate/:lang", translateFAQ);

export { router };
