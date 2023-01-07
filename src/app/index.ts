import { CommentsService } from "../core/services/comments/comments";
import { TriviaService } from "../core/services/trivia/trivia";
import CLI from "./cli";
import { createNotificationsHandlers } from "./handlers/notifications";

export type Services = {
  comments: CommentsService;
  trivia: TriviaService;
};

export type App = {
  services: Services;
};

export const createApp = () => {
  const app: App = {
    services: {
      trivia: new TriviaService(),
      comments: new CommentsService(),
    },
  };

  createNotificationsHandlers(app);
  const cli = new CLI(app, {
    input: process.stdin,
    output: process.stdout,
  });
};
