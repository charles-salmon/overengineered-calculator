declare module "@google-cloud/kms" {
  export interface DecryptRequest {
    ciphertext: string;
    name: string;
  }

  class KeyManagementServiceClient {
    public decrypt(request: DecryptRequest): Promise<[{ plaintext: Buffer }]>;
  }
}
