import axios from "axios"
import { createClient } from "@/lib/client"
import type { User } from "@supabase/supabase-js";
import { useEffect,useState } from "react";
import { useNavigate } from "react-router";
import { BACKEND_URL } from "@/lib/config";

const supabase=createClient();
export default  function Dashboard(){
    const navigate=useNavigate() //redirection in react router
    const [user,setUser]=useState<User|null>(null)
    // Check if user is logged in or not
   

    useEffect(()=>{
        async function getInfo(){
            const {data,error}=await supabase.auth.getUser()
            if(data.user){
                setUser(data.user)
            }
            
        }
        getInfo()

    },[])

    useEffect(()=>{
        async function getExistingConversations(){
            if(user){
                console.log(`${BACKEND_URL}`)
            const {data:{session}}=await supabase.auth.getSession()
            const jwt=session?.access_token // we get the jwt that we will send to the backend
            const response=await axios.get(`${BACKEND_URL}/conversations`,{
                headers:{
                    Authorization:jwt
                }
            })

            console.log(response.data)
        }
        }
        getExistingConversations()
        
    },[user])

    return <div>
        {!user && <button onClick={()=>{
            navigate("/auth")//redirect
        }}>Sign in</button>}
        {user && <div>
            {user?.email}
            <button onClick={()=>{
                supabase.auth.signOut()
                setUser(null)
                }}>Logout</button>
            </div>}
    </div>
}