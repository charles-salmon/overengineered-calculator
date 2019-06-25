import { Request, Response } from "express";
import { interfaces } from "inversify";
import * as TypeMoq from "typemoq";

import { CalculateRequestHandler } from "../src/calculate-request-handler";
import { ContainerFactory } from "../src/container-factory";
import { MockBuilder } from "./mock-builder";

let mockContainer: TypeMoq.IMock<interfaces.Container>;

jest.mock("inversify", () => ({
  Container: jest.fn().mockImplementation(() => mockContainer.object),
  inject: () => jest.fn(),
  injectable: () => jest.fn()
}));

describe("container-factory.ts", () => {
  beforeEach(() => {
    mockContainer = new MockBuilder<interfaces.Container>().build();
  });

  describe("ContainerFactory", () => {
    describe("create(request, response)", () => {
      it("registers `request` as a singleton", () => {
        // Arrange
        const mockRequest = new MockBuilder<Request>().build();
        const mockResponse = new MockBuilder<Response>().build();

        const mockBinder = new MockBuilder<
          interfaces.BindingToSyntax<Request>
        >().build();

        mockContainer
          .setup(c => c.bind<Request>("Request"))
          .returns(() => mockBinder.object);

        mockContainer
          .setup(c => c.bind<any>(TypeMoq.It.isAny()))
          .returns(
            () =>
              new MockBuilder<interfaces.BindingToSyntax<any>>().build().object
          );

        // Act
        ContainerFactory.create(mockRequest.object, mockResponse.object);

        // Assert
        mockContainer.verify(
          c => c.bind<Request>("Request"),
          TypeMoq.Times.once()
        );

        mockBinder.verify(
          b => b.toConstantValue(mockRequest.object),
          TypeMoq.Times.once()
        );
      });

      it("registers `response` as a singleton", () => {
        // Arrange
        const mockRequest = new MockBuilder<Request>().build();
        const mockResponse = new MockBuilder<Response>().build();

        const mockBinder = new MockBuilder<
          interfaces.BindingToSyntax<Response>
        >().build();

        mockContainer
          .setup(c => c.bind<Response>("Response"))
          .returns(() => mockBinder.object);

        mockContainer
          .setup(c => c.bind<any>(TypeMoq.It.isAny()))
          .returns(
            () =>
              new MockBuilder<interfaces.BindingToSyntax<any>>().build().object
          );

        // Act
        ContainerFactory.create(mockRequest.object, mockResponse.object);

        // Assert
        mockContainer.verify(
          c => c.bind<Response>("Response"),
          TypeMoq.Times.once()
        );

        mockBinder.verify(
          b => b.toConstantValue(mockResponse.object),
          TypeMoq.Times.once()
        );
      });

      it("registers `CalculateRequestHandler` as transient", () => {
        // Arrange
        const mockRequest = new MockBuilder<Request>().build();
        const mockResponse = new MockBuilder<Response>().build();

        const mockBinder = new MockBuilder<
          interfaces.BindingToSyntax<CalculateRequestHandler>
        >().build();

        mockContainer
          .setup(c => c.bind<CalculateRequestHandler>(CalculateRequestHandler))
          .returns(() => mockBinder.object);

        mockContainer
          .setup(c => c.bind<any>(TypeMoq.It.isAny()))
          .returns(
            () =>
              new MockBuilder<interfaces.BindingToSyntax<any>>().build().object
          );

        // Act
        ContainerFactory.create(mockRequest.object, mockResponse.object);

        // Assert
        mockContainer.verify(
          c => c.bind<CalculateRequestHandler>(CalculateRequestHandler),
          TypeMoq.Times.once()
        );

        mockBinder.verify(b => b.toSelf(), TypeMoq.Times.once());
      });
    });
  });
});
