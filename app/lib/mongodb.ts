import { MongoClient } from "mongodb";

const DB1_uri = process.env.DATABASE_URL!;
const DB2_uri = process.env.DATABASE_URL2!;

if (!DB1_uri) throw new Error("DATABASE_URL is not set in .env");
if (!DB2_uri) throw new Error("DATABASE_URL2 is not set in .env");

/* Reuse the clients across hot-reloads in dev */
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient1: MongoClient | undefined;
  var _mongoClient2: MongoClient | undefined;
}

let client1: MongoClient;
let client2: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient1) {
    global._mongoClient1 = new MongoClient(DB1_uri);
  }
  if (!global._mongoClient2) {
    global._mongoClient2 = new MongoClient(DB2_uri);
  }
  client1 = global._mongoClient1;
  client2 = global._mongoClient2;
} else {
  client1 = new MongoClient(DB1_uri);
  client2 = new MongoClient(DB2_uri);
}

export async function getDb1() {
  await client1.connect();
  return client1.db(); // uses the db name from the connection string
}

export async function getDb2() {
  await client2.connect();
  return client2.db(); // uses the db name from the connection string
}
