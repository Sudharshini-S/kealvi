import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export async function POST(req: Request){

    try{

        const { question } = await req.json();

        const result = await ai.models.generateContent({
            model:"gemini-2.5-flash",
            contents:
            `
            Rewrite this question clearly.
            Return only the improved question.

            ${question}
            `
        });

        return Response.json({
            success:true,
            question:result.text
        });

    }
    catch(error:any){

        console.log(
            "GEMINI ERROR FULL:",
            error
        );

        return Response.json(
            {
                success:false,
                error:error.message
            },
            {
                status:500
            }
        );

    }
}