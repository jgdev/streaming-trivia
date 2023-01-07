import blessed from "blessed";
import {
  DEFAULT_QUESTION_TIME_IN_MS,
  TriviaService,
} from "../../core/services/trivia/trivia";
import fs from "fs";
import dayjs from "dayjs";
import path from "path";
import { createInterface, Readline, Interface } from "readline/promises";
import { ReadStream, WriteStream } from "tty";
import { App } from "../";

export type CLIDependencies = {
  input: ReadStream;
  output: WriteStream;
};

const pad = (n: number) => (n < 10 ? "0" + n : n);

export const CLI_WELCOME_MESSAGE = `Streaming Trivia\n\n`;
export const HELP_MESSAGE = `
Usage: [command] [...args]

Available commands:

exit          - Exit current process
clear         - Clear the console
start         - Start the trivia
end           - End the trivia
reset         - Reset the trivia
set-questions - Load questions file 
connect       - Connect to facebook or twitch live streaming API.
help          - Display this message
`

export class CLI {
  private triviaService: TriviaService;
  private screen: blessed.Widgets.Screen;
  private command: string = "";
  private termElements: {
    status: blessed.Widgets.BoxElement;
    title: blessed.Widgets.BoxElement;
    inputIndicator: blessed.Widgets.BoxElement;
    input: blessed.Widgets.TextboxElement;
  };

  constructor(app: App, deps: CLIDependencies) {
    this.termElements = {} as any;
    this.screen = blessed.screen({
      smartCSR: true,
    });
    this.screen.title = "Stream Trivia Console";
    try {
      this.createTermLayout();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
    this.updateConsole();
  }

  createTermLayout() {
    // Title

    this.termElements.title = blessed.box({
      top: 0,
      left: "0",
      width: "100%",
      height: "10%",
      content: "{bold}Streaming Trivia 1.0.0{/bold}",
      tags: true,
      style: {
        fg: "white",
      },
    });
    this.screen.append(this.termElements.title);

    // status

    this.termElements.status = blessed.box({
      top: 1,
      left: 0,
      width: "100%",
      height: 1,
      tags: true,
      style: {
        fg: "gray",
      },
      content: "Write {bold}?{/bold} or help to see usage",
    });
    this.termElements.inputIndicator = blessed.box({
      top: 2,
      left: 0,
      width: 10,
      height: 1,
      content: ">",
      style: {
        fg: "white",
      },
    })
    this.screen.append(
      this.termElements.inputIndicator
    );
    this.screen.append(this.termElements.status);

    // input

    this.termElements.input = blessed.textbox({
      top: 2,
      left: 2,
      width: 90,
      height: 1,
      tags: true,
      style: {
        fg: "white",
      },
      vi: false,
      input: true,
      inputOnFocus: true,
    });
    this.termElements.input.setText("Hello world 1");
    this.screen.append(this.termElements.input);
    this.termElements.input.on("submit", () => {
      const value = this.termElements.input.getLine(1);
      if (!value) return this.termElements.input.focus();
      this.termElements.input.clearValue();
      this.termElements.input.setText("");
      this.execCommand(...value.split(" "));
    });
   
    this.screen.key(['escape', 'C-c'], function(ch, key) {
      return process.exit(0);
    });    
  }

  updateConsole() {
    this.screen.render();
    this.termElements.input.focus();
  }

  private getFunctionNameByCommand(command: string) {
    const commandWords = command.split("-");
    return commandWords
      .map((str, index) =>
        index > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : str
      )
      .join("");
  }

  private printStatus(str: string = "", color = "white") {
    const { status } = this.termElements;
    const topOffset = str.split('\n').length
    this.termElements.status.style = {
      fg: color
    }
    this.termElements.status.height = topOffset
    this.termElements.input.top = topOffset + 1;
    this.termElements.inputIndicator.top = topOffset + 1;
    status.content = str || "";
    this.updateConsole()
  }

  private execCommand(...params: string[]) {
    const instance = this as any;
    const [command, ...args] = params;
    const fn = instance[this.getFunctionNameByCommand(command)] as Function;

    if (!command || !fn) {
      const isHelp = command === "?" || command === "help"
      // print usage 
      this.printStatus(isHelp && HELP_MESSAGE || `\nCommand: ${command} not found.\n${HELP_MESSAGE}`, "gray")
      return;
    }
    fn.call(this, ...args);
  }

  clear() {
    this.printStatus("");
  }

  exit() {
    process.exit(0)
  }

  connect (platform: string) {
    if (!platform || (platform !== "facebook" && platform !== "twitch")) {
      this.printStatus(`\nUsage: connect [facebook|twitch]\n`);
      return;
    }

    // this.printStatus(`Requesting ${platform} access ...`, "green")
    // this.termElements.input.hide();
    // this.termElements.input.removeAllListeners()
    // this.termElements.inputIndicator.hide()
    // this.screen.render()
    // setTimeout(() => {
    //   this.termElements.input.show();
    //   this.termElements.inputIndicator.show()
    //   this.createTermLayout()
    //   this.printStatus(`Connection request to ${platform} failed`, "red")
    // }, 1000)
  }
}

export default CLI;
