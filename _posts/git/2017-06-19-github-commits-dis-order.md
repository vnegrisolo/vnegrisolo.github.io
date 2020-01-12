---
layout: post
title: "Github commits dis-order"
date: 2017-06-19 12:00:00
last_modified_at: 2017-06-19 12:00:00
categories: Git
---

Have you ever noticed that sometimes **Github** lists your commits in a **weird order**? I'd say disordered. Was that a **bug**? Or was that a **feature**? Was that the developer fault? Should we blame `git rebase`? All these questions and a **hacky trick** as an alternative solution.

## The Flow

So you open a branch to work on your feature, create a lot of commits, and push them to `origin` on Github. Then you open your PR and realise that the order of the commits are not the same as you did. This might be your mind trolling you, so you verify your local repo and run a simple `git log` to realize that your brain is good. There's something else happening and it's not on your machine.

Today I shared this with the team and I got a link back with [this explanation][gh-blog-commits-wrong-order]. **Yes**, your commits may be out of order and this is a known issue. So I checked [git log documentation][git-log] and there's a section called *"Commit Ordering"*. OK, it seems that the best way for github to list commits is sure by date.

## Commits ordering

All commits, except the very first one, will have **parent commits**. And the problem in to try the `--topo-order` is that a commit might have **multiple parents**. This could cause some confusion when checking the history of changes. Said it so it's fine that Github uses `--date-order`. By the way, you can check the parents commits of your git history using `%p`, check this out:

```shell
git log --pretty=format:"%ai %h <= %p by %an, %s" --date=iso
```

## Git dates

Dates are stored in **seconds** on git repositories. So it's pretty easy to get **multiple commits in the same second**. Chiefly when you run a `git rebase`. So should `git rebase` be guilt here?

They might suggest the following, but I already tell that this is **wrong**, here what they say:

> If you always want to see commits in order, we recommend not using git rebase.

When such import service for developers recommend not using a tool, in this case `git rebase` this could be **misinterpreted by new developers** that would avoid to use that tool in all situations.

The message to be shared here is that `git rebase` is a great tool that you should keep using to keep your commits perfect...

## A Proper Solution

It seems that a proper solution might be implemented by Github. So Github could keep sorting by date, and in case of conflicts (multiple commits with the same date in seconds) just consider the parent commit hash for a semi-topo order. Performance may be a concern but it looks like feasible.

## Hacky solution

Meanwhile they don't present a proper solution let's run through our hacky one:

```shell
git rebase -i master
# `edit` => change all commits you want to rebase from `pick` to `edit`
while true; do
  git commit --amend --no-edit
  sleep 2
  git rebase --continue || break
done
```

So for every commit you amend it to reset the date, then you sleep for 2 seconds and continue the rebase, until the rebase finishes.

That's all folks, I hope this post was useful for you.

{% include markdown/acronyms.md %}
{% include markdown/images.md %}

[git-log]: https://git-scm.com/docs/git-log 'Git log'
[gh-blog-commits-wrong-order]: https://help.github.com/articles/why-are-my-commits-in-the-wrong-order/ 'Github wrong order commits'
