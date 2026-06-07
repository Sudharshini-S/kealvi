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
    const cleanQuestion=
    body
    .trim()
    .toLowerCase()
    .replace(/\s+/g," ");

    const {data:questions,error:checkError}=await supabase
    .from("questions")
    .select("body");

    if(checkError){
        throw checkError;
    }

    const duplicate=
    questions?.some(
        (q:any)=>
        q.body
        .trim()
        .toLowerCase()
        .replace(/\s+/g," ")
        ===
        cleanQuestion
    );

    if(duplicate){
        throw new Error(
            "This question already exists"
        );
    }

    const {data,error}=await supabase
    .from("questions")
    .insert({
        body:
        body.trim(),
        author
    })
    .select()
    .single();

    if(error){
        throw error;
    }

    return data;
}