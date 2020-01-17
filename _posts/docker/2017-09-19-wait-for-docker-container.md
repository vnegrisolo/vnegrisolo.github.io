---
layout: post
title: "Wait for Docker Container"
date: 2017-09-19 12:00:00
last_modified_at: 2017-09-19 12:00:00
categories: Docker
---

You may have some docker 🐳 containers 📦 to start your app but there are some startup order to be followed. You are probably using a solution such as `docker-compose` and wonder why they don't have this implemented yet? On this blog post I'll present my solution for this problem, a very simple shell script for waiting a container.

## The Problem

In case you are using a `docker-compose` tool and you have at least 2 containers to run, let's say a database and your web app, you will want to start your database first and then start the web app. On [Docker startup order documentation][dk-startup-order] pages they talk about this problem and the solution is outside of docker code.

I have read this article and following the references I found this [nice solution][dk-wait-for-it-inspiration]. I started with this one but very quickly I had to change it to adapt to my own goals.

## The Solution

So after changing a little bit I got to a **good** point and I'd like to share this.

I'd like to run this script simple as:

```shell
./wait-for -t=5 pg_dev:5432 -t=10 api.dev:3000
```

In this case the script will wait for `pg_dev:5432` for up to 5 seconds and in **parallel** it will wait for `api.dev:3000` for up to 10 seconds.

I put some effort to make this very simple but with some nice features as:

- **multiple** host:port tuples
- separate **timeouts** per host:port tuples
- **parallel** waiting
- stdout **logging**

So here it is:

{: data-title="bin/wait-for"}
```shell
#!/bin/sh

log() {
  echo "[wait-for] [`date +'%Y%m%d%H%M%S'`] $@"
}

usage() {
  echo "Usage: `basename "$0"` [--timeout=15] <HOST>:<PORT> [<HOST_2>:<PORT_2>]"
}

unknown_arg() {
  log "[ERROR] unknown argument: '$@'"
  usage
  exit 2
}

wait_for() {
  timeout=$1 && host=$2 && port=$3
  log "wait '$host':'$port' up to '$timeout'"
  for i in `seq $timeout` ; do
    if nc -z "$host" "$port" > /dev/null 2>&1 ; then
      log "wait finish '$host:$port' [`expr $(date +%s) - $START`] seconds"
      exit 0
    fi
    log "wait attempt '${host}:${port}' [$i]"
    sleep 1
  done
  log "[ERROR] wait timeout of '$timeout' on '$host:$port'"
  exit 1
}

trap 'kill $(jobs -p) &>/dev/null' EXIT

START=$(date +%s)
timeout=15
pids=""
for i in $@ ; do
  case $i in
    --timeout=*) timeout="${i#*=}" ;;
    -t=*) timeout="${i#*=}" ;;
    *:* )
      wait_for "$timeout" "${i%%:*}" "${i##*:}" &
      pids="$pids $!"
    ;;
    *) unknown_arg "$i" ;;
  esac
done

status=0
for pid in $pids; do
  if ! wait $pid ; then
    status=1
  fi
done

log "wait done with status=$status"
exit $status
```

This script depends on `nc` netcat to run and I tested on `alpine` linux and on macOS. You may have to change this command if you want to run on a different linux distribution. You may want to add this script file into for example `/usr/local/bin`.

I created this [github wait-for repo][gh-wait-for] to keep it as it may be very reused.

## Usage example

Regarding how would you use it in a `docker-compose.yml` file I have this simple example:

{: data-title="docker-compose.yml"}
```yml
# docker-compose.yml
version: "3"
services:
  web_dev:
    build: .
    command: >
      sh -c 'bin/wait-for pg_dev:5432 &&
             bundle exec rails server'
    ports:
      - "3000:3000"
    depends_on:
      - pg_dev

  pg_dev:
    image: postgres
    ports:
      - "5432:5432"
```

I prefer to use the `wait-for` script on the begining of the `command` instruction as it becomes more intuitive, also you want want to run different commands that does not need to perform the `wait-for` action, such as run some static code analysis or a code lint. For similar reasons I avoid to use `entrypoint` for that.

It seems that a `docker-compose.yml` file is a perfect place to add configuration for execution time. All dependencies will be there in that file, so it's easy to make references from each other and `wait-for` them when necessary.

I started the `command: >` value with the `>` mark because I'd like to set my configuration in multiple lines in this yaml file for better readability.

Finally I had to use `sh -c '...'` in order to run multiple shell commands - one per line.

## Conclusion

I hope that docker includes a proper solution on their side as this seems to be a spread need in the community. Meanwhile this does not happen I am happy to keep this repo. The solution was simple and then easy to maintain.

If you have any ideas on how to make it better please get in touch.

Cheers!

{% include markdown/acronyms.md %}

[dk-startup-order]: https://docs.docker.com/compose/startup-order/ 'Docker compose startup order'
[dk-wait-for-it-inspiration]: https://github.com/vishnubob/wait-for-it 'Docker wait for it'
[gh-wait-for]: https://github.com/vnegrisolo/wait-for 'Github wait-for'
