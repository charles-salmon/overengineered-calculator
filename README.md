# Overengineered Calculator

This is an example application, which aims to demonstrate usage of the following technologies:

- [InversifyJS](http://inversify.io/): An Inversion of Control container for JavaScript/TypeScript applications.
- [Cloud Functions](https://cloud.google.com/functions/): Event-driven serverless applications.
- [Cloud Build](https://cloud.google.com/cloud-build/): Build, test and deploy applications in response to configurable triggers.
- [Cloud Storage](https://cloud.google.com/storage/): Storage and access of data using a consistent API.
- [Cloud Key Management System](https://cloud.google.com/kms/): Management of cryptographic keys.
- [Slack](https://api.slack.com/): Messaging/collaboration tool, which provides the ability to write slash commands.

It utilizes these technologies in the following way:

- A commit is pushed to GitHub, within this repository.
- A Cloud Build is triggered, which deploys a Cloud Function.
- The Cloud Function is written using InversifyJS to manage dependencies, in an easily testible way.
- The Cloud Function accesses encrypted secrets stored in Cloud Storage, and decrypts secrets using the Cloud Key Management System.
- A Slack App is configured with `/add num1 num2`, `/subtract num1 num2`, `/multiply num1 num2` and `/divide num1 num2` slash commands.
- The slash commands invoke the Google Cloud Function to return the result of the calculation.

## Environment Variables

In order to execute this cloud function, the following environment variables must be set:

| Variable                    | Description                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `STORAGE_BUCKET_NAME`       | The Cloud Storage bucket used to store secrets required by the Cloud Function.                                                                  |
| `SLACK_SIGNING_SECRET_PATH` | The path to the encrypted Slack signing secret, stored in the Cloud Storage bucket associated with `STORAGE_BUCKET_NAME`.                       |
| `CRYPTO_KEY_PATH`           | The path to the KMS crypto key, which was used to encrypt the secrets stored in the Cloud Storage bucket associated with `STORAGE_BUCKET_NAME`. |

Any environment variables defined in a `.env` file stored at the root of this repository will be configured prior to executing the cloud function.
