import mongoose from "mongoose";

declare global {
  // typage du cache mongoose dans global
  var mongoose:
    | { conn: typeof import("mongoose") | null; promise: Promise<typeof import("mongoose")> | null }
    | undefined;
}

const MONGO_URI = process.env.MONGODB_URI as string;

if (!MONGO_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongo() {
  if (cached!.conn) return cached!.conn; 

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGO_URI, { bufferCommands: false }).then((mongoose) => mongoose);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export default connectMongo;
