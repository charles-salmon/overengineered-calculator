import { Expression, OperationType } from "../src/expression";

describe("expression.ts", () => {
  describe("Expression", () => {
    describe("ctor", () => {
      it("sets `operationType = OperationType.Add` when `command === '/add'`", () => {
        // Arrange
        const command = "/add";
        const text = "4 5";

        // Act
        const result = new Expression(command, text);

        // Assert
        expect(result.operationType).toBe(OperationType.Add);
      });

      it("sets `operationType = OperationType.Subtract` when `command === '/subtract'`", () => {
        // Arrange
        const command = "/subtract";
        const text = "4 5";

        // Act
        const result = new Expression(command, text);

        // Assert
        expect(result.operationType).toBe(OperationType.Subtract);
      });

      it("sets `operationType = OperationType.Multiply` when `command === '/multiply'`", () => {
        // Arrange
        const command = "/multiply";
        const text = "4 5";

        // Act
        const result = new Expression(command, text);

        // Assert
        expect(result.operationType).toBe(OperationType.Multiply);
      });

      it("sets `operationType = OperationType.Divide` when `command === '/divide'`", () => {
        // Arrange
        const command = "/divide";
        const text = "4 5";

        // Act
        const result = new Expression(command, text);

        // Assert
        expect(result.operationType).toBe(OperationType.Divide);
      });

      it("throws when `command` is invalid", () => {
        // Arrange
        const command = "/invalid-command";
        const text = "4 5";

        // Act
        const action = () => new Expression(command, text);

        // Assert
        expect(action).toThrow();
      });

      it("extracts `firstNumber` and `secondNumber` from properly formatted `text`", () => {
        // Arrange
        const command = "/add";
        const firstNumber = 4;
        const secondNumber = 5;
        const text = `${firstNumber} ${secondNumber}`;

        // Act
        const result = new Expression(command, text);

        // Assert
        expect(result.firstNumber).toBe(firstNumber);
        expect(result.secondNumber).toBe(secondNumber);
      });

      it("throws if `text` contains values which are not numbers", () => {
        // Arrange
        const command = "/add";
        const text = "invalid text";

        // Act
        const action = () => new Expression(command, text);

        // Assert
        expect(action).toThrow();
      });

      it("throws if `text` contains more than two values", () => {
        // Arrange
        const command = "/add";
        const text = "6 7 8";

        // Act
        const action = () => new Expression(command, text);

        // Assert
        expect(action).toThrow();
      });

      it("throws if `text` contains less than two values", () => {
        // Arrange
        const command = "/add";
        const text = "6";

        // Act
        const action = () => new Expression(command, text);

        // Assert
        expect(action).toThrow();
      });
    });
  });
});
