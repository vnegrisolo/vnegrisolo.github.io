---
layout: post
title: "Generating fake data using SQL"
date: 2017-12-06 12:00:00
last_modified_at: 2017-12-06 12:00:00
categories: PostgreSQL
---

Fake data are very useful in development environment for testing your application or some query performances for example. In this Blog Post I'll share how I created a simple SQL script for PostgreSQL 🐘 to generate some fake data. Enjoy!

## Intro

I started this idea when I was testing some query changes and performance improvements on a PostgreSQL database. On the very first attempt my query failed miserably because the data that I had was not enough, and creating all the data with relations was so time consuming. I've done some research and finally I got some amazing scripts.

## The setup

All the commands are run directly in `psql` command line interface, so let's connect to it:

```shell
psql -h localhost -U postgres
```

Then I've created a PostgreSQL database for isolating my tables:

```sql
CREATE DATABASE test_db;
\c test_db
```

All done, so let's understand the model used in this blog post.

## The Data Model

For the purpose of this blog post I've created a very simple data model that are widely used as example on a lot of sql snippets and discussions in the internet.

Here it goes an ERD image to represent the model:

![user-post-comment-erd]

And here it is the `CREATE TABLE` script:

```sql
CREATE TABLE users(
  id    SERIAL PRIMARY KEY,
  email VARCHAR(40) NOT NULL UNIQUE
);
CREATE TABLE posts(
  id      SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title   VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE comments(
  id      SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  post_id INTEGER NOT NULL REFERENCES posts(id),
  body    VARCHAR(500) NOT NULL
);
```

Note that all tables have an `id SERIAL PRIMARY KEY` column, so PostgreSQL will take care about generating the ids for me.

A `User` has **email**, `Post` belongs to a `User` and it has **title** and `Comment` belongs to a `Post` and it's made by another `User` and it has **body** column.

I am using **FOREIGN KEYS** off course and **NOT NULL** as I want to have basic data validations on the DB level, as always.

## Generate Random Data

Let's start with the `users` table. In this case the only field that I need to generate is a `VARCHAR` one.

So I started this querying on `GENERATE_SERIES(1, 10)` as an easy way to generate **10 rows** for me. Note how easy is to generate a thousand or a million of rows just changing a single number.

Then the idea is to use the `seq` field given by the `GENERATE_SERIES` to have just unique values as I have this constraint. I can also use `RANDOM()` function to build some random data in this case I am choosing the email domain from a finite list.

```sql
INSERT INTO users(email)
SELECT
  'user_' || seq || '@' || (
    CASE (RANDOM() * 2)::INT
      WHEN 0 THEN 'gmail'
      WHEN 1 THEN 'hotmail'
      WHEN 2 THEN 'yahoo'
    END
  ) || '.com' AS email
FROM GENERATE_SERIES(1, 10) seq;

SELECT * FROM users;
```

These are the inserted `users`:

```
 id |        email
----+---------------------
  1 | user_1@gmail.com
  2 | user_2@gmail.com
  3 | user_3@gmail.com
  4 | user_4@gmail.com
  5 | user_5@gmail.com
  6 | user_6@gmail.com
  7 | user_7@yahoo.com
  8 | user_8@gmail.com
  9 | user_9@yahoo.com
 10 | user_10@hotmail.com

(10 rows) Time: 5.159 ms
```

I've got strongly inspired by this amazing [PG Cast - Generating Fake Email Addresses][pg-cast-fake-data].

This was easy, let's move on and see how to choose random DB references.

## Choosing Random Relationships

The `Post` model is the first one which has a `FOREIGN KEY`, so I have to use real `users.id` values. Also I'd like to perform some queries that return some random number of rows, so I'd like to chose a random `User` for each `Post`. This is a simple way to guarantee some **rand number of posts per user**.

This was a bit more complex to build than the previous one. To make it easier to understand I used a lot of CTE.

I've started creating a CTE called `expanded` to get a limited sequence of rows using `GENERATE_SERIES`, the same idea as before. The trick I've used here was to cross join with the `users` table in order to get all possible combination of generate sequence and `user_id`. I am pretty sure that this is not very efficient but it solves the problem. Finally I've also used `RANDOM()` to be used later on when choosing a random `User`.

On the second CTE `shuffled` I've used the `MIN` aggregation function on a grouped by `seq` column over the `expanded` temp table to get a single chosen value per `seq`. Then we `INNER JOIN` with the same `expanded` temp table to get the chosen `user_id`.

Check this out:

```sql
INSERT INTO posts(user_id, title)
WITH expanded AS (
  SELECT RANDOM(), seq, u.id AS user_id
  FROM GENERATE_SERIES(1, 50) seq, users u
), shuffled AS (
  SELECT e.*
  FROM expanded e
  INNER JOIN (
    SELECT ei.seq, MIN(ei.random) FROM expanded ei GROUP BY ei.seq
  ) em ON (e.seq = em.seq AND e.random = em.min)
  ORDER BY e.seq
)
SELECT
  s.user_id,
  'It is ' || s.seq || ' ' || (
    CASE (RANDOM() * 2)::INT
      WHEN 0 THEN 'sql'
      WHEN 1 THEN 'elixir'
      WHEN 2 THEN 'ruby'
    END
  ) as title
FROM shuffled s;

SELECT * FROM posts LIMIT 10;
```

And the inserted `posts`:

```
 id | user_id |         title
----+---------+------------------------
  1 |      10 | It is 1 sql
  2 |       2 | It is 2 sql
  3 |      10 | It is 3 ruby
  4 |       5 | It is 4 sql
  5 |       3 | It is 5 elixir
  6 |       9 | It is 6 elixir
  7 |       4 | It is 7 sql
  8 |       5 | It is 8 ruby
  9 |       7 | It is 9 ruby
 10 |       4 | It is 10 sql

(10 rows) Time: 3.134 ms
```

## Multiple Relationships

In the `comments` table I have 2 relationships to chose: `user_id` and `post_id`. The solution is pretty much the same, the only change is in the cross join, so we add more table to it.

Note that `shuffled` CTE is the same as before:

```sql
INSERT INTO comments(user_id, post_id, body)
WITH expanded AS (
  SELECT RANDOM(), seq, u.id AS user_id, p.id AS post_id
  FROM GENERATE_SERIES(1, 200) seq, users u, posts p
), shuffled AS (
  SELECT e.*
  FROM expanded e
  INNER JOIN (
    SELECT ei.seq, MIN(ei.random) FROM expanded ei GROUP BY ei.seq
  ) em ON (e.seq = em.seq AND e.random = em.min)
  ORDER BY e.seq
)
SELECT
  s.user_id,
  s.post_id,
  'Here some comment ' || s.seq AS body
FROM shuffled s;

SELECT * FROM comments LIMIT 10;
```

And the generated random data:

```
  id | user_id | post_id |         body
 ----+---------+---------+----------------------
   1 |       9 |       3 | Here some comment 1
   2 |       3 |      32 | Here some comment 2
   3 |       9 |      41 | Here some comment 3
   4 |       8 |      28 | Here some comment 4
   5 |       9 |      40 | Here some comment 5
   6 |       9 |       5 | Here some comment 6
   7 |       9 |       7 | Here some comment 7
   8 |       3 |      48 | Here some comment 8
   9 |       4 |      50 | Here some comment 9
  10 |       7 |      38 | Here some comment 10

(10 rows) Time: 1.987 ms
```

## Conclusion

This is a very flexible way to build your generated data with as much data as you need to test your query performance. The truth is that I created this to run on PostgreSQL but it may be very easy to adapt to other SQL database. Thanks for reading! 👍

{% include markdown/acronyms.md %}

[pg-cast-fake-data]: https://www.pgcasts.com/episodes/4/generating-fake-email-addresses/ 'PG cast fake data'
[user-post-comment-erd]: /images/posts/user-post-comment-erd.png 'User/Post/Comment ERD'
{: style="max-width: 20rem"}
