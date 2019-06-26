import { COMMAND } from ".";

const ERROR = {
  DIVISION_BY_ZERO: "Unable to perform calculation. Cannot divide by 0.",
  INVALID_COMMAND: (command: string) =>
    `Command '${command}' is invalid. Valid options include '${COMMAND.ADD}', '${COMMAND.SUBTRACT}', '${COMMAND.MULTIPLY}' and '${COMMAND.DIVIDE}'.`,
  INVALID_TEXT: (text: string) =>
    `Input '${text}' is not valid. Expected input to be of the form: 'firstNumber secondNumber'.`
};

export { ERROR };
