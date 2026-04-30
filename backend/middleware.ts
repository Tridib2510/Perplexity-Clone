import type { Request,Response,NextFunction } from "express";
import { createSupabaseClient } from "./client";
import {prisma} from "./db"
import { $ZodCheckLengthEquals } from "zod/v4/core";
const client =createSupabaseClient()

export async function middleware(req:Request,res:Response,next:NextFunction){
// When a user send a request from the frontend to us. They are going to send 
// us a token and we are going to check with supabase that is this user logged in or not
// Do bun add @supabase/supabase-js in the backend as well

const token=req.headers.authorization

const data=await client.auth.getUser(token)
const userId=data.data.user?.id
if(userId){
// Implementing the 2 way sync b/w Auth db and our database
// So everytime a user signs into our website, we need to put an entry to our db
// There are many ways to implement it 
// 1.Go to the Auth section and create a Auth Hook
// 2.So before a user is created, run a posgress function that would send our entry there
// 3.or Send a webook to our backend that puts the entry in the db
// 4.But what we are going to do is whenever a user signs in we are goign to check if the user exists in the database 
// if not we are going to put it in
try{
    
await prisma.user.create({
    data:{
        id:data.data.user?.id,
        supabaseId:data.data.user!.id,
        email:data.data.user?.email!,
        provider:data.data.user?.app_metadata.provider === "google" ? "Google":"Github",
        name:data.data.user?.user_metadata.full_name
    }
})

}
catch(e){

}

req.userId=userId
next()
}
else{
    res.status(403).json({
        message:"Incorrect inputs"
    })
}


} 