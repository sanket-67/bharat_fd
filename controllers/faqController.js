import FAQ from "../models/FAQ.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { v2 as Translate } from "@google-cloud/translate";
import NodeCache from "node-cache";

const translate = new Translate.Translate();
const cache = new NodeCache({ stdTTL: 3600 });

export const getFAQs = asyncHandler(async (req, res) => {
    const lang = req.query.lang || 'en';
    const faqs = await FAQ.find();
    const translatedFAQs = await Promise.all(faqs.map(async (faq) => {
        const cachedTranslation = getCachedTranslation(faq._id, lang);
        if (cachedTranslation) {
            return cachedTranslation;
        }
        const translated = faq.getTranslated(lang);
        cacheTranslation(faq._id, lang, translated);
        return translated;
    }));
    res.json(translatedFAQs);
});

export const getFAQById = asyncHandler(async (req, res) => {
    const lang = req.query.lang || 'en';
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
        res.status(404).json({ message: "FAQ not found" });
    } else {
        const cachedTranslation = getCachedTranslation(faq._id, lang);
        if (cachedTranslation) {
            res.json(cachedTranslation);
        } else {
            const translated = faq.getTranslated(lang);
            cacheTranslation(faq._id, lang, translated);
            res.json(translated);
        }
    }
});

export const createFAQ = asyncHandler(async (req, res) => {
    const { question, answer } = req.body;
    const faq = new FAQ({ question, answer });
    await faq.save();
    res.status(201).json(faq);
});

export const translateFAQ = asyncHandler(async (req, res) => {
    const { id, lang } = req.params;
    const faq = await FAQ.findById(id);
    if (!faq) {
        res.status(404).json({ message: "FAQ not found" });
    } else {
        const [translatedQuestion] = await translate.translate(faq.question, lang);
        const [translatedAnswer] = await translate.translate(faq.answer, lang);
        faq[`question_${lang}`] = translatedQuestion;
        faq[`answer_${lang}`] = translatedAnswer;
        await faq.save();
        const translated = faq.getTranslated(lang);
        cacheTranslation(faq._id, lang, translated);
        res.json(translated);
    }
});

const getCachedTranslation = (id, lang) => {
    return cache.get(`${id}_${lang}`);
};

const cacheTranslation = (id, lang, data) => {
    cache.set(`${id}_${lang}`, data);
};