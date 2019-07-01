import crypto from "crypto";
import { Request } from "express";
import { inject, injectable } from "inversify";
import timingSafeCompare from "tsscmp";

import { SecretProvider } from "./secret-provider";

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
    const { headers } = this.request;
    const requestSignature = headers["x-slack-signature"] as string | undefined;
    const requestTimestamp = headers["x-slack-request-timestamp"];
    if (!requestSignature || !requestTimestamp) {
      return false;
    }

    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
    if (+requestTimestamp < fiveMinutesAgo) {
      return false;
    }

    const [version] = requestSignature.split("=");
    const { rawBody } = this.request;
    const slackSigningSecret = await this.secretProvider.decryptSecretFromFile({
      bucketName: process.env.STORAGE_BUCKET_NAME,
      cryptoKeyPath: process.env.CRYPTO_KEY_PATH,
      filename: process.env.SLACK_SIGNING_SECRET_PATH
    });
    const hmac = crypto
      .createHmac("sha256", slackSigningSecret)
      .update(`${version}:${requestTimestamp}:${rawBody}`);
    const computedSignature = `${version}=${hmac.digest("hex")}`;
    if (!timingSafeCompare(requestSignature, computedSignature)) {
      return false;
    }

    return true;
  }
}

export { SlackRequestSignatureValidator };
