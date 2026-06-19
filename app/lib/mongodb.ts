import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL!;

if (!uri) throw new Error("DATABASE_URL is not set in .env");

/* Reuse the client across hot-reloads in dev */
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri);
}

export async function getDb() {
  await client.connect();
  return client.db(); // uses the db name from the connection string
}
