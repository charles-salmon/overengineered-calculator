import dotenv from "dotenv";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { Calculator } from "./calculator";
import {
  ERROR,
  FIELD_HEADING,
  REQUIRED_ENVIRONMENT_VARIABLES,
  SECTION_HEADING
} from "./constants";
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

  public async handleRequest(): Promise<void> {
    dotenv.config();

    await this.validateRequest();
    if (this.response.statusCode !== 200) {
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

  private async validateRequest(): Promise<void> {
    this.validateRequiredEnvironmentVariablesConfigured();
    await this.validateRequestSignature();
  }

  private validateRequiredEnvironmentVariablesConfigured(): void {
    const isRequiredEnvironmentVariablesConfigured = REQUIRED_ENVIRONMENT_VARIABLES.every(
      variable => Object.keys(process.env).some(key => key === variable)
    );

    if (!isRequiredEnvironmentVariablesConfigured) {
      this.response.sendStatus(500);
      throw new Error(ERROR.REQUIRED_ENVIRONMENT_VARIABLES_NOT_SET);
    }
  }

  private async validateRequestSignature(): Promise<void> {
    let isSignatureValid: boolean;
    try {
      isSignatureValid = await this.slackRequestSignatureValidator.isSignatureValid();
    } catch (error) {
      this.response.sendStatus(500);
      throw error;
    }

    if (!isSignatureValid) {
      this.response.status(400).send(ERROR.INVALID_REQUEST_SIGNATURE);
    }
  }
}

export { CalculateRequestHandler, ResponseBody, TextObject };
