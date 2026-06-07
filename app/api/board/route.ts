import { getBoard } from "@/lib/board";


export async function GET(){
    const data=
    await getBoard();
    return Response.json(data);
}