import { KeyManagementServiceClient } from "@google-cloud/kms";
import { Storage } from "@google-cloud/storage";
import { Request, Response } from "express";
import { Container, interfaces } from "inversify";

import { SecretProvider } from "./secret-provider";
import { SlackRequestSignatureValidator } from "./slack-request-signature-validator";

class ContainerFactory {
  public static create(
    request: Request,
    response: Response
  ): interfaces.Container {
    const container = new Container();

    container.bind("Request").toConstantValue(request);

    container.bind("Response").toConstantValue(response);

    container.bind(SlackRequestSignatureValidator).toSelf();

    container.bind(Storage).toConstantValue(new Storage());

    container
      .bind(KeyManagementServiceClient)
      .toConstantValue(new KeyManagementServiceClient());

    container.bind(SecretProvider).toSelf();

    return container;
  }
}

export { ContainerFactory };
