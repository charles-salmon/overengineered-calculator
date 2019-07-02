import { Request, Response } from "express";
import "reflect-metadata";

import { CalculateRequestHandler } from "./calculate-request-handler";
import { ContainerFactory } from "./container-factory";

const calculate = async (
  request: Request,
  response: Response
): Promise<void> => {
  const container = ContainerFactory.create(request, response);
  const calculateRequestHandler = container.resolve(CalculateRequestHandler);
  await calculateRequestHandler.handleRequest();
};

export { calculate };
