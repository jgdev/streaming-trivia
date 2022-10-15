import { App } from "../";

export class BaseHandler {
  private app: App;
  private command: string;
  private args: any;

  constructor(app: App) {
    this.app = app;
  }

  protected setCommand(command: string) {
    this.command = command;
    return this;
  }

  protected setArgs(args: string) {
    this.args = args;
    return this;
  }

  protected process() {
    // this.taskExecutor.process(this.command, this.args)
  }
}
