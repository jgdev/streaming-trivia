import { CommentsService } from "../core/services/comments/comments";
import { TriviaService } from "../core/services/trivia/trivia";
import { createCli } from "./cli";
import { createNotificationsHandlers } from "./handlers/notifications";

export type Services = {
  comments: CommentsService;
  trivia: TriviaService;
};

export type App = {
  services: Services;
};

export const createApp = () => {
  let services: Services = {} as Services;

  const app = {
    services,
  };

  createNotificationsHandlers(app);
  createCli(app);
};
