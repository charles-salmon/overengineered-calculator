import { Request, Response } from "express";
import * as TypeMoq from "typemoq";

import { CalculateRequestHandler } from "../src/calculate-request-handler";
import { Calculator } from "../src/calculator";
import { Expression } from "../src/expression";
import { MockBuilder } from "./mock-builder";

let mockExpressionCtor: () => TypeMoq.IMock<Expression>;

jest.mock("../src/calculator", () => ({
  Calculator: jest.fn()
}));

jest.mock("../src/expression", () => ({
  Expression: jest.fn().mockImplementation(() => mockExpressionCtor().object)
}));

describe("calculate-request-handler.ts", () => {
  beforeEach(() => {
    Calculator.calculate = jest.fn(() => 0);

    const mockExpression = new MockBuilder<Expression>().build();
    mockExpressionCtor = () => mockExpression;
  });

  describe("CalculateRequestHandler", () => {
    describe("handleRequest()", () => {
      it("uses the 'command' and 'text' provided in the request body to calculate an expression", () => {
        // Arrange
        const command = "/add";
        const text = "4 5";

        const mockRequest = new MockBuilder<Request>()
          .with(r => r.body, { command, text })
          .build();

        const mockResponse = new MockBuilder<Response>()
          .with(r => r.status(TypeMoq.It.isAny()), mock => mock.object)
          .build();

        const sut = new CalculateRequestHandler(
          mockRequest.object,
          mockResponse.object
        );

        // Act
        sut.handleRequest();

        // Assert
        expect(Calculator.calculate).toBeCalledWith(
          new Expression(command, text)
        );
      });

      it("sets a status code of 400 if an error occurs while forming the expression", () => {
        // Arrange
        const command = "";
        const text = "";

        const mockRequest = new MockBuilder<Request>()
          .with(r => r.body, { command, text })
          .build();

        const mockResponse = new MockBuilder<Response>()
          .with(r => r.status(TypeMoq.It.isAny()), mock => mock.object)
          .build();

        mockExpressionCtor = () => {
          throw new Error();
        };

        const sut = new CalculateRequestHandler(
          mockRequest.object,
          mockResponse.object
        );

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(r => r.status(400), TypeMoq.Times.once());
      });

      it("sends the error message as part of the response if an error occurs while forming the expression", () => {
        // Arrange
        const errorMessage = "Insert error message here.";

        const command = "";
        const text = "";

        const mockRequest = new MockBuilder<Request>()
          .with(r => r.body, { command, text })
          .build();

        const mockResponse = new MockBuilder<Response>()
          .with(r => r.status(TypeMoq.It.isAny()), mock => mock.object)
          .build();

        mockExpressionCtor = () => {
          throw new Error(errorMessage);
        };

        const sut = new CalculateRequestHandler(
          mockRequest.object,
          mockResponse.object
        );

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(r => r.send(errorMessage), TypeMoq.Times.once());
      });

      it("sets a status code of 400 if an error occurs while calculating the expression", () => {
        // Arrange
        const command = "";
        const text = "";

        const mockRequest = new MockBuilder<Request>()
          .with(r => r.body, { command, text })
          .build();

        const mockResponse = new MockBuilder<Response>()
          .with(r => r.status(TypeMoq.It.isAny()), mock => mock.object)
          .build();

        Calculator.calculate = jest.fn(() => {
          throw new Error();
        });

        const sut = new CalculateRequestHandler(
          mockRequest.object,
          mockResponse.object
        );

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(r => r.status(400), TypeMoq.Times.once());
      });

      it("sends the error message as part of the response if an error occurs while calculating the expression", () => {
        // Arrange
        const errorMessage = "Insert error message here.";

        const command = "";
        const text = "";

        const mockRequest = new MockBuilder<Request>()
          .with(r => r.body, { command, text })
          .build();

        const mockResponse = new MockBuilder<Response>()
          .with(r => r.status(TypeMoq.It.isAny()), mock => mock.object)
          .build();

        Calculator.calculate = jest.fn(() => {
          throw new Error(errorMessage);
        });

        const sut = new CalculateRequestHandler(
          mockRequest.object,
          mockResponse.object
        );

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(r => r.send(errorMessage), TypeMoq.Times.once());
      });

      it("sets a status code of 200 if the expression was successfully calculated", () => {
        // Arrange
        const command = "/add";
        const text = "4 5";

        const mockRequest = new MockBuilder<Request>()
          .with(r => r.body, { command, text })
          .build();

        const mockResponse = new MockBuilder<Response>()
          .with(r => r.status(TypeMoq.It.isAny()), mock => mock.object)
          .build();

        const sut = new CalculateRequestHandler(
          mockRequest.object,
          mockResponse.object
        );

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(r => r.status(200), TypeMoq.Times.once());
      });

      it("sends the calculation result if the expression was successfully calculated", () => {
        // Arrange
        const command = "/add";
        const text = "4 5";
        const calculationResult = 9;

        const mockRequest = new MockBuilder<Request>()
          .with(r => r.body, { command, text })
          .build();

        const mockResponse = new MockBuilder<Response>()
          .with(r => r.status(TypeMoq.It.isAny()), mock => mock.object)
          .build();

        Calculator.calculate = jest.fn(() => calculationResult);

        const sut = new CalculateRequestHandler(
          mockRequest.object,
          mockResponse.object
        );

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(
          r => r.send(calculationResult.toString()),
          TypeMoq.Times.once()
        );
      });
    });
  });
});
