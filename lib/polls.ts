import { supabase } from "./supabase";

export async function getPolls(search=""){
    const {data,error}=await supabase
    .from("polls")
    .select(`
        *,
        poll_votes(
            id,
            option_index
        )
    `);

    if(error){
        throw error;
    }

    let polls=data.map((poll:any)=>{
        const votes=poll.poll_votes;
        const options=poll.options.map(
            (option:any,index:number)=>{
                const count=votes.filter(
                    (v:any)=>v.option_index===index
                ).length;

                return{
                    ...option,
                    votes:count
                };
            }
        );

        return{
            ...poll,
            options,
            totalVotes:votes.length
        };
    });

    if(search){
        polls=polls.filter(
            (p:any)=>
            p.question
            .toLowerCase()
            .includes(
                search.toLowerCase()
            )
        );
    }

    return polls.sort(
        (a:any,b:any)=>
        b.totalVotes-a.totalVotes
    );
}

export async function createPoll(
question:string,
author:string,
options:string[]
){
    const cleanQuestion=
    question
    .trim()
    .toLowerCase()
    .replace(/\s+/g," ");

    const cleanOptions=
    options
    .map(
        x=>
        x.trim()
        .toLowerCase()
    )
    .sort();

    const {data:oldPolls,error:checkError}=await supabase
    .from("polls")
    .select(
        "question,options"
    );

    if(checkError){
        throw checkError;
    }

    const duplicate=
    oldPolls?.some((poll:any)=>{

        const oldQuestion=
        poll.question
        .trim()
        .toLowerCase()
        .replace(/\s+/g," ");

        const oldOptions=
        poll.options
        .map(
            (x:any)=>
            x.text
            .trim()
            .toLowerCase()
        )
        .sort();

        return(
            oldQuestion===cleanQuestion
            &&
            JSON.stringify(oldOptions)
            ===
            JSON.stringify(cleanOptions)
        );
    });

    if(duplicate){
        throw new Error(
            "This poll already exists"
        );
    }

    const {data,error}=await supabase
    .from("polls")
    .insert({
        question:
        question.trim(),

        author,

        options:
        options.map(
            o=>({
                text:o.trim()
            })
        )
    })
    .select()
    .single();

    if(error){
        throw error;
    }

    return data;
}