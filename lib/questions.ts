import { supabase } from "./supabase";

export async function getQuestions(search=""){
    let query=supabase
    .from("questions")
    .select(`
        *,
        votes(
            id
        )
    `);

    if(search){
        query=query.ilike(
            "body",
            `%${search}%`
        );
    }

    const {data,error}=await query;

    if(error){
        throw error;
    }

    const result=(data || []).map((q:any)=>({
        ...q,
        vote_count:q.votes?q.votes.length:0
    }));

    return result.sort((a:any,b:any)=>{
        if(a.pinned!==b.pinned){
            return Number(b.pinned)-Number(a.pinned);
        }
        return b.vote_count-a.vote_count;
    });
}

export async function createQuestion(
body:string,
author:string
){

const normalized=
body
.trim()
.toLowerCase()
.replace(
    /[^a-z0-9 ]/g,
    ""
);

const {data,error}=
await supabase
.from("questions")
.insert({
    body:body.trim(),
    normalized_body:normalized,
    author
})
.select()
.single();

if(error){

    if(
        error.code==="23505"
    ){
        throw new Error(
            "Question already exists"
        );
    }

    throw error;
}

return data;

}