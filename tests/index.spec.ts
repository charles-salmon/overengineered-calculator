import { Request, Response } from "express";
import { interfaces } from "inversify";
import * as TypeMoq from "typemoq";

import { calculate } from "../src";
import { CalculateRequestHandler } from "../src/calculate-request-handler";
import { ContainerFactory } from "../src/container-factory";
import { MockBuilder } from "./mock-builder";

jest.mock("../src/container-factory");

describe("index.ts", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("calculate(request, response)", () => {
    let mockRequest: TypeMoq.IMock<Request>;
    let mockResponse: TypeMoq.IMock<Response>;
    let mockContainer: TypeMoq.IMock<interfaces.Container>;
    let mockCalculateRequestHandler: TypeMoq.IMock<CalculateRequestHandler>;

    beforeEach(() => {
      mockRequest = new MockBuilder<Request>().build();
      mockResponse = new MockBuilder<Response>().build();

      mockContainer = new MockBuilder<interfaces.Container>().build();
      jest
        .spyOn(ContainerFactory, "create")
        .mockImplementation(() => mockContainer.object);

      mockCalculateRequestHandler = new MockBuilder<
        CalculateRequestHandler
      >().build();
      mockContainer
        .setup(c => c.resolve(CalculateRequestHandler))
        .returns(() => mockCalculateRequestHandler.object);

      process.env = {
        SLACK_SIGNING_SECRET: "s3cr3t"
      };
    });

    it("creates a `Container`", () => {
      // Act
      calculate(mockRequest.object, mockResponse.object);

      // Assert
      expect(ContainerFactory.create).toHaveBeenCalledTimes(1);
    });

    it("resolves a `CalculationRequestHandler` from the `Container`", () => {
      // Act
      calculate(mockRequest.object, mockResponse.object);

      // Assert
      mockContainer.verify(
        c => c.resolve(CalculateRequestHandler),
        TypeMoq.Times.once()
      );
    });

    it("invokes the `handleRequest()` method on the resolved `CalculateRequestHandler`", () => {
      // Act
      calculate(mockRequest.object, mockResponse.object);

      // Assert
      mockCalculateRequestHandler.verify(
        crh => crh.handleRequest(),
        TypeMoq.Times.once()
      );
    });
  });
});
