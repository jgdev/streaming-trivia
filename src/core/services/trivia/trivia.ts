import crypto from "crypto";
import { Answer } from "core/entities/answer";
import { Question } from "core/entities/question";

export type TriviaResult = {
  userId: string;
  username: string;
  score: number;
  asnwerReplies: number;
};

export const DEFAULT_QUESTION_TIME_IN_MS = 60 * 1000 * 10;

export class TriviaService {
  private questions: Question[];
  private currentQuestion: Question;
  private results: TriviaResult[] = [];
  private interval = null;
  private isStarted = false;

  constructor() {
    this.reset();
  }

  getIsStarted() {
    return this.isStarted;
  }

  setQuestions(questions: Question[]) {
    this.questions = questions;
    this.currentQuestion = questions[0];
    this.currentQuestion.startedAt = Date.now();
  }

  getQuestions() {
    return this.questions;
  }

  getCurrentQuestion() {
    return this.currentQuestion;
  }

  addQuestion(question: Question) {
    this.questions = this.questions.concat(question);
  }

  tryAnswer(answer: Answer) {
    if (!this.isStarted) return;
    const currentQuestion = this.getCurrentQuestion();
    const result: TriviaResult = {
      username: answer.username,
      userId: answer.userId,
      asnwerReplies: 1,
      score: 0,
    };
    const userResultsIndex = this.results.findIndex(
      (result) => result.userId === answer.userId
    );

    if (
      currentQuestion.options.indexOf(answer.option) ===
      currentQuestion.correctOptionIndex
    ) {
      result.score += currentQuestion.points;
    }

    if (userResultsIndex > -1) {
      result.asnwerReplies += 1;
      result.username = result.username;
      this.results[userResultsIndex] = result;
      return;
    }
    this.results.push(result);
  }

  getResults(): TriviaResult[] {
    return this.results;
  }

  start() {
    this.isStarted = true;
    this.interval = setTimeout(
      this.nextQuestion.bind(this),
      this.getCurrentQuestion()?.time || DEFAULT_QUESTION_TIME_IN_MS
    );
  }

  end() {
    this.isStarted = false;
    clearTimeout(this.interval);
    const highestScore =
      this.results.sort((a, b) => (b.score < a.score ? -1 : 1))[0]?.score || 0;
    return this.results
      .filter((result) => result.score === highestScore)
      .map((result) => ({
        score: result.score,
        userId: result.userId,
        username: result.username,
      }));
  }

  reset(questions: Question[] = this.questions || []) {
    if (this.interval !== null) clearTimeout(this.interval);
    this.isStarted = false;
    this.interval = null;
    this.results = [];
    this.questions = questions;
    this.currentQuestion = questions[0];
  }

  nextQuestion() {
    if (this.interval !== null) clearTimeout(this.interval);
    const questionIndex = this.questions.findIndex(
      (q) => q.id === this.getCurrentQuestion().id
    );

    if (questionIndex > -1 && this.questions[questionIndex + 1]) {
      this.currentQuestion = this.questions[questionIndex + 1];
      this.currentQuestion.startedAt = Date.now();

      this.start();
    } else {
      return this.end();
    }
  }

  parseQuestionsFromContent(content: string): Question[] {
    const lines = content.split("\n");
    return lines.map((line) => {
      const id = crypto.randomUUID();
      const [title, points, timeout = "0", ...options] = line.split(",");
      const correctOptionIndex = options.findIndex((option) =>
        option.startsWith("@")
      );
      return {
        id,
        title: title.replace("@", ""),
        points: parseInt(points),
        options,
        correctOptionIndex,
        time: parseInt(timeout) || DEFAULT_QUESTION_TIME_IN_MS,
      };
    });
  }
}
