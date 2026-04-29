import type { Request,Response,NextFunction } from "express";
import { createSupabaseClient } from "./client";

const client =createSupabaseClient()

export function middleware(req:Request,res:Response,next:NextFunction){
// When a user send a request from the frontend to us. They are going to send 
// us a token and we are going to check with supabase that is this user logged in or not
// Do bun add @supabase/supabase-js in the backend as well

const token=req.headers.authorization


} 