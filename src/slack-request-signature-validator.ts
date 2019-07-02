import crypto from "crypto";
import { Request } from "express";
import { inject, injectable } from "inversify";
import timingSafeCompare from "tsscmp";

import { SecretProvider } from "./secret-provider";

const REQUEST_VERSION: string = "v0";

@injectable()
class SlackRequestSignatureValidator {
  private secretProvider: SecretProvider;
  private request: Request;

  constructor(
    @inject(SecretProvider) secretProvider: SecretProvider,
    @inject("Request") request: Request
  ) {
    this.secretProvider = secretProvider;
    this.request = request;
  }

  public async isSignatureValid(): Promise<boolean> {
    const [requestSignature, requestTimestamp] = this.getSlackHeaders();
    if (!requestSignature || !requestTimestamp) {
      return false;
    }

    if (!this.isRecentRequest(requestTimestamp)) {
      return false;
    }

    if (
      !timingSafeCompare(
        requestSignature,
        await this.hashRawRequestBody(requestTimestamp, this.request.rawBody)
      )
    ) {
      return false;
    }

    return true;
  }

  private getSlackHeaders(): [string | undefined, string | undefined] {
    const { headers } = this.request;
    const requestSignature = headers["x-slack-signature"] as string | undefined;
    const requestTimestamp = headers["x-slack-request-timestamp"] as
      | string
      | undefined;

    return [requestSignature, requestTimestamp];
  }

  private isRecentRequest(requestTimestamp: string): boolean {
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;

    return now - +requestTimestamp < fiveMinutes;
  }

  private async hashRawRequestBody(
    nonce: string,
    rawBody: Buffer
  ): Promise<string> {
    const slackSigningSecret = await this.secretProvider.decryptSecretFromFile({
      bucketName: process.env.STORAGE_BUCKET_NAME,
      cryptoKeyPath: process.env.CRYPTO_KEY_PATH,
      filename: process.env.SLACK_SIGNING_SECRET_PATH
    });
    const hmac = crypto
      .createHmac("sha256", slackSigningSecret)
      .update(`${REQUEST_VERSION}:${nonce}:${rawBody}`);

    return `${REQUEST_VERSION}=${hmac.digest("hex")}`;
  }
}

export { SlackRequestSignatureValidator };
