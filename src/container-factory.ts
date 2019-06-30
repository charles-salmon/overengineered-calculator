import { Request, Response } from "express";
import { Container, interfaces } from "inversify";

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

    return container;
  }
}

export { ContainerFactory };
