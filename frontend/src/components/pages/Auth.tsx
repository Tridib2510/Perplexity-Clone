import { createClient } from '@/lib/client'

const supabase=createClient()

// We need supabse_url and client key which we can find in the supabadse dashboard
// then click framework
// bunx shadcn@latest add @supabase/supabase-client-react-router -> Shadcn components created by the people at supabase

export default function Auth(){

    async function login(provider:"github"|"google"){
        //Do bun add @supabase/supabase-js 
        const {data,error} =await supabase.auth.signInWithOAuth({
            provider:provider
        })

        if(error){
            alert("Error while signing in")
        }
        else{
            alert("Signed in")
        }
    }

    return <div>
    <button onClick={()=>login("google")}>Login with google</button> 
    {/* login("google") -> We are going to use supabase client SDK to log in */}
    <button onClick={()=>login("github")}>Login with GitHub</button>
    </div>
}