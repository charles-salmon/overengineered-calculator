import { COMMAND } from "./constants/command";
import { assert } from "./utilities/assert";

type Command = "/add" | "/subtract" | "/multiply" | "/divide";

enum OperationType {
  Add,
  Subtract,
  Multiply,
  Divide
}

class Expression {
  public firstNumber: number;
  public operationType: OperationType;
  public secondNumber: number;

  constructor(command: string, text: string) {
    this.operationType = Expression.getOperationType(command);
    [this.firstNumber, this.secondNumber] = Expression.getNumbers(text);
  }

  private static getOperationType(command: string): OperationType {
    Expression.validateCommand(command);

    switch (command as Command) {
      case COMMAND.ADD: {
        return OperationType.Add;
      }
      case COMMAND.SUBTRACT: {
        return OperationType.Subtract;
      }
      case COMMAND.MULTIPLY: {
        return OperationType.Multiply;
      }
      case COMMAND.DIVIDE: {
        return OperationType.Divide;
      }
    }
  }

  private static getNumbers(text: string): number[] {
    Expression.validateText(text);

    const numbers = text.trim().split(" ");
    return numbers.map((num: string) => +num);
  }

  private static validateCommand(command: string): void {
    assert(
      command === COMMAND.ADD ||
        command === COMMAND.SUBTRACT ||
        command === COMMAND.MULTIPLY ||
        command === COMMAND.DIVIDE,
      `Command '${command}' is invalid. Valid options include '${COMMAND.ADD}', '${COMMAND.SUBTRACT}', '${COMMAND.MULTIPLY}' and '${COMMAND.DIVIDE}'.`
    );
  }

  private static validateText(text: string): void {
    const errorMessage = `Input '${text}' is not valid. Expected input to be of the form: 'num1 num2'.`;

    const numbers = text.trim().split(" ");
    assert(numbers.length === 2, errorMessage);

    const [firstNumber, secondNumber] = numbers;
    assert(!isNaN(+firstNumber) || !isNaN(+secondNumber), errorMessage);
  }
}

export { Expression, OperationType };
