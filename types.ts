import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";

export type User = {
    name:string,
    email: string,
    password: string, 
    createdAt: string, 
    cart:string[] 
}
export type Book = {
    title:string,
    author: string,
    pages: number,
    ISBN:string
}
export type Author = {
    name:string,
    books:string[]
}