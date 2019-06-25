import * as TypeMoq from "typemoq";

import { Calculator } from "../src/calculator";
import { Expression, OperationType } from "../src/expression";
import { MockBuilder } from "./mock-builder";

let mockExpressionCtor: () => TypeMoq.IMock<Expression>;

jest.mock("../src/expression", () => ({
  ...jest.requireActual("../src/expression"),
  Expression: jest.fn().mockImplementation(() => mockExpressionCtor().object)
}));

describe("calculator.ts", () => {
  describe("Calculator", () => {
    describe("calculate(expression)", () => {
      it("adds `expression.secondNumber` to `expression.firstNumber` when `expression.operationType === OperationType.Add`", () => {
        // Arrange
        const firstNumber = 5;
        const secondNumber = 4;
        const operationType = OperationType.Add;
        const expectedResult = 9;

        mockExpressionCtor = () =>
          new MockBuilder<Expression>()
            .with(e => e.firstNumber, firstNumber)
            .with(e => e.secondNumber, secondNumber)
            .with(e => e.operationType, operationType)
            .build();

        const expression = new Expression("", "");

        // Act
        const result = Calculator.calculate(expression);

        // Assert
        expect(result).toBe(expectedResult);
      });

      it("subtracts `expression.secondNumber` from `expression.firstNumber` when `expression.operationType === OperationType.Subtract`", () => {
        // Arrange
        const firstNumber = 5;
        const secondNumber = 4;
        const operationType = OperationType.Subtract;
        const expectedResult = 1;

        mockExpressionCtor = () =>
          new MockBuilder<Expression>()
            .with(e => e.firstNumber, firstNumber)
            .with(e => e.secondNumber, secondNumber)
            .with(e => e.operationType, operationType)
            .build();

        const expression = new Expression("", "");

        // Act
        const result = Calculator.calculate(expression);

        // Assert
        expect(result).toBe(expectedResult);
      });

      it("multiplies `expression.firstNumber` and `expression.secondNumber` when `expression.operationType === OperationType.Multiply`", () => {
        // Arrange
        const firstNumber = 5;
        const secondNumber = 4;
        const operationType = OperationType.Multiply;
        const expectedResult = 20;

        mockExpressionCtor = () =>
          new MockBuilder<Expression>()
            .with(e => e.firstNumber, firstNumber)
            .with(e => e.secondNumber, secondNumber)
            .with(e => e.operationType, operationType)
            .build();

        const expression = new Expression("", "");

        // Act
        const result = Calculator.calculate(expression);

        // Assert
        expect(result).toBe(expectedResult);
      });

      it("divides `expression.firstNumber` by `expression.secondNumber` when `expression.operationType === OperationType.Divide`", () => {
        // Arrange
        const firstNumber = 20;
        const secondNumber = 5;
        const operationType = OperationType.Divide;
        const expectedResult = 4;

        mockExpressionCtor = () =>
          new MockBuilder<Expression>()
            .with(e => e.firstNumber, firstNumber)
            .with(e => e.secondNumber, secondNumber)
            .with(e => e.operationType, operationType)
            .build();

        const expression = new Expression("", "");

        // Act
        const result = Calculator.calculate(expression);

        // Assert
        expect(result).toBe(expectedResult);
      });

      it("throws an error when `secondNumber === 0` and `expression.operationType === OperationType.Divide`", () => {
        // Arrange
        const firstNumber = 20;
        const secondNumber = 0;
        const operationType = OperationType.Divide;

        mockExpressionCtor = () =>
          new MockBuilder<Expression>()
            .with(e => e.firstNumber, firstNumber)
            .with(e => e.secondNumber, secondNumber)
            .with(e => e.operationType, operationType)
            .build();

        const expression = new Expression("", "");

        // Act
        const action = () => Calculator.calculate(expression);

        // Assert
        expect(action).toThrow();
      });
    });
  });
});
