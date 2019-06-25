import { assert } from "../../src/utilities/assert";

describe("utilities/assert.ts", () => {
  describe("assert(assertion, errorMessage)", () => {
    it("does not throw an error when a truthy `assertion` is made", () => {
      // Arrange
      const errorMessage = "Insert error message here";

      // Act
      const action = () => assert(true, errorMessage);

      // Assert
      expect(action).not.toThrow();
    });

    it("throws an error when a falsy `assertion` is made", () => {
      // Arrange
      const errorMessage = "Insert error message here";

      // Act
      const action = () => assert(false, errorMessage);

      // Assert
      expect(action).toThrowError(errorMessage);
    });
  });
});
