import { Bee, FeedManifestResult, FeedWriter, FeedReader} from "@ethersphere/bee-js";
import { Wallet } from "ethers";
import { MantarayNode, Reference } from "mantaray-js";

export class JsonStorage {
  readonly beeURL: URL;
  readonly stamp: string;
  readonly bee: Bee;
  readonly wallet: Wallet;
  readonly writer: FeedWriter;
  readonly reader: FeedReader; // for reverse lookup?
  readonly mantarayNode: MantarayNode;

  feedManifestResult?: FeedManifestResult | null;
  initPromise?: Promise<void> | null;

  readonly TOPIC = "00".repeat(32);
  readonly NULL_ENTRY = "00".repeat(32);

  constructor(beeURL: URL, stamp: string) {
    this.beeURL =beeURL;
    this.stamp = stamp;
    this.bee = new Bee(this.beeURL.toString());

    this.mantarayNode = new MantarayNode();
    this.mantarayNode.addFork(
      this.pathToBytes("/"),
      this.hexStringToReference(this.NULL_ENTRY),
      {
        "website-index-document": "empty.json",
        "website-error-document": "empty.json",
      }
    );

    const privateKey = "fff1" + this.stamp.slice(4);
    this.wallet = new Wallet(privateKey);
    this.writer = this.bee.makeFeedWriter("sequence", this.TOPIC, privateKey);
    this.reader = this.bee.makeFeedReader("sequence", this.TOPIC, this.wallet.address);
  }

  private async initAsyncResources() { 
    if (!this.initPromise) {
      this.initPromise = Promise.all([
        this.createFeedManifest(),
        this.addToStorage("empty.json", {}),
      ]).then(() => {})
      await this.initPromise;
      console.log('feed URL:', this.feedURLString())
    }
  }

  private async createFeedManifest() {
    this.feedManifestResult =  await this.bee.createFeedManifest(
      this.stamp,
      "sequence",
      this.TOPIC,
      this.wallet.address
    );
  }

  private async addToStorage( key: string, value: Object ) {
    const beeUploadResult = await this.bee.uploadData( this.stamp, JSON.stringify(value) )

    this.mantarayNode.addFork(
      this.pathToBytes(key),
      this.hexStringToReference(beeUploadResult.reference)
    )

    const savedMantaray = await this.mantarayNode.save(
      async (data: Uint8Array) => {
        const uploadResult = await this.bee.uploadData(this.stamp, data);
        return this.hexStringToReference(uploadResult.reference);
      }
    );

    await this.writer.upload(this.stamp, Buffer.from(savedMantaray).toString("hex") as any);
  }

  private hexStringToReference(reference: string): Reference {
    return new Uint8Array(Buffer.from(reference, "hex")) as Reference;
  }

  private pathToBytes(string: string): Uint8Array {
    return new TextEncoder().encode(string);
  }

  private feedURLString(): string{
    return `${this.beeURL.toString()}/bzz/${this.feedManifestResult?.reference}`
  }

  async put(key: string, value: Object) {
    await this.initAsyncResources();
    await this.addToStorage(key, value);
    console.log('put: ', `${this.feedURLString()}/${key}`)
    console.log(value)
  }

  async get(key: string) {
    await this.initAsyncResources();
    const urlString = `${this.beeURL.toString()}/bzz/${this.feedManifestResult?.reference}/${key}`
    const res = await fetch(urlString)
    const value = res.ok? await res.json() : {}
    console.log('get: ', urlString)
    console.log(value)
  }

}
