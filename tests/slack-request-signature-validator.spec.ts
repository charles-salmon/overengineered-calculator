import originalCrypto from "crypto";
import { Request } from "express";
import { Container } from "inversify";
import originalTimingSafeCompare from "tsscmp";
import * as TypeMoq from "typemoq";

import { REQUIRED_ENVIRONMENT_VARIABLES } from "../src/constants";
import { DecryptSecretOptions, SecretProvider } from "../src/secret-provider";
import { SlackRequestSignatureValidator } from "../src/slack-request-signature-validator";
import { MockBuilder } from "./mock-builder";

jest.mock("crypto");
const crypto = (originalCrypto as unknown) as typeof originalCrypto & jest.Mock;

jest.mock("tsscmp");
const timingSafeCompare = (originalTimingSafeCompare as unknown) as typeof originalTimingSafeCompare &
  jest.Mock;

describe("slack-request-signature-validator.ts", () => {
  describe("SlackRequestSignatureValidator", () => {
    const requestSignature = "signature-value-here";
    const hmacMessageDigest = "digest-value-here";

    let container: Container;
    let mockRequest: TypeMoq.IMock<Request>;
    let mockHmac: TypeMoq.IMock<originalCrypto.Hmac>;
    let mockSecretProvider: TypeMoq.IMock<SecretProvider>;

    beforeEach(() => {
      mockHmac = new MockBuilder<originalCrypto.Hmac>()
        .with(h => h.update(TypeMoq.It.isAny()), mock => mock.object)
        .with(h => h.digest(TypeMoq.It.isAny()), hmacMessageDigest)
        .build();
      ((crypto.createHmac as unknown) as jest.Mock).mockImplementation(
        (_, __) => mockHmac.object
      );

      container = new Container();

      mockRequest = new MockBuilder<Request>()
        .with(x => x.headers, {
          "x-slack-request-timestamp": Number.MAX_SAFE_INTEGER.toString(),
          "x-slack-signature": requestSignature
        })
        .build();
      container.bind("Request").toConstantValue(mockRequest.object);

      mockSecretProvider = new MockBuilder<SecretProvider>().build();
      container.bind(SecretProvider).toConstantValue(mockSecretProvider.object);

      REQUIRED_ENVIRONMENT_VARIABLES.forEach(
        variable => delete process.env[variable]
      );
    });

    describe("isSignatureValid()", () => {
      it("returns `false` if an 'x-slack-signature' header is not set", async () => {
        // Arrange
        const originalHeaders = mockRequest.object.headers;
        mockRequest.reset();
        mockRequest
          .setup(r => r.headers)
          .returns(() => ({
            ...originalHeaders,
            "x-slack-signature": undefined
          }));

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        const result = await sut.isSignatureValid();

        // Assert
        expect(result).toBe(false);
      });

      it("returns `false` if an 'x-slack-request-timestamp' is not set", async () => {
        // Arrange
        const originalHeaders = mockRequest.object.headers;
        mockRequest.reset();
        mockRequest
          .setup(r => r.headers)
          .returns(() => ({
            ...originalHeaders,
            "x-slack-request-timestamp": undefined
          }));

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        const result = await sut.isSignatureValid();

        // Assert
        expect(result).toBe(false);
      });

      it("returns `false` if the 'x-slack-request-timestamp' is greater than 5 minutes ago", async () => {
        // Arrange
        const originalHeaders = mockRequest.object.headers;
        mockRequest.reset();
        mockRequest
          .setup(r => r.headers)
          .returns(() => ({
            ...originalHeaders,
            "x-slack-request-timestamp": "1" // 0 would be falsy
          }));

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        const result = await sut.isSignatureValid();

        // Assert
        expect(result).toBe(false);
      });

      it("decrypts the Slack signing secret", async () => {
        // Arrange
        const pathToSlackSigningSecret = "some-path";
        process.env.SLACK_SIGNING_SECRET_PATH = pathToSlackSigningSecret;

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        await sut.isSignatureValid();

        // Assert
        mockSecretProvider.verify(
          sp =>
            sp.decryptSecretFromFile(
              TypeMoq.It.is<DecryptSecretOptions>(
                o => o.filename === pathToSlackSigningSecret
              )
            ),
          TypeMoq.Times.once()
        );
      });

      it("creates a SHA-256 HMAC, using the Slack signing secret", async () => {
        // Arrange
        const slackSigningSecret = "s3cr3t";
        mockSecretProvider.reset();
        mockSecretProvider
          .setup(sp => sp.decryptSecretFromFile(TypeMoq.It.isAny()))
          .returns(() => Promise.resolve(slackSigningSecret));

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        await sut.isSignatureValid();

        // Assert
        expect(crypto.createHmac).toHaveBeenCalledWith(
          "sha256",
          slackSigningSecret
        );
      });

      it("updates the HMAC with a message containing the raw request body", async () => {
        // Arrange
        const rawBody = Buffer.from("some-request-body-here");
        mockRequest.setup(r => r.rawBody).returns(() => rawBody);

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        await sut.isSignatureValid();

        // Assert
        mockHmac.verify(
          h =>
            h.update(
              TypeMoq.It.is<string>(m => m.includes(rawBody.toString()))
            ),
          TypeMoq.Times.once()
        );
      });

      it("takes a message digest from the HMAC using the 'hex' encoding", async () => {
        // Arrange
        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        await sut.isSignatureValid();

        // Assert
        mockHmac.verify(h => h.digest("hex"), TypeMoq.Times.once());
      });

      it("compares the request signature against a value containing the HMAC's message digest", async () => {
        // Arrange
        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        await sut.isSignatureValid();

        // Assert
        expect(timingSafeCompare).toHaveBeenCalledWith(
          requestSignature,
          expect.stringContaining(hmacMessageDigest)
        );
      });

      it("returns `false` if the request signature is not equal to the value containing the HMAC's message digest", async () => {
        // Arrange
        timingSafeCompare.mockImplementation(() => false);

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        const result = await sut.isSignatureValid();

        // Assert
        expect(result).toBe(false);
      });

      it("returns `true` if the request signature is equal to the value containing the HMAC's message digest", async () => {
        // Arrange
        timingSafeCompare.mockImplementation(() => true);

        const sut = container.resolve(SlackRequestSignatureValidator);

        // Act
        const result = await sut.isSignatureValid();

        // Assert
        expect(result).toBe(true);
      });
    });
  });
});
