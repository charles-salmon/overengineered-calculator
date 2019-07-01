import { KeyManagementServiceClient } from "@google-cloud/kms";
import { Storage } from "@google-cloud/storage";
import { inject, injectable } from "inversify";

interface DecryptSecretOptions {
  bucketName: string;
  cryptoKeyPath: string;
  filename: string;
}

@injectable()
class SecretProvider {
  private kmsClient: KeyManagementServiceClient;
  private storageClient: Storage;

  constructor(
    @inject(KeyManagementServiceClient)
    kmsClient: KeyManagementServiceClient,
    @inject(Storage) storageClient: Storage
  ) {
    this.kmsClient = kmsClient;
    this.storageClient = storageClient;
  }

  public async decryptSecretFromFile(
    options: DecryptSecretOptions
  ): Promise<string> {
    const { bucketName, filename, cryptoKeyPath } = options;

    const ciphertext = (await this.storageClient
      .bucket(bucketName)
      .file(filename)
      .download())[0].toString("base64");

    return (await this.kmsClient.decrypt({
      ciphertext,
      name: cryptoKeyPath
    }))[0].plaintext
      .toString("utf8")
      .trim();
  }
}

export { DecryptSecretOptions, SecretProvider };
