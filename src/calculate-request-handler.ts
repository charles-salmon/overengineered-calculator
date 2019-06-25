import { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { Calculator } from "./calculator";
import { Expression } from "./expression";

@injectable()
class CalculateRequestHandler {
  private request: Request;
  private response: Response;

  constructor(
    @inject("Request") request: Request,
    @inject("Response") response: Response
  ) {
    this.request = request;
    this.response = response;
  }

  public handleRequest(): void {
    const { command, text } = this.request.body;

    let calculationResult: number;
    try {
      calculationResult = Calculator.calculate(new Expression(command, text));
    } catch (error) {
      this.response.status(400).send(error.message);
      return;
    }

    this.response.status(200).send(calculationResult.toString());
  }
}

export { CalculateRequestHandler };
