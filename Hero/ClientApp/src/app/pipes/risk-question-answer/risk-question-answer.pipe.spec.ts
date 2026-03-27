import { RiskQuestionType } from "@app/enums";
import { RiskQuestionAnswerPipe } from "./risk-question-answer.pipe";
import { RiskQuestion } from "@app/models";

describe("RiskQuestionAnswerPipe", () => {
	const pipe = new RiskQuestionAnswerPipe();

	const question = new RiskQuestion();
	question.tag = "RQ123";

	it("create an instance", () => {
		expect(pipe).toBeTruthy();
	});

	describe("should return null if no answer", () => {
		it("when null", () => {
			question.type = RiskQuestionType.percentage;
			const result = pipe.transform(null, question);
			expect(result.number).toBe(null);
		});

		it("when empty string", () => {
			question.type = RiskQuestionType.percentage;
			const result = pipe.transform("", question);
			expect(result.number).toBe(null);
		});

		it("when undefined", () => {
			question.type = RiskQuestionType.percentage;
			const result = pipe.transform(undefined, question);
			expect(result.number).toBe(null);
		});
	});

	it("should return correct value for percentage", () => {
		question.type = RiskQuestionType.percentage;
		const result = pipe.transform("99.9", question);
		expect(result.number).toBe(99.9);
	});

	it("should return correct value for currency", () => {
		question.type = RiskQuestionType.currency;
		const result = pipe.transform("99.9", question);
		expect(result.number).toBe(99.9);
	});

	it("should return correct value for integer", () => {
		question.type = RiskQuestionType.integer;
		const result = pipe.transform("99", question);
		expect(result.number).toBe(99);
	});

	it("should return correct value for date", () => {
		question.type = RiskQuestionType.date;
		const result = pipe.transform("2023-01-01T00:00:00", question);
		expect(result.date).toEqual(new Date("2023-01-01T00:00:00"));
	});

	it("should return null value for invalid date", () => {
		question.type = RiskQuestionType.date;
		const result = pipe.transform("invalid date", question);
		expect(result.date).toBe(null);
	});

	it("should return correct value for text", () => {
		question.type = RiskQuestionType.freeText;
		const result = pipe.transform("Test Test", question);
		expect(result.text).toBe("Test Test");
	});

	it("should return null value for empty text", () => {
		question.type = RiskQuestionType.freeText;
		const result = pipe.transform("", question);
		expect(result.text).toBe(null);
	});
});
