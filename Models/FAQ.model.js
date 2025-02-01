import mongoose from "mongoose";

const FAQSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        question_hi: { type: String },
        answer_hi: { type: String },
        question_bn: { type: String },
        answer_bn: { type: String },
    },
    { timestamps: true }
);

FAQSchema.methods.getTranslated = function (lang) {
    return {
        question: this[`question_${lang}`] || this.question,
        answer: this[`answer_${lang}`] || this.answer
    };
};

export default mongoose.model("FAQ", FAQSchema);
