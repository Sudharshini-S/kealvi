"use client";
import { useEffect, useState } from "react";
import { getVoterId } from "@/lib/voter";

type Question={
    id:string;
    body:string;
    author:string;
    pinned:boolean;
    vote_count:number;
};

export default function QuestionsList(){
    const [questions,setQuestions]=useState<Question[]>([]);
    const [name,setName]=useState("");
    const [question,setQuestion]=useState("");
    const [search,setSearch]=useState("");

    async function load(){
    const res=await fetch(
        "/api/questions?search="+search
    );

    const data=await res.json();

    console.log(
        "QUESTIONS DATA:",
        data
    );

    if(Array.isArray(data)){
        setQuestions(data);
    }
    else{
        setQuestions([]);
        alert(data.error);
    }
}

    useEffect(()=>{
        load();
    },[search]);

    async function improve(){
        if(!question)return;
        const res=await fetch(
            "/api/improve-question",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    question
                })
            }
        );
        const data=await res.json();
        if(data.success){
            setQuestion(data.question);
        }
    }

    async function ask(){
    if(!name || !question){
        alert("Enter name and question");
        return;
    }

    const formattedName=
    name
    .trim()
    .toLowerCase()
    .replace(
        /\b\w/g,
        (char)=>char.toUpperCase()
    );

    const res=await fetch(
        "/api/questions",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                author:formattedName,
                body:question
            })
        }
    );

    const data=await res.json();

    if(res.ok){
        setQuestion("");
        await load();
    }
    else{
        alert(data.error);
    }
}

    async function vote(id:string,type:number){
        await fetch(
            `/api/questions/${id}/vote`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    voterId:getVoterId(),
                    type:type
                })
            }
        );
        await load();
    }

    async function pin(id:string){
        const res=await fetch(
            `/api/questions/${id}/pin`,
            {
                method:"POST"
            }
        );
        const data=await res.json();
        if(!res.ok){
            alert(data.error);
        }
        load();
    }

    return(
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">
                    Live Q&A
                </h1>
                <p className="text-gray-400 mt-4">
                    Interactive ✓
                </p>
            </div>

            <div className="bg-[#0d1117] border border-[#252b33] rounded-xl p-5 space-y-4">

    <input
        value={name}
        onChange={(e)=>setName(e.target.value)}
        placeholder="Your name"
        className="w-full bg-black border border-[#30363d] rounded-lg p-4 outline-none"
    />

    <div className="flex gap-3">

        <input
            value={question}
            onChange={(e)=>setQuestion(e.target.value)}
            placeholder="Ask a question"
            className="flex-1 bg-black border border-[#30363d] rounded-lg px-4 outline-none"
        />

        <button
            onClick={improve}
            className="px-10 py-3 bg-[#111418] border border-[#30363d] rounded-lg"
        >
            Improve
        </button>

        <button
            onClick={ask}
            className="px-10 py-3 bg-[#111418] border border-[#30363d] rounded-lg"
        >
            Ask
        </button>

    </div>

</div>

            <input
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                placeholder="Search"
                className="w-full bg-[#111418] border border-[#252b33] rounded-lg p-3"
            />

            <div className="space-y-4">
                {questions.map((q)=>(
                    <div
                        key={q.id}
                        className="bg-[#111418] border border-[#252b33] rounded-xl p-5"
                    >
                        <div className="flex justify-between">
                            <p className="text-yellow-400 text-sm">
                                {q.pinned?"Pinned":""}
                            </p>

                            <p className="text-gray-400 text-sm">
                                {q.author}
                            </p>
                        </div>

                        <div className="flex items-center gap-10 mt-3">

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={()=>vote(q.id,1)}
                                    className="text-xl"
                                >
                                    ▲
                                </button>

                                <span>
                                    {q.vote_count}
                                </span>

                                <button
                                    onClick={()=>vote(q.id,-1)}
                                    className="text-xl"
                                >
                                    ▼
                                </button>
                            </div>

                            <button
                                onClick={()=>pin(q.id)}
                                className="bg-[#302c10] px-5 py-2 rounded"
                            >
                                📌
                            </button>

                            <h2 className="text-lg font-medium">
                                {q.body}
                            </h2>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}