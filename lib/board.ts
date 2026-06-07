import { supabase } from "./supabase";

export async function getBoard(){

const {data:questions} =
await supabase
.from("questions")
.select(
`
author,
votes(id)
`
);

const {data:polls} =
await supabase
.from("polls")
.select(
`
author,
poll_votes(id)
`
);

const users:any={};

questions?.forEach(
(q:any)=>{

if(!users[q.author]){

users[q.author]={
name:q.author,
questions:0,
questionVotes:0,
polls:0,
pollVotes:0,
score:0
};
}

users[q.author].questions++;

users[q.author].questionVotes
+=
q.votes.length;

});


polls?.forEach(
(p:any)=>{

if(!users[p.author]){

users[p.author]={
name:p.author,
questions:0,
questionVotes:0,
polls:0,
pollVotes:0,
score:0
};

}

users[p.author].polls++;

users[p.author].pollVotes
+=
p.poll_votes.length;
});

return Object.values(users)
.map((u:any)=>({
...u,

score:
u.questions+
u.questionVotes+
u.polls+
u.pollVotes
}))
.sort(
(a:any,b:any)=>
b.score-a.score
);
}