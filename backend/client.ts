import {createClient} from "@supabase/supabase-js"

export function createSupabaseClient(){
    return createClient(
        process.env.BUN_PUBLIC_SUPABASE_URL!,
        process.env.BUN_SUPABASE_API_SECRET!
        // The Backend should have more privilage access to the database and Supabase auth compared to the frontend
        // The key that we pass need to be some sort of secret key found in the API Key section in supabase
        // The secret key gives much more access compared to the publishable key
    )
}