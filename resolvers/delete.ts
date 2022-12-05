import { AuthorSchema, UserSchema } from "../db/schemas.ts";
import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { UsersCollection } from "../db/mongo.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/mod.ts";

type DeleteUserContext = RouterContext<
  "/deleteUser",
  {
    id: string;
  } & Record<string | number, string | undefined>,
  Record<string, any>
>;


export const deleteUser = async (context: DeleteUserContext) => {
  const value = await context.request.body({type:"json"}).value
  if (!value._id) {
    context.response.status = 400;
    context.response.body = { message: "Faltan parametros: _id" };
    return
  }
  if(await UsersCollection.deleteOne({_id: value._id})){
  context.response.status = 200;
  context.response.body = { message: "Eliminado correctamente"};
  return
  }
  context.response.status=404
  context.response.body="usuario no encontrado"
};