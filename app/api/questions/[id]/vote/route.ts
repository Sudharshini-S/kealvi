import { supabase } from "@/lib/supabase";

async function notify(
id:string,
message:string
){
    const {data}=await supabase
    .from("questions")
    .select("author,body")
    .eq("id",id)
    .single();

    if(data){
        await supabase
        .from("notifications")
        .insert({
            author:data.author,
            message:
            `${message}: "${data.body}"`,
            type:"question_vote"
        });
    }
}

export async function POST(
req:Request,
{params}:{params:Promise<{id:string}>}
){
    try{
        const {voterId,type}=await req.json();
        const {id}=await params;

        const {data:oldVote}=await supabase
        .from("votes")
        .select("id")
        .eq("question_id",id)
        .eq("voter_id",voterId)
        .maybeSingle();

        if(type===1){

            if(oldVote){
                return Response.json({
                    success:true
                });
            }

            await supabase
            .from("votes")
            .insert({
                question_id:id,
                voter_id:voterId
            });

            await notify(
                id,
                "Your question received an upvote"
            );

            return Response.json({
                success:true
            });
        }

        if(type===-1){

            if(!oldVote){
                return Response.json({
                    success:true
                });
            }

            await supabase
            .from("votes")
            .delete()
            .eq("id",oldVote.id);

            await notify(
                id,
                "Someone removed their vote"
            );

            return Response.json({
                success:true
            });
        }

        return Response.json({
            success:false
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