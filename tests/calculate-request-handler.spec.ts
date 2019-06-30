import { Request, Response } from "express";
import { Container } from "inversify";
import * as TypeMoq from "typemoq";

import {
  CalculateRequestHandler,
  ResponseBody,
  TextObject
} from "../src/calculate-request-handler";
import { Calculator as ActualCalculator } from "../src/calculator";
import { ERROR } from "../src/constants";
import { Expression as ActualExpression } from "../src/expression";
import { SlackRequestSignatureValidator } from "../src/slack-request-signature-validator";
import { MockBuilder } from "./mock-builder";

jest.mock("../src/calculator");
const Calculator = (ActualCalculator as unknown) as typeof ActualCalculator &
  jest.Mock;

jest.mock("../src/expression");
const Expression = (ActualExpression as unknown) as typeof ActualExpression &
  jest.Mock;

describe("calculate-request-handler.ts", () => {
  describe("CalculateRequestHandler", () => {
    let container: Container;
    let mockRequest: TypeMoq.IMock<Request>;
    let mockResponse: TypeMoq.IMock<Response>;
    let mockSlackRequestSignatureValidator: TypeMoq.IMock<
      SlackRequestSignatureValidator
    >;

    beforeEach(() => {
      container = new Container();

      mockRequest = new MockBuilder<Request>().build();
      container.bind("Request").toConstantValue(mockRequest.object);

      mockResponse = new MockBuilder<Response>()
        .with(r => r.status(TypeMoq.It.isAny()), mock => mock.object)
        .build();
      container.bind("Response").toConstantValue(mockResponse.object);

      mockSlackRequestSignatureValidator = new MockBuilder<
        SlackRequestSignatureValidator
      >()
        .with(srsv => srsv.isSignatureValid(), true)
        .build();
      container
        .bind(SlackRequestSignatureValidator)
        .toConstantValue(mockSlackRequestSignatureValidator.object);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe("handleRequest()", () => {
      it("validates that the request contains a valid Slack request signature", () => {
        // Arrange
        const sut = container.resolve(CalculateRequestHandler);

        // Act
        sut.handleRequest();

        // Assert
        mockSlackRequestSignatureValidator.verify(
          srsv => srsv.isSignatureValid(),
          TypeMoq.Times.once()
        );
      });

      it("sets a status code of 400 if the request does not contain a valid Slack request signature", () => {
        // Arrange
        mockSlackRequestSignatureValidator.reset();
        mockSlackRequestSignatureValidator
          .setup(srsv => srsv.isSignatureValid())
          .returns(() => false);

        const sut = container.resolve(CalculateRequestHandler);

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(r => r.status(400), TypeMoq.Times.once());
      });

      it("sends an appropriate error message if the request does not contain a valid Slack request signature", () => {
        // Arrange
        mockSlackRequestSignatureValidator.reset();
        mockSlackRequestSignatureValidator
          .setup(srsv => srsv.isSignatureValid())
          .returns(() => false);

        const sut = container.resolve(CalculateRequestHandler);

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(
          r => r.send(ERROR.INVALID_REQUEST_SIGNATURE),
          TypeMoq.Times.once()
        );
      });

      it("uses the 'command' and 'text' provided in the request body to form an expression", () => {
        // Arrange
        const command = "/add";
        const text = "5 4";
        mockRequest.setup(r => r.body).returns(() => ({ command, text }));

        const sut = container.resolve(CalculateRequestHandler);

        // Act
        sut.handleRequest();

        // Assert
        expect(Expression).toHaveBeenCalledWith(command, text);
      });

      it("calculates an expression", () => {
        // Arrange
        const command = "/add";
        const text = "5 4";
        mockRequest.setup(r => r.body).returns(() => ({ command, text }));

        const sut = container.resolve(CalculateRequestHandler);

        // Act
        sut.handleRequest();

        // Assert
        expect(Calculator.calculate).toHaveBeenCalledTimes(1);
      });

      it("sends the error message as part of the response if an error occurs while forming the expression", () => {
        // Arrange
        const errorMessage = "Insert error message here.";
        Expression.mockImplementation(() => {
          throw new Error(errorMessage);
        });

        const sut = container.resolve(CalculateRequestHandler);

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(
          r =>
            r.send(
              TypeMoq.It.is<ResponseBody>(rb =>
                rb.blocks.some(b => b.text.text === errorMessage)
              )
            ),
          TypeMoq.Times.once()
        );
      });

      it("sends the error message as part of the response if an error occurs while calculating the expression", () => {
        // Arrange
        const errorMessage = "Insert error message here.";
        jest.spyOn(Calculator, "calculate").mockImplementation(_ => {
          throw new Error(errorMessage);
        });

        const sut = container.resolve(CalculateRequestHandler);

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(
          r =>
            r.send(
              TypeMoq.It.is<ResponseBody>(rb =>
                rb.blocks.some(b => b.text.text === errorMessage)
              )
            ),
          TypeMoq.Times.once()
        );
      });

      it("sets a status code of 200 if the request contains a valid Slack request signature", () => {
        // Arrange
        mockSlackRequestSignatureValidator.reset();
        mockSlackRequestSignatureValidator
          .setup(srsv => srsv.isSignatureValid())
          .returns(() => true);

        const sut = container.resolve(CalculateRequestHandler);

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(r => r.status(200), TypeMoq.Times.once());
      });

      it("includes the calculation in the response body", () => {
        // Arrange
        const calculation = 8;
        jest
          .spyOn(Calculator, "calculate")
          .mockImplementation(_ => calculation);

        const sut = container.resolve(CalculateRequestHandler);

        // Act
        sut.handleRequest();

        // Assert
        mockResponse.verify(
          r =>
            r.send(
              TypeMoq.It.is<ResponseBody>(rb =>
                rb.blocks.some(b =>
                  (b.fields as TextObject[]).some(
                    f => f.text === calculation.toString()
                  )
                )
              )
            ),
          TypeMoq.Times.once()
        );
      });
    });
  });
});
