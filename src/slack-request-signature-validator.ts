import crypto from "crypto";
import { Request } from "express";
import { inject, injectable } from "inversify";
import timingSafeCompare from "tsscmp";

@injectable()
class SlackRequestSignatureValidator {
  private slackSigningSecret: string;
  private request: Request;

  constructor(@inject("Request") request: Request) {
    this.slackSigningSecret = "";
    this.request = request;
  }

  public isSignatureValid(): boolean {
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
    const { rawBody } = this.request as Request & {
      rawBody: Buffer;
    };
    const hmac = crypto
      .createHmac("sha256", this.slackSigningSecret)
      .update(`${version}:${requestTimestamp}:${rawBody}`);
    const computedSignature = `${version}=${hmac.digest("hex")}`;
    if (!timingSafeCompare(requestSignature, computedSignature)) {
      return false;
    }

    return true;
  }
}

export { SlackRequestSignatureValidator };
