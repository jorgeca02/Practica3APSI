import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { BookSchema, UserSchema } from "../db/schemas.ts";
import { BooksCollection, UsersCollection } from "../db/mongo.ts";

type PutCartContext = RouterContext<
  "/updateCart",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

export const updateCart = async (context: PutCartContext) => {
  const value = await context.request.body({type:"json"}).value; 
  if (!value.id_user || !value.id_book) {
    context.response.status = 400;
    context.response.body = "faltan parametros, parametros necesarios: user,book";
  }
  const book: BookSchema | undefined = await BooksCollection.findOne({
    _id: new ObjectId(value.id_book),
  })
  const user: UserSchema | undefined = await UsersCollection.findOne({
    _id: new ObjectId(value.id_user),
  });
  if (book && user) {
    if(user.cart){
      if(user.cart.find((elem) => elem === value.id_book)){
        context.response.status = 400;
        context.response.body = { message: "el libro ya esta en el carrito del usuario" };
        return
      }
    }
    await UsersCollection.updateOne({ _id: user._id },{$push: { cart: value.id_book}});
    context.response.body="añadido correctamente"
    context.response.status = 200;
    return;
  }
  context.response.status = 400;
  context.response.body = { message: "usuario y/o libro no encontrado" };
}
  
