import { Request, Response } from "express";
import { Container, interfaces } from "inversify";

import { CalculateRequestHandler } from "./calculate-request-handler";

class ContainerFactory {
  public static create(
    request: Request,
    response: Response
  ): interfaces.Container {
    const container = new Container();

    container.bind<Request>("Request").toConstantValue(request);

    container.bind<Response>("Response").toConstantValue(response);

    container.bind<CalculateRequestHandler>(CalculateRequestHandler).toSelf();

    return container;
  }
}

export { ContainerFactory };
