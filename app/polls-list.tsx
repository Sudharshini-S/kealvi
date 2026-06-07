"use client";
import { useEffect,useState } from "react";
import { getVoterId } from "@/lib/voter";

type Option={
    text:string;
    votes:number;
};

type Poll={
    id:string;
    question:string;
    author:string;
    options:Option[];
    totalVotes:number;
};

export default function PollsList(){
    const [polls,setPolls]=useState<Poll[]>([]);
    const [name,setName]=useState("");
    const [question,setQuestion]=useState("");
    const [options,setOptions]=useState(["",""]);
    const [search,setSearch]=useState("");

    async function load(){
        const res=await fetch(
            "/api/polls?search="+search
        );
        const data=await res.json();

        if(Array.isArray(data)){
            setPolls(data);
        }
        else{
            setPolls([]);
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

    async function create(){
        if(!name || !question){
            alert("Enter name and poll question");
            return;
        }

        const validOptions=
        options.filter(
            x=>x.trim()!==""
        );

        if(validOptions.length<2){
            alert("Enter minimum 2 options");
            return;
        }

        const formattedName=
        name
        .trim()
        .toLowerCase()
        .replace(
            /\b\w/g,
            c=>c.toUpperCase()
        );

        const res=await fetch(
            "/api/polls",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    author:formattedName,
                    question,
                    options:validOptions
                })
            }
        );

        const data=await res.json();

        if(res.ok){
            setName("");
            setQuestion("");
            setOptions(["",""]);
            await load();
        }
        else{
            alert(data.error);
        }
    }

    async function vote(
        id:string,
        index:number
    ){
        await fetch(
            `/api/polls/${id}/vote`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    voterId:getVoterId(),
                    optionIndex:index
                })
            }
        );

        load();
    }

    return(
        <div className="max-w-4xl mx-auto space-y-6">

            <div>
                <h1 className="text-2xl font-bold">
                    Polls
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
            placeholder="Create poll question"
            className="flex-1 bg-black border border-[#30363d] rounded-lg px-4 outline-none"
        />


        <button
            onClick={improve}
            className="px-10 py-3 bg-[#111418] border border-[#30363d] rounded-lg"
        >
            Improve
        </button>


        <button
            onClick={create}
            className="px-10 py-3 bg-[#111418] border border-[#30363d] rounded-lg"
        >
            Create
        </button>

    </div>


    <div className="space-y-3">

        {options.map((option,index)=>(

            <input
                key={index}
                value={option}
                onChange={(e)=>{
                    const copy=[...options];
                    copy[index]=e.target.value;
                    setOptions(copy);
                }}
                placeholder={"Option "+(index+1)}
                className="w-full bg-black border border-[#30363d] rounded-lg p-4 outline-none"
            />

        ))}


        <button
            onClick={()=>
                setOptions([
                    ...options,
                    ""
                ])
            }
            className="text-blue-400"
        >
            + Add option
        </button>

    </div>

</div>

            <input
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                placeholder="Search polls..."
                className="w-full bg-[#111418] border border-[#252b33] rounded-lg p-3"
            />

            <div className="space-y-4">

            {polls.map((poll)=>(

            <div
                key={poll.id}
                className="bg-[#111418] border border-[#252b33] rounded-xl p-5"
            >

                <div className="flex justify-between">

                    <h2 className="font-bold">
                        {poll.question}
                    </h2>

                    <p className="text-gray-400">
                        {poll.author}
                    </p>

                </div>


                <p className="text-gray-400 mt-3">
                    {poll.totalVotes} votes
                </p>


                <div className="mt-6 space-y-7">

                {poll.options.map((op,index)=>{

                    const percent=
                    poll.totalVotes===0
                    ?
                    0
                    :
                    Math.round(
                        (op.votes/poll.totalVotes)*100
                    );

                    return(

                    <div
                        key={index}
                        onClick={()=>
                            vote(
                                poll.id,
                                index
                            )
                        }
                        className="cursor-pointer"
                    >

                        <div className="flex justify-between">

                            <p className="font-semibold">
                                {op.text}
                            </p>

                            <p>
                                {percent}%
                            </p>

                        </div>


                        <div className="h-2 bg-gray-700 rounded mt-2">

                            <div
                                className="h-2 bg-blue-600 rounded"
                                style={{
                                    width:
                                    percent+"%"
                                }}
                            />

                        </div>


                        <p className="text-gray-400 text-sm mt-1">
                            {op.votes} votes
                        </p>

                    </div>

                    );
                })}

                </div>

            </div>

            ))}

            </div>

        </div>
    );
}