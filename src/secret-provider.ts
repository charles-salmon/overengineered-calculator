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

    const fileBuffer = await this.downloadFile(bucketName, filename);
    const ciphertext = fileBuffer.toString("base64");
    const plaintextBuffer = await this.decrypt(ciphertext, cryptoKeyPath);
    const plaintext = plaintextBuffer.toString("utf8").trim();

    return plaintext;
  }

  private async downloadFile(
    bucketName: string,
    filename: string
  ): Promise<Buffer> {
    const fileTuple: [Buffer] = await this.storageClient
      .bucket(bucketName)
      .file(filename)
      .download();

    return fileTuple[0];
  }

  private async decrypt(
    ciphertext: string,
    cryptoKeyPath: string
  ): Promise<Buffer> {
    const decryptTuple: [{ plaintext: Buffer }] = await this.kmsClient.decrypt({
      ciphertext,
      name: cryptoKeyPath
    });

    return decryptTuple[0].plaintext;
  }
}

export { DecryptSecretOptions, SecretProvider };
