import { supabase } from "@/lib/supabase";

export async function GET(req:Request){
    try{
        const {searchParams}=new URL(req.url);

        const author=
        searchParams.get("author");

        if(!author){
            return Response.json([]);
        }

        const {data,error}=await supabase
        .from("notifications")
        .select("*")
        .eq(
            "author",
            author
        )
        .order(
            "created_at",
            {
                ascending:false
            }
        );

        if(error){
            throw error;
        }

        return Response.json(
            data
        );
    }
    catch(error:any){

        return Response.json(
            {
                error:error.message
            },
            {
                status:500
            }
        );

    }
}