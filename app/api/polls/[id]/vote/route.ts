import { supabase } from "@/lib/supabase";

async function notify(
id:string,
message:string
){
    const {data}=await supabase
    .from("polls")
    .select("author,question")
    .eq("id",id)
    .single();

    if(data){
        await supabase
        .from("notifications")
        .insert({
            author:data.author,
            message:
            `${message}: "${data.question}"`,
            type:"poll_vote"
        });
    }
}

export async function POST(
req:Request,
{params}:{params:Promise<{id:string}>}
){
    try{
        const {
            voterId,
            optionIndex
        }=await req.json();

        const {id}=await params;

        const {data:existing}=await supabase
        .from("poll_votes")
        .select("*")
        .eq("poll_id",id)
        .eq("voter_id",voterId)
        .maybeSingle();

        if(existing){

            if(existing.option_index===optionIndex){

                await supabase
                .from("poll_votes")
                .delete()
                .eq("id",existing.id);

                await notify(
                    id,
                    "Someone removed their poll vote"
                );

                return Response.json({
                    success:true
                });
            }


            await supabase
            .from("poll_votes")
            .update({
                option_index:optionIndex
            })
            .eq("id",existing.id);


            await notify(
                id,
                "Someone changed their poll vote"
            );

            return Response.json({
                success:true
            });
        }


        await supabase
        .from("poll_votes")
        .insert({
            poll_id:id,
            voter_id:voterId,
            option_index:optionIndex
        });


        await notify(
            id,
            "Your poll received a vote"
        );


        return Response.json({
            success:true
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