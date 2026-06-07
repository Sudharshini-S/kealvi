import { createPoll, getPolls } from "@/lib/polls";

export async function GET(req:Request){
    try{
        const {searchParams}=new URL(req.url);
        const search=searchParams.get("search") || "";
        const polls=await getPolls(search);

        return Response.json(
            polls
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

export async function POST(req:Request){
    try{
        const {
            question,
            author,
            options
        }=await req.json();

        if(!question || !author){
            return Response.json(
                {
                    error:"Missing data"
                },
                {
                    status:400
                }
            );
        }

        if(options.length<2){
            return Response.json(
                {
                    error:"Minimum 2 options required"
                },
                {
                    status:400
                }
            );
        }

        const poll=await createPoll(
            question,
            author,
            options
        );

        return Response.json(
            poll
        );
    }
    catch(error:any){
        return Response.json(
            {
                error:error.message
            },
            {
                status:400
            }
        );
    }
}