import crypto from "crypto";
import { Request } from "express";
import { inject, injectable } from "inversify";
import timingSafeCompare from "tsscmp";

import { SecretProvider } from "./secret-provider";

const REQUEST_VERSION: string = "v0";

@injectable()
class SlackRequestSignatureValidator {
  private secretProvider: SecretProvider;
  private requestSignature: string | undefined;
  private requestTimestamp: string | undefined;
  private rawRequestBody: Buffer;

  constructor(
    @inject(SecretProvider) secretProvider: SecretProvider,
    @inject("Request") request: Request
  ) {
    this.secretProvider = secretProvider;
    this.requestSignature = request.headers["x-slack-signature"] as
      | string
      | undefined;
    this.requestTimestamp = request.headers["x-slack-request-timestamp"] as
      | string
      | undefined;
    this.rawRequestBody = request.rawBody;
  }

  public async isSignatureValid(): Promise<boolean> {
    if (!this.requestSignature || !this.requestTimestamp) {
      return false;
    }

    if (!this.isRecentRequest()) {
      return false;
    }

    if (
      !timingSafeCompare(this.requestSignature, await this.hashRawRequestBody())
    ) {
      return false;
    }

    return true;
  }

  private isRecentRequest(): boolean {
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;

    return now - +(this.requestTimestamp as string) < fiveMinutes;
  }

  private async hashRawRequestBody(): Promise<string> {
    const slackSigningSecret = await this.secretProvider.decryptSecretFromFile({
      bucketName: process.env.STORAGE_BUCKET_NAME,
      cryptoKeyPath: process.env.CRYPTO_KEY_PATH,
      filename: process.env.SLACK_SIGNING_SECRET_PATH
    });
    const hmac = crypto
      .createHmac("sha256", slackSigningSecret)
      .update(
        `${REQUEST_VERSION}:${this.requestTimestamp}:${this.rawRequestBody}`
      );

    return `${REQUEST_VERSION}=${hmac.digest("hex")}`;
  }
}

export { SlackRequestSignatureValidator };
