import { MongoClient, Database } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
// import { SlotSchema } from "./schemas.ts";
import "https://deno.land/x/dotenv/load.ts";
import { AuthorSchema, BookSchema, UserSchema } from "./schemas.ts";

const connectMongoDB = async (): Promise<Database> => {
  const mongo_url = Deno.env.get("URL_MONGO")
  const client = new MongoClient();
  console.log("conectando...")
  if(mongo_url) await client.connect(mongo_url);
  const db = client.database("practica3");
  return db;
};

const db = await connectMongoDB();
console.info(`MongoDB ${db.name} connected`);

export const UsersCollection = db.collection<UserSchema>("Users")
export const BooksCollection = db.collection<BookSchema>("Books")
export const AuthorsCollection = db.collection<AuthorSchema>("Authors")