import { BaseHandler } from "../../BaseHandler";
import { App } from "../../../";

export type Comment = {};
export type OnCommentCallback = (comment: Comment) => void;
export const SET_COMMENT_COMMAND = "process-comment";

export class CommentsHandler extends BaseHandler {
  constructor(app: App) {
    super(app);
    this.setCommand(SET_COMMENT_COMMAND);
  }
}
