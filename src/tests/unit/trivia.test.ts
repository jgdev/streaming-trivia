import { Question } from "../../core/entities/question";
import {
  TriviaService,
  DEFAULT_QUESTION_TIME_IN_MS,
} from "../../core/services/trivia/trivia";

describe("Trivia Service", () => {
  let triviaService: TriviaService;
  let questions: Question[];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");
    jest.spyOn(global, "clearTimeout");
  });

  beforeEach(() => {
    questions = [
      {
        id: "question-2",
        options: ["1235km/h", "299792458m/s"],
        points: 100,
        title: "What it's the speed of light?",
        correctOptionIndex: 1,
      },
      {
        id: "question-1",
        options: ["blue", "red", "green", "yellow"],
        points: 10,
        title: "What color is the sky?",
        correctOptionIndex: 0,
      },
      {
        id: "question-3",
        options: ["A", "B", "C", "D"],
        points: 90,
        title: "What's the first music note?",
        correctOptionIndex: 2,
      },
    ];
    triviaService = new TriviaService(questions);
    triviaService.start();
    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(
      triviaService.nextQuestion,
      DEFAULT_QUESTION_TIME_IN_MS
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.resetAllMocks();
  });

  it("should create a trivia service with a given set of questions and start the question interval", () => {
    expect(triviaService).toBeInstanceOf(TriviaService);
    expect(triviaService.getQuestions()).toMatchObject(questions);
    expect(triviaService.getCurrentQuestion()).toMatchObject(questions[0]);
  });

  it("should add a new question to the end of the questions pool", () => {
    const question: Question = {
      id: "question-4",
      options: ["1", "2", "4"],
      points: 15,
      title: "How many sister does have Jinx?",
      correctOptionIndex: 0,
    };
    triviaService.addQuestion(question);
    expect(triviaService.getQuestions()).toMatchObject([
      ...questions,
      question,
    ]);
  });

  it("should answer wrong the current question given a comment", () => {
    expect(triviaService.getResults()).toMatchObject([]);

    triviaService.tryAnswer({
      timestamp: new Date().getTime(),
      option: "red",
      userId: "test-user-id",
      username: "John Doe",
    });

    expect(triviaService.getResults()).toMatchObject([
      {
        userId: "test-user-id",
        username: "John Doe",
        score: 0,
        asnwerReplies: 1,
      },
    ]);

    triviaService.tryAnswer({
      timestamp: new Date().getTime(),
      option: "yellow",
      userId: "test-user-id",
      username: "John Doe",
    });

    expect(triviaService.getResults()).toMatchObject([
      {
        userId: "test-user-id",
        username: "John Doe",
        score: 0,
        asnwerReplies: 2,
      },
    ]);
  });

  it("should answer correctly the current question and add score to the user", () => {
    triviaService.tryAnswer({
      timestamp: new Date().getTime(),
      option: "299792458m/s",
      userId: "test-user-id",
      username: "John Doe",
    });

    expect(triviaService.getResults()).toMatchObject([
      {
        userId: "test-user-id",
        username: "John Doe",
        score: questions[0].points,
        asnwerReplies: 1,
      },
    ]);
  });

  it("should end the trivia and return the winners", async () => {
    triviaService.tryAnswer({
      timestamp: new Date().getTime(),
      userId: "test-user-id",
      username: "John Doe",
      option: "299792458m/s",
    });

    triviaService.tryAnswer({
      timestamp: new Date().getTime(),
      userId: "test-user-id-3",
      username: "Faker",
      option: "black",
    });

    triviaService.tryAnswer({
      timestamp: new Date().getTime(),
      userId: "test-user-id-2",
      username: "Foo Bar",
      option: "299792458m/s",
    });

    const result = triviaService.end();
    jest.runAllTicks();
    expect(clearTimeout).toBeCalledTimes(1);
    expect(clearTimeout).toBeCalledWith((triviaService as any).interval);
    expect(result).toMatchObject([
      {
        userId: "test-user-id",
        username: "John Doe",
        score: 100,
      },
      {
        userId: "test-user-id-2",
        username: "Foo Bar",
        score: 100,
      },
    ]);
  });
});
