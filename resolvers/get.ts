import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { BooksCollection, UsersCollection } from "../db/mongo.ts";
import { BookSchema, UserSchema } from "../db/schemas.ts";
import { helpers } from "https://deno.land/x/oak@v11.1.0/mod.ts";

type GetBookContext = RouterContext<
  "/Books",
  {
    title: string;
    page:number
  } & Record<string | number, string | undefined>,
  Record<string, any>
>;
type GetUserContext = RouterContext< 
  "/User/:id",
  {
    id: string;
  } & Record<string | number, string | undefined>,
  Record<string, any>
>;
export const getBooks = async (context: GetBookContext) => {
  const params = helpers.getQuery(context, { mergeParams: true });
  let books:BookSchema[]
  if(!params?.page){
    context.response.status = 400;
    context.response.body = {msg: "faltan parametros:pagina"}
    return
  }else{  
    if (params?.title) {                
      books = await BooksCollection.find({title: params?.title})
      .skip(Number(params?.page) * 10).limit(10).toArray();
    }else{
      books = await BooksCollection.find().skip(Number(params?.page) * 10).limit(10).toArray();  
    } 
    if(books.length===0){
      context.response.status = 404; 
      context.response.body = "no hay ningun libro con esas caracteristicas";
      return;
    }
    context.response.status = 200; 
    context.response.body = books;
    return;
  }
}

export const getUser = async (context: GetUserContext) => { 
  if(!context.params?.id){
    context.response.status = 400;
    throw new Error("faltan parametros:id"); 
  }else{
    const user: UserSchema|undefined = await UsersCollection.findOne({
    _id: new ObjectId(context.params?.id)
    })  
  if(user){
    context.response.status = 200;
    context.response.body = user
    return;
  }else{
    context.response.status = 404;
    throw new Error("usuario no encontrado");
  }
  }
}
