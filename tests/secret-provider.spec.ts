import { DecryptRequest, KeyManagementServiceClient } from "@google-cloud/kms";
import { Bucket, File, Storage } from "@google-cloud/storage";
import { Container } from "inversify";
import * as TypeMoq from "typemoq";

import { SecretProvider } from "../src/secret-provider";
import { MockBuilder } from "./mock-builder";

describe("secret-provider.ts", () => {
  describe("SecretProvider", () => {
    const ciphertext = "ciphertext";

    let container: Container;
    let mockKmsClient: TypeMoq.IMock<KeyManagementServiceClient>;
    let mockStorageClient: TypeMoq.IMock<Storage>;
    let mockBucket: TypeMoq.IMock<Bucket>;
    let mockFile: TypeMoq.IMock<File>;

    beforeEach(() => {
      container = new Container();

      mockKmsClient = new MockBuilder<KeyManagementServiceClient>()
        .with(
          kc => kc.decrypt(TypeMoq.It.isAny()),
          Promise.resolve([{ plaintext: Buffer.from("plaintext") }] as [
            { plaintext: Buffer }
          ])
        )
        .build();
      container
        .bind(KeyManagementServiceClient)
        .toConstantValue(mockKmsClient.object);

      mockStorageClient = new MockBuilder<Storage>().build();
      container.bind(Storage).toConstantValue(mockStorageClient.object);

      mockBucket = new MockBuilder<Bucket>().build();
      mockStorageClient
        .setup(sc => sc.bucket(TypeMoq.It.isAny()))
        .returns(() => mockBucket.object);

      mockFile = new MockBuilder<File>()
        .with(
          f => f.download(),
          Promise.resolve([Buffer.from(ciphertext)] as [Buffer])
        )
        .build();
      mockBucket
        .setup(b => b.file(TypeMoq.It.isAny()))
        .returns(() => mockFile.object);
    });

    describe("decryptSecretFromFile(options)", () => {
      it("gets a reference to the configured bucket", async () => {
        // Arrange
        const options = {
          bucketName: "some-bucket-name",
          cryptoKeyPath: "",
          filename: ""
        };

        const sut = container.resolve(SecretProvider);

        // Act
        await sut.decryptSecretFromFile(options);

        // Assert
        mockStorageClient.verify(
          sc => sc.bucket(options.bucketName),
          TypeMoq.Times.once()
        );
      });

      it("gets a reference to the configured file", async () => {
        // Arrange
        const options = {
          bucketName: "",
          cryptoKeyPath: "",
          filename: "some-file-name"
        };

        const sut = container.resolve(SecretProvider);

        // Act
        await sut.decryptSecretFromFile(options);

        // Assert
        mockBucket.verify(b => b.file(options.filename), TypeMoq.Times.once());
      });

      it("downloads the file", async () => {
        // Arrange
        const options = {
          bucketName: "",
          cryptoKeyPath: "",
          filename: ""
        };

        const sut = container.resolve(SecretProvider);

        // Act
        await sut.decryptSecretFromFile(options);

        // Assert
        mockFile.verify(f => f.download(), TypeMoq.Times.once());
      });

      it("decrypts the file contents", async () => {
        // Arrange
        const options = {
          bucketName: "",
          cryptoKeyPath: "",
          filename: ""
        };

        const sut = container.resolve(SecretProvider);

        // Act
        await sut.decryptSecretFromFile(options);

        // Assert
        mockKmsClient.verify(
          kc =>
            kc.decrypt(
              TypeMoq.It.is<DecryptRequest>(
                dr =>
                  dr.ciphertext === Buffer.from(ciphertext).toString("base64")
              )
            ),
          TypeMoq.Times.once()
        );
      });

      it("uses the configured crypto key to decrypt the file", async () => {
        // Arrange
        const options = {
          bucketName: "",
          cryptoKeyPath: "some-crypto-key-path",
          filename: ""
        };

        const sut = container.resolve(SecretProvider);

        // Act
        await sut.decryptSecretFromFile(options);

        // Assert
        mockKmsClient.verify(
          kc =>
            kc.decrypt(
              TypeMoq.It.is<DecryptRequest>(
                dr => dr.name === options.cryptoKeyPath
              )
            ),
          TypeMoq.Times.once()
        );
      });
    });
  });
});
