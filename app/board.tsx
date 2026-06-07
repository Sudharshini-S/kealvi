"use client";
import { useEffect, useState } from "react";

type User = {
    name: string;
    questions: number;
    questionVotes: number;
    polls: number;
    pollVotes: number;
    score: number;
};

export default function Board(){
    const [users,setUsers] = useState<User[]>([]);
    async function load(){
        const res = await fetch(
            "/api/board"
        );
        const data = await res.json();
        setUsers(data);
    }

    useEffect(()=>{
        load();
    },[]);

    return(
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">
                Leader Board
            </h1>
            {
                users.map(
                (user,index)=>(

                <div
                    key={user.name}
                    className="bg-[#0a0f14] border border-[#1a2230] rounded-xl p-5"
                >

                    <h2 className="text-xl font-bold">
                        #{index+1}
                        {" "}
                        {user.name}
                    </h2>

                    <div className="mt-4 space-y-2 text-gray-300">
                        <p>
                            Questions Asked : {user.questions}
                        </p>

                        <p>
                            Question Upvotes : {user.questionVotes}
                        </p>

                        <p>
                            Polls Created : {user.polls}
                        </p>

                        <p>
                            Poll Votes : {user.pollVotes}
                        </p>

                    </div>

                    <h3 className="mt-4 text-blue-400">

                        Score : {user.score}

                    </h3>
                </div>

                ))
            }
        </div>
    );
}