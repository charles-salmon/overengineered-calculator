# Overengineered Calculator

This is an example application, which aims to demonstrate usage of the following technologies:

- [InversifyJS](http://inversify.io/): An Inversion of Control container for JavaScript/TypeScript applications.
- [Google Cloud Functions](https://cloud.google.com/functions/): Event-driven serverless applications.
- [Google Cloud Build GitHub Application](https://github.com/marketplace/google-cloud-build): Build, test and deploy applications in response to pushes to a GitHub repository. Uses GitHub's [Checks API](https://developer.github.com/v3/checks/) to ensure that the status of a build is available from within GitHub.
- [Slack](https://api.slack.com/): Messaging/collaboration tool, which provides the ability to write slash commands.

It utilizes these technologies in the following way:

- A commit is pushed to GitHub, within this repository.
- A Google Cloud Build is triggered, which deploys a Google Cloud Function.
- The Google Cloud Function is written using InversifyJS to manage dependencies, in an easily testible way.
- A Slack App is configured with `/add num1 num2`, `/subtract num1 num2`, `/multiply num1 num2` and `/divide num1 num2` slash commands.
- The slash commands invoke the Google Cloud Function to return the result of the calculation.
