import { supabase } from "./supabase";

export async function getReports(){

const {count:questions} =
await supabase
.from("questions")
.select("*",
{
count:"exact",
head:true
});

const {count:polls} =
await supabase
.from("polls")
.select("*",
{
count:"exact",
head:true
});

const {count:questionVotes} =
await supabase
.from("votes")
.select("*",
{
count:"exact",
head:true
});

const {count:pollVotes} =
await supabase
.from("poll_votes")
.select("*",
{
count:"exact",
head:true
});

return {
questions,
polls,
questionVotes,
pollVotes
};
}