import chai from 'chai';
import chaiHttp from 'chai-http';
import App from '../App.js';
import FAQ from "../models/FAQ.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { v2 as Translate } from "@google-cloud/translate";
import NodeCache from "node-cache";

chai.use(chaiHttp);
const { expect } = chai;
const translate = new Translate.Translate();
const cache = new NodeCache({ stdTTL: 3600 });

describe('FAQ API', () => {
    it('should get all FAQs', (done) => {
        chai.request(App)
            .get('/api/faqs')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should get a single FAQ by ID', (done) => {
        const id = 'some-valid-id';
        chai.request(App)
            .get(`/api/faqs/${id}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                done();
            });
    });

    it('should create a new FAQ', (done) => {
        const faq = { question: 'Test question', answer: 'Test answer' };
        chai.request(App)
            .post('/api/faqs')
            .send(faq)
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.be.an('object');
                done();
            });
    });
});

export const getFAQs = asyncHandler(async (req, res) => {
    const lang = req.query.lang || 'en';
    const faqs = await FAQ.find();
    const translatedFAQs = await Promise.all(faqs.map(async (faq) => {
        const cachedTranslation = cache.get(`${faq._id}_${lang}`);
        if (cachedTranslation) {
            return cachedTranslation;
        }
        const translated = faq.getTranslated(lang);
        cache.set(`${faq._id}_${lang}`, translated);
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
        const cachedTranslation = cache.get(`${faq._id}_${lang}`);
        if (cachedTranslation) {
            res.json(cachedTranslation);
        } else {
            const translated = faq.getTranslated(lang);
            cache.set(`${faq._id}_${lang}`, translated);
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
        cache.set(`${faq._id}_${lang}`, translated);
        res.json(translated);
    }
});