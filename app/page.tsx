"use client";
import { useState } from "react";
import QuestionsList from "./questions-list";
import PollsList from "./polls-list";
import Board from "./board";
import Reports from "./reports";
import Alerts from "./alerts";

export default function Home(){

const [tab,setTab]=useState("Q&A");

const tabs=[
    "Q&A",
    "Polls",
    "Leader Board",
    "Reports",
    "Alerts"
];

return(
<div className="min-h-screen bg-black text-white">

    <div className="bg-black px-6 py-5">

    <div className="max-w-6xl mx-auto">

        <div className="bg-[#0d1117] border border-[#252b33] rounded-xl px-8 py-5 flex items-center justify-between">

            <h1 className="text-4xl font-bold tracking-wide">
                Kealvi
            </h1>


            <div className="flex gap-3">

                {
                tabs.map((item)=>(

                    <button
                        key={item}
                        onClick={()=>
                            setTab(item)
                        }
                        className={
                        tab===item
                        ?
                        "px-5 py-2 rounded-lg bg-blue-600 text-white"
                        :
                        "px-5 py-2 rounded-lg text-gray-400 hover:text-white"
                        }
                    >

                        {item}

                    </button>

                ))
                }

            </div>

        </div>


        <div className="mt-5 inline-flex items-center gap-2 bg-[#111418] border border-[#252b33] rounded-full px-5 py-2 text-blue-400">

            <span>
                ●
            </span>

            <span>
                Live now
            </span>

        </div>

    </div>

</div>


    <main className="max-w-6xl mx-auto px-6 py-10">

        {
            tab==="Q&A" &&
            <QuestionsList/>
        }

        {
            tab==="Polls" &&
            <PollsList/>
        }

        {
            tab==="Leader Board" &&
            <Board/>
        }

        {
            tab==="Reports" &&
            <Reports/>
        }

        {
            tab==="Alerts" &&
            <Alerts/>
        }

    </main>

</div>
);
}