"use client";
import { useState } from "react";

type Alert={
    id:string;
    message:string;
    type:string;
    created_at:string;
};

export default function Alerts(){
    const [name,setName]=useState("");
    const [alerts,setAlerts]=useState<Alert[]>([]);
    const [checked,setChecked]=useState(false);

    async function load(){
        if(!name){
            alert("Enter your name");
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
            "/api/alerts?author="+formattedName
        );

        const data=await res.json();

        setAlerts(data);
        setChecked(true);
    }

    return(
        <div className="space-y-5">

            <h1 className="text-2xl font-bold">
                🔔 Alerts
            </h1>

            <div className="flex gap-3">

                <input
                    value={name}
                    onChange={(e)=>
                        setName(e.target.value)
                    }
                    placeholder="Enter your name"
                    className="flex-1 bg-[#111418] border border-[#252b33] rounded-lg p-3"
                />

                <button
                    onClick={load}
                    className="px-6 bg-blue-600 rounded-lg"
                >
                    Check
                </button>

            </div>


            {checked && alerts.length===0 && (

                <div className="bg-[#111418] border border-[#252b33] rounded-xl p-5 text-gray-400 text-center">

                    No notifications or alerts for you

                </div>

            )}


            <div className="space-y-3">

                {alerts.map(alert=>(

                    <div
                        key={alert.id}
                        className="bg-[#111418] border border-[#252b33] rounded-xl p-5"
                    >

                        <p>
                            {alert.message}
                        </p>

                        <span className="text-gray-500 text-sm">
                            {alert.type}
                        </span>

                    </div>

                ))}

            </div>

        </div>
    );
}