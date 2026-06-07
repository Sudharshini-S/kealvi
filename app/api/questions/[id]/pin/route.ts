import { supabase } from "@/lib/supabase";

export async function POST(
req:Request,
{params}:{params:Promise<{id:string}>}
){
    try{
        const {id}=await params;

        const {data:question,error}=await supabase
        .from("questions")
        .select("pinned")
        .eq("id",id)
        .single();

        if(error){
            throw error;
        }

        if(question.pinned){

            await supabase
            .from("questions")
            .update({
                pinned:false
            })
            .eq("id",id);

            return Response.json({
                success:true,
                action:"unpinned"
            });
        }

        const {count}=await supabase
        .from("questions")
        .select("*",{
            count:"exact",
            head:true
        })
        .eq("pinned",true);

        if((count || 0)>=3){

            return Response.json(
                {
                    error:"Only 3 questions can be pinned"
                },
                {
                    status:400
                }
            );
        }

        await supabase
        .from("questions")
        .update({
            pinned:true
        })
        .eq("id",id);

        return Response.json({
            success:true,
            action:"pinned"
        });
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