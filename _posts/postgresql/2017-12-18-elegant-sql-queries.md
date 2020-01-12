---
layout: post
title:  "Elegant SQL Queries"
date:   2017-12-18 12:00:00
last_modified_at: 2017-12-18 12:00:00
categories: PostgreSQL
---

This is a short blog post for sharing some sql examples to solve some daily problems in an elegant way. There are some simple business requests that could easily be solved with N+1 queries, but watch out this is a trap. If you want to scale your app you'll need to leverage queries processing to the DB. Let's see how though these examples.

## Intro

For sharing purposes I'm using the same model structure as defined on my previous post [Generate fake data using SQL][sql-gen-fake-data] so please if you want to follow this on your local PostgreSQL DB please go to that post and create the tables: `users`, `posts` and `comments`. Then you can generate some fake data. I am using PostgreSQL 10.1.

## 1st: Fetch users with its posts count

This is a very simple one just for warming up. Here's my solution:

```sql
SELECT u.id, u.email, COUNT(p.user_id) AS posts_count
FROM users AS u
LEFT JOIN posts p ON (u.id = p.user_id)
GROUP BY u.id, u.email
ORDER BY posts_count DESC
LIMIT 10;
```

The trick here is that you need to join `users` with `posts` in order to group and count. Because of that for every field on the `users` table that you want to retrieve you'll need to add it into the group by clause as well. In the end we can order by the `posts_count` so the result is quite good to be used as-is. This is the result:

```
 id |        email        | posts_count
----+---------------------+-------------
  4 | user_4@gmail.com    |          10
  3 | user_3@gmail.com    |           8
  5 | user_5@gmail.com    |           7
 10 | user_10@hotmail.com |           6
  1 | user_1@gmail.com    |           5
  7 | user_7@yahoo.com    |           4
  2 | user_2@gmail.com    |           4
  6 | user_6@gmail.com    |           2
  9 | user_9@yahoo.com    |           2
  8 | user_8@gmail.com    |           2

(10 rows) Time: 4.583 ms
```

## 2nd: Fetch users with their most commented post

In this report we'll need to join the three tables: `users`, `posts` and `comments`. On this one I used some CTE to make this query a little bit more readable. I broke this solution in three queries.

I started this with `posts_with_comments_count` to select all posts with its commets_count, using the same strategy as in the previous example, with group and count.

Then I created `users_with_comments_count` to fetch the users with the **max** comments_count using again the same approach as before, but now using a `MAX` aggregation function.

And finally we join both CTEs by the `user_id` and `comments_count`. The result was not great, but let's check this to find out why:

```sql
WITH posts_with_comments_count AS (
  SELECT p.user_id, p.id AS post_id, p.title, COUNT(c.post_id) AS comments_count
  FROM posts p
  LEFT JOIN comments c ON (p.id = c.post_id)
  GROUP BY p.user_id, p.id, p.title
), users_with_comments_count AS (
  SELECT u.id AS user_id, u.email, MAX(pc.comments_count) AS comments_count
  FROM users u
  LEFT JOIN posts_with_comments_count pc ON (u.id = pc.user_id)
  GROUP BY u.id, u.email
)
SELECT
  uc.user_id,
  uc.email,
  pc.post_id,
  pc.title,
  CASE WHEN pc.comments_count IS NULL THEN 0 ELSE pc.comments_count END AS comments_count
FROM users_with_comments_count uc
LEFT JOIN posts_with_comments_count pc ON (uc.user_id = pc.user_id AND uc.comments_count = pc.comments_count)
ORDER BY comments_count DESC, email ASC
LIMIT 10;
```

And we can see in the result a **problem** with duplicated users:

```
 user_id |       email        | post_id |      title      | comments_count
---------+--------------------+---------+-----------------+----------------
       1 | user_1@hotmail.com |      12 | It is 12 ruby   |              7
       1 | user_1@hotmail.com |      49 | It is 49 elixir |              7
       1 | user_1@hotmail.com |      34 | It is 34 ruby   |              7
       2 | user_2@gmail.com   |      20 | It is 20 elixir |              7
       5 | user_5@hotmail.com |      43 | It is 43 elixir |              7
       6 | user_6@hotmail.com |      36 | It is 36 ruby   |              7
       8 | user_8@hotmail.com |      39 | It is 39 elixir |              7
       3 | user_3@hotmail.com |      50 | It is 50 ruby   |              6
       9 | user_9@hotmail.com |      27 | It is 27 sql    |              5
       9 | user_9@hotmail.com |      31 | It is 31 sql    |              5

(10 rows) Time: 3.984 ms
```

Joining by `user_id` and `comments_count` was not enough to ensure that we'd have unique users. This is **very bad**. So after doing some research I came up with this one:

## 3nd: Fetch unique users with their most commented post

This solution slightly differs from the previous one. I introduce the `ROW_NUMBER` over a partition to create a `ranking` column so every user will have his own ranking numbers starting from 1. This way way we can filter out posts with ranking greater than 1.

```sql
WITH posts_with_comments_count AS (
  SELECT p.user_id, p.id AS post_id, p.title, COUNT(c.post_id) AS comments_count
  FROM posts p
  LEFT JOIN comments c ON (p.id = c.post_id)
  GROUP BY p.user_id, p.id, p.title
), top_posts AS (
  SELECT pc.user_id, pc.post_id, pc.title, pc.comments_count, ROW_NUMBER() OVER (
    PARTITION BY pc.user_id
    ORDER BY pc.comments_count DESC
  ) AS ranking
  FROM posts_with_comments_count AS pc
)
SELECT
  u.id AS user_id,
  u.email,
  tp.post_id,
  tp.title,
  tp.comments_count
FROM users u
LEFT JOIN top_posts tp ON (u.id = tp.user_id)
WHERE tp.ranking <= 1
ORDER BY tp.comments_count DESC, u.email ASC
LIMIT 10;
```

Now we have unique users with their most commented post:

```
 user_id |        email        | post_id |      title      | comments_count
---------+---------------------+---------+-----------------+----------------
       1 | user_1@hotmail.com  |      49 | It is 49 elixir |              7
       2 | user_2@gmail.com    |      20 | It is 20 elixir |              7
       5 | user_5@hotmail.com  |      43 | It is 43 elixir |              7
       6 | user_6@hotmail.com  |      36 | It is 36 ruby   |              7
       8 | user_8@hotmail.com  |      39 | It is 39 elixir |              7
       3 | user_3@hotmail.com  |      50 | It is 50 ruby   |              6
       9 | user_9@hotmail.com  |      27 | It is 27 sql    |              5
       4 | user_4@gmail.com    |      25 | It is 25 elixir |              4
       7 | user_7@hotmail.com  |       8 | It is 8 elixir  |              4
      10 | user_10@hotmail.com |      32 | It is 32 sql    |              3

(10 rows) Time: 3.357 ms
```

## 4th: Fetch unique users with their top 2 most commented posts

This is a great opportunity to use the same query as before, but now with some aggregation function to have a list os posts per user. This was more complicated than I thought initially and might be not the best solution ever.

In order to achieve that I used: `ARRAY_TO_JSON`, `ARRAY_AGG` and `JSON_BUILD_OBJECT`, let's see how:

```sql
WITH posts_with_comments_count AS (
  SELECT p.user_id, p.id AS post_id, p.title, COUNT(c.post_id) AS comments_count
  FROM posts p
  LEFT JOIN comments c ON (p.id = c.post_id)
  GROUP BY p.user_id, p.id, p.title
), top_posts AS (
  SELECT pc.user_id, pc.post_id, pc.title, pc.comments_count, ROW_NUMBER() OVER (
    PARTITION BY pc.user_id
    ORDER BY pc.comments_count DESC
  ) AS ranking
  FROM posts_with_comments_count AS pc
)
SELECT
  u.id AS user_id,
  u.email,
  ARRAY_TO_JSON(
    ARRAY_AGG(
      JSON_BUILD_OBJECT(
        'post_id',        tp.post_id,
        'title',          tp.title,
        'comments_count', tp.comments_count
      )
    )
  )
FROM users u
LEFT JOIN top_posts tp ON (u.id = tp.user_id)
WHERE tp.ranking <= 2
GROUP BY u.id, u.email
ORDER BY u.email ASC;
```

And my report:

```
 user_id |        email        |                                                               array_to_json
---------+---------------------+-------------------------------------------------------------------------------------------------------------------------------------------
      10 | user_10@hotmail.com | [{"post_id" : 32, "title" : "It is 32 sql", "comments_count" : 3},{"post_id" : 26, "title" : "It is 26 elixir", "comments_count" : 3}]
       1 | user_1@hotmail.com  | [{"post_id" : 49, "title" : "It is 49 elixir", "comments_count" : 7},{"post_id" : 34, "title" : "It is 34 ruby", "comments_count" : 7}]
       2 | user_2@gmail.com    | [{"post_id" : 20, "title" : "It is 20 elixir", "comments_count" : 7},{"post_id" : 45, "title" : "It is 45 elixir", "comments_count" : 5}]
       3 | user_3@hotmail.com  | [{"post_id" : 50, "title" : "It is 50 ruby", "comments_count" : 6},{"post_id" : 5, "title" : "It is 5 sql", "comments_count" : 4}]
       4 | user_4@gmail.com    | [{"post_id" : 25, "title" : "It is 25 elixir", "comments_count" : 4},{"post_id" : 13, "title" : "It is 13 elixir", "comments_count" : 4}]
       5 | user_5@hotmail.com  | [{"post_id" : 43, "title" : "It is 43 elixir", "comments_count" : 7},{"post_id" : 30, "title" : "It is 30 elixir", "comments_count" : 4}]
       6 | user_6@hotmail.com  | [{"post_id" : 36, "title" : "It is 36 ruby", "comments_count" : 7},{"post_id" : 42, "title" : "It is 42 elixir", "comments_count" : 6}]
       7 | user_7@hotmail.com  | [{"post_id" : 8, "title" : "It is 8 elixir", "comments_count" : 4},{"post_id" : 22, "title" : "It is 22 ruby", "comments_count" : 4}]
       8 | user_8@hotmail.com  | [{"post_id" : 39, "title" : "It is 39 elixir", "comments_count" : 7},{"post_id" : 29, "title" : "It is 29 sql", "comments_count" : 6}]
       9 | user_9@hotmail.com  | [{"post_id" : 27, "title" : "It is 27 sql", "comments_count" : 5},{"post_id" : 31, "title" : "It is 31 sql", "comments_count" : 5}]

(10 rows)
```

## Conclusion

I used some common business requests to show how to solve that with pure sql. The main goal is to avoid N+1 queries and then scale up the app. I hope you have enjoyed it! 👍

{% include markdown/acronyms.md %}
{% include markdown/links.md %}
{% include markdown/images.md %}

[sql-gen-fake-data]: {% post_url /postgresql/2017-12-06-generate-fake-data-using-sql %}