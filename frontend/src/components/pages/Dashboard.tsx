import { createClient } from "@/lib/client"
import type { User } from "@supabase/supabase-js";
import { useEffect,useState } from "react";
import { useNavigate } from "react-router";

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