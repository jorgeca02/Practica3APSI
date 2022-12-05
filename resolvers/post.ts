import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { Context } from "https://deno.land/x/oak@v11.1.0/context.ts";

import { AuthorsCollection, BooksCollection, UsersCollection } from "../db/mongo.ts";
import { AuthorSchema, BookSchema, UserSchema } from "../db/schemas.ts";
import { Author, Book, User } from "../types.ts";
import { GridFSFindOptions } from "https://deno.land/x/mongo@v0.31.1/src/types/gridfs.ts";


type PostUserContext = RouterContext<
  "/addUser",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

type PostBooksContext = RouterContext<
  "/addBook",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

export const addUser = async (ctx:PostUserContext) => {
    const response = await ctx.request.body({type:"json"})
    console.log(response)
    const value = await response.value

    if(!value.name || !value.email || !value.password){
        ctx.response.body = {message: "faltan parametros, parametros necesarios: name,email,password"}
        ctx.response.status=400
        return
    } else if(!String(value.email).includes("@")||!(String(value.email).endsWith(".com")||String(value.email).endsWith(".es"))){
        ctx.response.body = {message: "Email incorrecto, formato correcto es ---@---.com/.es"}
        ctx.response.status=400
        return;
    }else if(await UsersCollection.findOne({email:value.email})){
        ctx.response.body = {message: "Ya existe un usuario con este dni"}
        ctx.response.status=400  
        return
    }else{
        const date = new Date();
        const newuser: User = {
            name:value.name,
            email:value.email, 
            password:value.password,
            createdAt: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
            cart:[]
        };
        await UsersCollection.insertOne(newuser as UserSchema)
        ctx.response.body = newuser;
        ctx.response.status = 201;                
        return;
    }   
}

export const addAuthor = async (ctx: Context) => {

    const value = await ctx.request.body({type:"json"}).value

    if (!value.name) {
        ctx.response.body = {message: "faltan parametros, se necesita: name"}
        ctx.response.status= 400
        return
    }else {
        const encontrado = await AuthorsCollection.findOne({ Name: value.name })
        if (encontrado) { 
            ctx.response.body = "el autor ya existe";
            ctx.response.status = 403;
        }else{
            const newAuthor:Author = {
                name: value.name,
                books:[]
            };
            const schema=(newAuthor as unknown as AuthorSchema) 
            await AuthorsCollection.insertOne(schema);
            ctx.response.status = 201;
            ctx.response.body = "Añadido";
            return;
        }   
    }   
}

export const addBook = async (ctx: Context) => {
    const value = await ctx.request.body({type:"json"}).value
    const ISBN:string = crypto.randomUUID();
    if (!value.title || !value.author || !value.pages) {
        ctx.response.status = 400;
        ctx.response.body = "faltan parametros";
    }else{
        if (await BooksCollection.findOne({ Title:value.title, Author:value.author})) { 
            ctx.response.body = "el libro ya existe";
            ctx.response.status = 403;
        }else{
            const newBook:Book = {
                title: value.title,
                pages:value.pages,
                author:value.author,
                ISBN:ISBN
            };
            const schema = (newBook as BookSchema)
            await BooksCollection.insertOne(schema)
            const author =  await AuthorsCollection.findOne({ name:value.name })
            if(author){
                await AuthorsCollection.updateOne(
                        { name:value.name },
                        { $push: { books:String(schema._id)}}
                      );
                ctx.response.body = "Libro añadido a db y a su autor";
                ctx.response.status = 201;
                return;
            }
            ctx.response.body = "libro publicado, autor no encontrado, se añadira automaticamente cuando este autor se añada a la base de datos";
            ctx.response.status = 201;
            return;
        }   
    }   
}