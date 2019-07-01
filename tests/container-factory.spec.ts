import { Request, Response } from "express";

import { CalculateRequestHandler } from "../src/calculate-request-handler";
import { ContainerFactory } from "../src/container-factory";
import { SecretProvider } from "../src/secret-provider";
import { SlackRequestSignatureValidator } from "../src/slack-request-signature-validator";
import { MockBuilder } from "./mock-builder";

describe("container-factory.ts", () => {
  describe("ContainerFactory", () => {
    describe("create(request, response)", () => {
      let request: Request;
      let response: Response;

      beforeEach(() => {
        request = new MockBuilder<Request>().build().object;
        response = new MockBuilder<Response>().build().object;
        process.env.SLACK_SIGNING_SECRET = undefined;
      });

      it("creates a container which can get `request` using the 'Request' service identifier", () => {
        // Act
        const container = ContainerFactory.create(request, response);

        // Assert
        expect(container.get("Request")).toBe(request);
      });

      it("creates a container which can get `response` using the 'Response' service identifier", () => {
        // Act
        const container = ContainerFactory.create(request, response);

        // Assert
        expect(container.get("Response")).toBe(response);
      });

      it("creates a container which can resolve a `SlackRequestSignatureValidator`", () => {
        // Act
        const container = ContainerFactory.create(request, response);

        // Assert
        expect(
          container.resolve(SlackRequestSignatureValidator)
        ).toBeInstanceOf(SlackRequestSignatureValidator);
      });

      it("creates a container which can resolve a `SecretProvider`", () => {
        // Act
        const container = ContainerFactory.create(request, response);

        // Assert
        expect(container.resolve(SecretProvider)).toBeInstanceOf(
          SecretProvider
        );
      });

      it("creates a container which can resolve a `CalculateRequestHandler`", () => {
        // Act
        const container = ContainerFactory.create(request, response);

        // Assert
        expect(container.resolve(CalculateRequestHandler)).toBeInstanceOf(
          CalculateRequestHandler
        );
      });
    });
  });
});
