import originalCrypto from "crypto";
import { Request as OriginalRequest } from "express";
import { Container } from "inversify";
import originalTimingSafeCompare from "tsscmp";
import * as TypeMoq from "typemoq";

import { SlackRequestSignatureValidator } from "../src/slack-request-signature-validator";
import { MockBuilder } from "./mock-builder";

type Request = OriginalRequest & { rawBody: Buffer };

jest.mock("crypto");
const crypto = (originalCrypto as unknown) as typeof originalCrypto & jest.Mock;

jest.mock("tsscmp");
const timingSafeCompare = (originalTimingSafeCompare as unknown) as typeof originalTimingSafeCompare &
  jest.Mock;

describe("slack-request-signature-validator.ts", () => {
  describe("SlackRequestSignatureValidator", () => {
    const requestSignature = "signature-value-here";
    const hmacMessageDigest = "digest-value-here";
    const slackSigningSecret = "";

    let container: Container;
    let mockRequest: TypeMoq.IMock<Request>;
    let mockHmac: TypeMoq.IMock<originalCrypto.Hmac>;

    beforeEach(() => {
      mockHmac = new MockBuilder<originalCrypto.Hmac>()
        .with(h => h.update(TypeMoq.It.isAny()), mock => mock.object)
        .with(h => h.digest(TypeMoq.It.isAny()), hmacMessageDigest)
        .build();
      ((crypto.createHmac as unknown) as jest.Mock).mockImplementation(
        (_, __) => mockHmac.object
      );

      timingSafeCompare.mockImplementation(() => true);

      container = new Container();

      mockRequest = new MockBuilder<Request>()
        .with(x => x.headers, {
          "x-slack-request-timestamp": Number.MAX_SAFE_INTEGER.toString(),
          "x-slack-signature": requestSignature
        })
        .build();
      container.bind("Request").toConstantValue(mockRequest.object);
    });

    describe("isSignatureValid()", () => {
      it("returns `false` if an 'x-slack-signature' header is not set", () => {
        // Arrange
        const originalHeaders = mockRequest.object.headers;
        mockRequest
          .setup(r => r.headers)
          .returns(() => ({
            ...originalHeaders,
            "x-slack-signature": undefined
          }));

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        const result = sut.isSignatureValid();

        // Assert
        expect(result).toBe(false);
      });

      it("returns `false` if an 'x-slack-request-timestamp' is not set", () => {
        // Arrange
        const originalHeaders = mockRequest.object.headers;
        mockRequest
          .setup(r => r.headers)
          .returns(() => ({
            ...originalHeaders,
            "x-slack-request-timestamp": undefined
          }));

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        const result = sut.isSignatureValid();

        // Assert
        expect(result).toBe(false);
      });

      it("returns `false` if the 'x-slack-request-timestamp' is greater than 5 minutes ago", () => {
        // Arrange
        const originalHeaders = mockRequest.object.headers;
        mockRequest
          .setup(r => r.headers)
          .returns(() => ({
            ...originalHeaders,
            "x-slack-request-timestamp": "0"
          }));

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        const result = sut.isSignatureValid();

        // Assert
        expect(result).toBe(false);
      });

      it("creates a SHA-256 HMAC, using the Slack signing secret", () => {
        // Arrange
        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        sut.isSignatureValid();

        // Assert
        expect(crypto.createHmac).toHaveBeenCalledWith(
          "sha256",
          slackSigningSecret
        );
      });

      it("updates the HMAC with a message containing the raw request body", () => {
        // Arrange
        const rawBody = Buffer.from("some-request-body-here");
        mockRequest.setup(r => r.rawBody).returns(() => rawBody);

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        sut.isSignatureValid();

        // Assert
        mockHmac.verify(
          h =>
            h.update(
              TypeMoq.It.is<string>(m => m.includes(rawBody.toString()))
            ),
          TypeMoq.Times.once()
        );
      });

      it("takes a message digest from the HMAC using the 'hex' encoding", () => {
        // Arrange
        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        sut.isSignatureValid();

        // Assert
        mockHmac.verify(h => h.digest("hex"), TypeMoq.Times.once());
      });

      it("compares the request signature against a value containing the HMAC's message digest", () => {
        // Arrange
        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        sut.isSignatureValid();

        // Assert
        expect(timingSafeCompare).toHaveBeenCalledWith(
          requestSignature,
          expect.stringContaining(hmacMessageDigest)
        );
      });

      it("returns `false` if the request signature is not equal to the value containing the HMAC's message digest", () => {
        // Arrange
        timingSafeCompare.mockImplementation(() => false);

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        const result = sut.isSignatureValid();

        // Assert
        expect(result).toBe(false);
      });

      it("returns `true` if the request signature is equal to the value containing the HMAC's message digest", () => {
        // Arrange
        timingSafeCompare.mockImplementation(() => true);

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        const result = sut.isSignatureValid();

        // Assert
        expect(result).toBe(true);
      });
    });
  });
});
