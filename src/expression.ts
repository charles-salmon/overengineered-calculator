import { COMMAND, ERROR } from "./constants";
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

  public toString(): string {
    return `${this.firstNumber} ${this.getOperator()} ${this.secondNumber}`;
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
      ERROR.INVALID_COMMAND(command)
    );
  }

  private static validateText(text: string): void {
    const errorMessage = ERROR.INVALID_TEXT(text);

    const numbers = text.trim().split(" ");
    assert(numbers.length === 2, errorMessage);

    const [firstNumber, secondNumber] = numbers;
    assert(!isNaN(+firstNumber), errorMessage);
    assert(!isNaN(+secondNumber), errorMessage);
  }

  private getOperator(): string {
    switch (this.operationType) {
      case OperationType.Add:
        return "+";
      case OperationType.Subtract:
        return "-";
      case OperationType.Multiply:
        return "*";
      case OperationType.Divide:
        return "/";
    }
  }
}

export { Expression, OperationType };
