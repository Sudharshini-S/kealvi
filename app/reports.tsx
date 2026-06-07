"use client";
import { useEffect, useState } from "react";

type Report = {
    questions:number | null;
    polls:number | null;
    questionVotes:number | null;
    pollVotes:number | null;

};

export default function Reports(){

    const [report,setReport]
    =
    useState<Report | null>(null);

    async function load(){
        const res =
        await fetch(
            "/api/reports"
        );

        const data =
        await res.json();
        setReport(data);
    }

    useEffect(()=>{

        load();

    },[]);

    if(!report){

        return(
            <p>
                Loading...
            </p>
        );
    }

    return(
        <div>

            <h1 className="text-2xl font-bold mb-5">
                📊 Reports
            </h1>

            <div className="grid grid-cols-2 gap-5">

                <Card
                    title="Questions Asked"
                    value={
                        report.questions
                    }
                />

                <Card
                    title="Question Votes"
                    value={
                        report.questionVotes
                    }
                />

                <Card
                    title="Polls Created"
                    value={
                        report.polls
                    }
                />

                <Card
                    title="Poll Votes"

                    value={
                        report.pollVotes
                    }
                />
            </div>
        </div>
    );
}

function Card(
{
title,
value
}:
{
title:string;
value:number | null;
}
){


return(
    <div className="bg-[#0a0f14] border border-[#1a2230] rounded-xl p-6">

        <p className="text-gray-400">
            {title}
        </p>
        <h2 className="text-3xl mt-3">

            {value}
        </h2>
    </div>
);
}