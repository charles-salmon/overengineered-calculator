import { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { Calculator } from "./calculator";
import { ERROR, FIELD_HEADING, SECTION_HEADING } from "./constants";
import { Expression } from "./expression";
import { SlackRequestSignatureValidator } from "./slack-request-signature-validator";

interface ResponseBody {
  blocks: SectionBlock[];
  response_type?: "ephemeral" | "in_channel";
}

interface SectionBlock {
  type: "section";
  text: TextObject;
  block_id?: string;
  fields?: TextObject[];
  accessory?: any;
}

interface TextObject {
  type: "plain_text" | "mrkdwn";
  text: string;
  emoji?: boolean;
  verbatim?: boolean;
}

@injectable()
class CalculateRequestHandler {
  private request: Request;
  private response: Response;
  private slackRequestSignatureValidator: SlackRequestSignatureValidator;

  constructor(
    @inject("Request") request: Request,
    @inject("Response") response: Response,
    @inject(SlackRequestSignatureValidator)
    slackRequestSignatureValidator: SlackRequestSignatureValidator
  ) {
    this.request = request;
    this.response = response;
    this.slackRequestSignatureValidator = slackRequestSignatureValidator;
  }

  public handleRequest(): void {
    if (!this.slackRequestSignatureValidator.isSignatureValid()) {
      this.response.status(400).send(ERROR.INVALID_REQUEST_SIGNATURE);
      return;
    }

    const { command, text } = this.request.body;

    const responseBody: ResponseBody = {
      blocks: [],
      response_type: "in_channel"
    };

    let expression: Expression | undefined;
    let calculation: number | undefined;
    try {
      expression = new Expression(command, text);
      calculation = Calculator.calculate(expression);
    } catch (error) {
      responseBody.blocks.push(
        ...CalculateRequestHandler.createErrorBlocks(error.message)
      );
    }

    if (!!expression && !!calculation) {
      responseBody.blocks.push(
        CalculateRequestHandler.createSuccessBlock(expression, calculation)
      );
    }

    this.response.status(200).send(responseBody);
  }

  private static createErrorBlocks(errorMessage: string): SectionBlock[] {
    return [
      {
        text: {
          text: SECTION_HEADING.ERROR,
          type: "mrkdwn"
        },
        type: "section"
      },
      {
        text: {
          text: errorMessage,
          type: "plain_text"
        },
        type: "section"
      }
    ];
  }

  private static createSuccessBlock(
    expression: Expression,
    calculation: number
  ): SectionBlock {
    return {
      fields: [
        {
          text: FIELD_HEADING.EXPRESSION,
          type: "mrkdwn"
        },
        {
          text: FIELD_HEADING.CALCULATION,
          type: "mrkdwn"
        },
        {
          text: expression.toString(),
          type: "plain_text"
        },
        {
          text: calculation.toString(),
          type: "plain_text"
        }
      ],
      text: {
        text: SECTION_HEADING.SUCCESS,
        type: "mrkdwn"
      },
      type: "section"
    };
  }
}

export { CalculateRequestHandler, ResponseBody, TextObject };
