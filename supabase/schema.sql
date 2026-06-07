drop table if exists notifications cascade;
drop table if exists poll_votes cascade;
drop table if exists polls cascade;
drop table if exists votes cascade;
drop table if exists questions cascade;


create table questions (
    id uuid primary key default gen_random_uuid(),
    body text not null,
    author text not null,
    pinned boolean default false,
    created_at timestamptz default now()
);


create table votes (
    id uuid primary key default gen_random_uuid(),
    question_id uuid not null references questions(id) on delete cascade,
    voter_id text not null,
    created_at timestamptz default now(),
    unique(question_id, voter_id)
);


create index votes_question_id_idx on votes(question_id);

create index questions_author_idx on questions(author);


create index questions_search_idx on questions using gin(to_tsvector('english', body));

create table polls (
    id uuid primary key default gen_random_uuid(),
    question text not null,
    author text not null,
    options jsonb not null,
    created_at timestamptz default now()
);


create index polls_author_idx on polls(author);


create index polls_search_idx on polls using gin(to_tsvector('english', question));


create table poll_votes (
    id uuid primary key default gen_random_uuid(),
    poll_id uuid not null references polls(id) on delete cascade,
    voter_id text not null,
    option_index int not null,
    created_at timestamptz default now(),
    unique(poll_id, voter_id)
);


create index poll_votes_poll_id_idx on poll_votes(poll_id);

create table notifications (
    id uuid primary key default gen_random_uuid(),
    author text not null,
    message text not null,
    type text,
    is_read boolean default false,
    created_at timestamptz default now()
);


create index notifications_author_idx on notifications(author);


insert into questions ( body,author,created_at )values
(
'How do I deploy to Vercel?',
'Priya',
now()
),

(
'What is the difference between server and client components?',
'Marcus',
now()
),

(
'When should I add a database index?',
'Aisha',
now()
),

(
'How does Postgres full text search work?',
'Diego',
now()
),

(
'How does optimistic UI work?',
'Lena',
now()
);



insert into polls (question, author, options ) 
values
(
'Which frontend framework do you like?',
'Priya',
'
[
 {"text":"React"},
 {"text":"Angular"},
 {"text":"Vue"}
]
'
::jsonb
),


(
'Best database for Next.js?',
'Ravi',
'
[
 {"text":"Supabase"},
 {"text":"MongoDB"},
 {"text":"MySQL"}
]
'
::jsonb
);


insert into notifications ( author,message, type ) values
(
'Priya',
'Your question received an upvote',
'question_vote'
);