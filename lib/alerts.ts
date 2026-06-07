import { supabase } from "./supabase";

export async function getAlerts(
author:string
){
const {data,error} =
await supabase
.from("notifications")
.select("*")
.eq(
"author",
author
)
.order(
"created_at",
{
ascending:false
}
);

if(error){
throw error;
}
return data;
}