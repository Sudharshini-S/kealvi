import { getReports } from "@/lib/reports";

export async function GET(){

    const data=
    await getReports();

    return Response.json(data);

}