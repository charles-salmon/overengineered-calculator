declare namespace NodeJS {
  interface ProcessEnv {
    STORAGE_BUCKET_NAME: string;
    SLACK_SIGNING_SECRET_PATH: string;
    CRYPTO_KEY_PATH: string;
  }
}
