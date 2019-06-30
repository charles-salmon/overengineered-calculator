import { Request, Response } from "express";
import "reflect-metadata";

import { CalculateRequestHandler } from "./calculate-request-handler";
import { ContainerFactory } from "./container-factory";

const calculate = (request: Request, response: Response): void => {
  const container = ContainerFactory.create(request, response);
  const calculateRequestHandler = container.resolve(CalculateRequestHandler);
  calculateRequestHandler.handleRequest();
};

export { calculate };
