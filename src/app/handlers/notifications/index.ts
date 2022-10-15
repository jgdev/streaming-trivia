import { App } from "../../";
import { FacebookCommentsHandler } from "./comments/FacebookCommentsHandler";
import { TwitchCommentsHandler } from "./comments/TwitchCommentsHandler";

export const createNotificationsHandlers = (app: App) => {
  new FacebookCommentsHandler(app);
  new TwitchCommentsHandler(app);
};
