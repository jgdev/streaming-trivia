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
        time: 15000,
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
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.resetAllMocks();
    jest.clearAllMocks();
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

  it("should change to the next question and reset the timeout", () => {
    jest.spyOn(triviaService, "nextQuestion");
    triviaService.start();
    expect(triviaService.getCurrentQuestion()).toMatchObject(questions[0]);
    expect(setTimeout).toBeCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(setTimeout).toBeCalledTimes(2);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 15000);
    expect(triviaService.getCurrentQuestion()).toMatchObject(questions[1]);
  });

  it("should end the trivia if runs the last question timeout", () => {
    triviaService = new TriviaService(questions);
    jest.spyOn(triviaService, "end");
    triviaService.start();
    triviaService.nextQuestion();
    triviaService.nextQuestion();
    jest.runAllTimers();
    expect(triviaService.end).toHaveBeenCalledTimes(1);
  });

  it("should answer wrong the current question given a comment", () => {
    triviaService.start();
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
    triviaService.start();
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

  it("should reset the trivia with new questions", () => {
    triviaService.start();
    jest.resetAllMocks();
    expect(triviaService.getIsStarted()).toBe(true);
    const newQuestions: Question[] = [
      {
        id: "new-question-1",
        options: [],
        correctOptionIndex: -1,
        title: "Test new question",
        points: 0,
      },
    ];
    triviaService.reset(newQuestions);
    expect(triviaService.getQuestions()).toMatchObject(newQuestions);
    expect(triviaService.getCurrentQuestion()).toMatchObject(newQuestions[0]);
    expect(triviaService.getIsStarted()).toBe(false);
    expect(triviaService.getResults()).toMatchObject([]);
    expect(setTimeout).toHaveBeenCalledTimes(0);
  });

  it("should end the trivia and return the winners", async () => {
    triviaService.start();
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
    jest.clearAllMocks();
    jest.resetAllMocks();
    const result = triviaService.end();
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
