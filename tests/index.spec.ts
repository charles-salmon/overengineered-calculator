import { Request, Response } from "express";
import { interfaces } from "inversify";
import * as TypeMoq from "typemoq";

import { calculate } from "../src";
import { CalculateRequestHandler } from "../src/calculate-request-handler";
import { ContainerFactory } from "../src/container-factory";
import { MockBuilder } from "./mock-builder";

let mockCalculateRequestHandler: TypeMoq.IMock<CalculateRequestHandler>;
let mockContainer: TypeMoq.IMock<interfaces.Container>;

jest.mock("../src/container-factory", () => ({
  ContainerFactory: {
    create: () => mockContainer.object
  }
}));

describe("index.ts", () => {
  beforeEach(() => {
    mockCalculateRequestHandler = new MockBuilder(
      CalculateRequestHandler
    ).build();

    mockContainer = new MockBuilder<interfaces.Container>()
      .with(
        c => c.get<CalculateRequestHandler>(CalculateRequestHandler),
        mockCalculateRequestHandler.object
      )
      .build();
  });

  describe("calculate()", () => {
    it("creates a `Container`", () => {
      // Arrange
      const spy = jest.spyOn(ContainerFactory, "create");
      const mockRequest = new MockBuilder<Request>().build();
      const mockResponse = new MockBuilder<Response>().build();

      // Act
      calculate(mockRequest.object, mockResponse.object);

      // Assert
      expect(spy).toBeCalledTimes(1);
    });

    it("resolves a `CalculationRequestHandler` from the `Container`", () => {
      // Arrange
      const mockRequest = new MockBuilder<Request>().build();
      const mockResponse = new MockBuilder<Response>().build();

      // Act
      calculate(mockRequest.object, mockResponse.object);

      // Assert
      mockContainer.verify(
        c => c.get<CalculateRequestHandler>(CalculateRequestHandler),
        TypeMoq.Times.once()
      );
    });

    it("invokes the `handleRequest()` method on the resolved `CalculateRequestHandler`", () => {
      // Arrange
      const mockRequest = new MockBuilder<Request>().build();
      const mockResponse = new MockBuilder<Response>().build();

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
