import { createQuestion, getQuestions } from "@/lib/questions";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const search =
        searchParams.get("search") || "";

        const data =
        await getQuestions(search);

        return Response.json(data);
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
            body,
            author
        }=await req.json();

        const data=
        await createQuestion(
            body,
            author
        );

        return Response.json(data);
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