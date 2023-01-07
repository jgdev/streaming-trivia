# Streaming Trivia

Buit with Node.js this simple app will allow you include an URL widget that displays a trivia of questions and the winners.

## How to run:

- Install `pnpm` globally using npm: `$ npm install -g pnpm`
- Clone this repo and go to the project root folder.
- Install the project dependencies: `$ pnpm install`
- Build the app: `$ pnpm build`
- Run the app `$ pnpm start`
- The process will display the URL you should add as widget on your streaming, example: http://localhost:3000

## Commands:

| Command                                        | Description                                                                   | Implemented |
| ---------------------------------------------- | ----------------------------------------------------------------------------- | ----------- |
| `connect [twitch\|facebook]` (not implemented) | Authorize the chosen platform to read comments from the active live streaming | ❌          |
| `set-questions [path-to-questions-file]`       | Loads a set of questions from file                                            | ❌          |
| `start`                                        | Start the trvia with a set of questions                                       | ❌          |
| `stop`                                         | Stop the trivia and display the winners                                       | ❌          |
| `reset`                                        | Stop the trivia without displaying the winners                                | ❌          |
| `next`                                         | Set the next question as current                                              | ❌          |
| `pause`                                        | Pause the countdown timer for the current question                            | ❌          |
| `resume`                                       | Resume the countdown timer for the current question                           | ❌          |

## Environment variables

| Name | Default | Description                                      |
| ---- | ------- | ------------------------------------------------ |
| PORT | `3000`  | Http server port (used to create the widget URL) |
