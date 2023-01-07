import fs from "fs";
import { MockSTDIN, stdin } from "mock-stdin";
import { ReadStream } from "tty";
import { App } from "../../app";
import { CLI, CLIDependencies, CLI_WELCOME_MESSAGE } from "../../app/cli";
import { CommentsService } from "../../core/services/comments/comments";
import { TriviaService } from "../../core/services/trivia/trivia";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readFileSync: jest.fn(() => ""),
}));

describe("CLI", () => {
  let app: App;
  let cli: CLI;
  let deps: CLIDependencies;
  let mockStdin: MockSTDIN;

  beforeEach(() => {
    mockStdin = stdin();
    app = {
      services: {
        trivia: new TriviaService(),
        comments: new CommentsService(),
      },
    };
    deps = {
      input: mockStdin as any as ReadStream,
      output: process.stdout,
    };
    cli = new CLI(app, deps);
  });

  afterEach(() => {
    deps.input.destroy();
    mockStdin.end();
    cli && cli.close();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("[set-questions] - should read the questions file and parse the questions", () => {
    const fakeFileName = "questions.txt";
    const fakeFileContent =
      "What color is the sky?,blue,yellow,red\nWhat's the speed of light?,1235km/h,299792458m/s";
    const fakeQuestionsResult = [];

    (fs.readFileSync as any).mockReturnValue(fakeFileContent);

    jest
      .spyOn(app.services.trivia, "parseQuestionsFromContent")
      .mockImplementation(() => []);

    jest
      .spyOn(app.services.trivia, "setQuestions")
      .mockImplementationOnce(() => jest.fn());

    cli.execCommand("set-questions", fakeFileName);

    expect(fs.readFileSync).toHaveBeenLastCalledWith(fakeFileName);
    expect(
      app.services.trivia.parseQuestionsFromContent
    ).toHaveBeenNthCalledWith(1, fakeFileContent);
    expect(app.services.trivia.setQuestions).toHaveBeenNthCalledWith(
      1,
      fakeQuestionsResult
    );
  });

  it("should end the trivia", () => {
    jest.spyOn(app.services.trivia, "end").mockImplementation();
    cli.execCommand("end");
    expect(app.services.trivia.end).toHaveBeenCalledTimes(1);
  });

  it("should reset the trivia", () => {
    jest.spyOn(app.services.trivia, "reset").mockImplementation();
    cli.execCommand("reset");
    expect(app.services.trivia.reset).toHaveBeenCalledTimes(1);
  });

  it("should continue with the next question", () => {
    jest.spyOn(app.services.trivia, "nextQuestion").mockImplementation();
    cli.execCommand("nextQuestion");
    expect(app.services.trivia.nextQuestion).toHaveBeenCalledTimes(1);
  });

  it("should start the trivia", () => {
    jest.spyOn(app.services.trivia, "start").mockImplementation();
    cli.execCommand("start");
    expect(app.services.trivia.start).toHaveBeenCalledTimes(1);
  });

  it("should display the welcome message", () => {
    jest.spyOn(process.stdout, "write").mockImplementationOnce(() => null);
    cli.welcome();
    expect(process.stdout.write).toHaveBeenCalledWith(CLI_WELCOME_MESSAGE);
  });

  it("should run a command on input", () => {
    const mCli = cli as any;
    mCli.helloWorld = jest.fn();
    jest.spyOn(cli, "execCommand");
    mockStdin.send("hello-world --arg1\n");
    expect(cli.execCommand).toHaveBeenNthCalledWith(1, "hello-world", "--arg1");
    expect(mCli.helloWorld).toHaveBeenNthCalledWith(1, "--arg1");
  });
});
