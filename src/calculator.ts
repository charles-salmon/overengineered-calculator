import { Expression, OperationType } from "./expression";
import { assert } from "./utilities/assert";

class Calculator {
  public static calculate(expression: Expression): number {
    const { firstNumber, operationType, secondNumber } = expression;
    switch (operationType) {
      case OperationType.Add: {
        return Calculator.add(firstNumber, secondNumber);
      }
      case OperationType.Subtract: {
        return Calculator.subtract(firstNumber, secondNumber);
      }
      case OperationType.Multiply: {
        return Calculator.multiply(firstNumber, secondNumber);
      }
      case OperationType.Divide: {
        return Calculator.divide(firstNumber, secondNumber);
      }
    }
  }

  private static add(firstNumber: number, secondNumber: number): number {
    return firstNumber + secondNumber;
  }

  private static subtract(firstNumber: number, secondNumber: number): number {
    return firstNumber - secondNumber;
  }

  private static multiply(firstNumber: number, secondNumber: number): number {
    return firstNumber * secondNumber;
  }

  private static divide(firstNumber: number, secondNumber: number): number {
    assert(
      secondNumber !== 0,
      "Unable to perform calculation. Cannot divide by 0."
    );
    return firstNumber / secondNumber;
  }
}

export { Calculator };
