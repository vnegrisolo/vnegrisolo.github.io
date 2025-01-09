---
layout: talk
title: "Phoenix LiveView Way"
categories: Talks
tags: Elixir Phoenix
date: 2025-01-07 12:00:00
last_modified_at: 2025-01-07 12:00:00
---

Let's dive into the LiveView way of coding.

---

# How this started?
- Adoption and Frustration
- Is LV in the middle of a existential crisis?

---

# LiveView Highlights
- since 2019
- prod ready many years ago
- stable, fast, productive and fun

---

# Why is not getting much more traction?
- market share with modern languages
- harder to get new devs into Elixir?
- is there any technical challenges?

---

# What is LiveView?
- It's an enhancement of Phoenix.
- LiveView is for Web Development

---

# What is Phoenix?
- It's an MVC* framework written in Elixir

---

# In a nutshell
- LV renders view like Phoenix Controllers
- It establishes WS connection
- It keeps a state like React
- State lives in the WS conn in the server

---

# How and Why?
- Established WS conn saves SSL handshaking
- Can handle millions of conns at a time
- Phoenix Channel keeps the state
- Phoenix can auto diff html*

---

# Phoenix LiveView HTTP vs WS

![live-view-http]

---

# Phoenix LiveView Client Events

![live-view-client-events]

---

# Phoenix LiveView PubSub

![live-view-pubsub]

---

# Easy to maintain
- no need to graphql/json layers
- no need for js framework
- warnings/errors at compilation time

---

# LiveView Learning
- easy to learn, same old html/css/js/elixir code
- syntax soup: elixir/HEEX/mustache
- angular attrs
- react render and state
- a few callbacks to memorize

---

# The main problems when learning

| characteristics | implications |
| --- | --- |
| in-memory state can go away | the **deploy** problem |
| state growth increases server memory | **too much data** problem |
| user can get locked on long queries | **1 message at a time** problem |

---

# But before let's talk about Ruby
```ruby
class SyncData < ApplicationSubscriber
  attach_to %w[address phone]
  attr_reader :model

  def created(model)
    @model = model

    case model
    when Address
      sync_address
    when Phone
      sync_phone
    end
  end

  def sync_address
    body = model.slice(:address1, :city, :state, :zip)
    API.post(url: "/address/#{model.user_id}", body:)
  end

  def sync_phone
    body = model.slice(:number)
    API.post(url: "/phone/#{model.user_id}", body:)
  end
end
```

---

# Is concurrency a problem in Elixir?
- messages between processes
- no threads with shared memory
- data immutability
- function with args
- GenServer with state
- ETS/PG and other data sources

---

# What is a GenServer 1/2

> A GenServer is a process like any other Elixir process and it can be used to keep state, execute code asynchronously and so on.

- ****asynchronously**
- built in **mailbox** for incoming messages
- one message at a time
- builds and keep data in memory
- other processes can interact with

---

# What is a GenServer 2/2

![genserver]

---

# LiveView & GenServer

- LiveView uses Phoenix Channel
- Phoenix Channel uses GenServer
- WS connection has their own state

---

# LiveView & GenServer Pros

- single event being processed per user
- no data integrity issues due to concurrency
- state on server
- html diff
- less js client code
- WS saves SSL handshaking

---

# LiveView & GenServer Cons

- the **deploy** problem
- **too much data** problem
- **1 message at a time** problem

---

# The deploy problem

- find a less volitile way to store the user state:
  - query params (open modal)
  - form inputs (leverage form recovery after 1st connection)
  - LocalStorage

```elixir
# router
scope "/families", FamilyLive do
  live("/", Index, :table)
  live("/board", Index, :board)
  live("/new", Index, :new)
end
```

---

# Too much data problem

- LiveView Streams => temporary assigns
- `stream(socket, :songs, [song1, song2, song3])`

```elixir
def mount(_params, _session, socket) do
  stream(socket, :songs, ["song1", "song2", "song3"]) |> ok()
end

def handle_event("add_something", %{"song" => song}, socket) do
  socket |> stream_insert(:songs, song, at: -1) |> noreply()
end

def render(assigns) do
  ~H"""
  <ul id="songs" phx-update="stream">
    <li :for=\{\{dom_id, song} <- @streams.songs} id={dom_id}>
      <%= song %>
    </li>
  </ul>
  """
end
```

---

# One message at a time problem

- `assign_async` / `start_async`

```elixir
def mount(%{"slug" => slug}, _, socket) do
  socket |> assign_async(:org, fn -> {:ok, %{org: fetch_org!(slug)}} end) |> ok()
end

def render(assigns) do
  ~H"""
  <div :if={@org.loading}>Loading organization...</div>
  <div :if={@org.ok? && @org.result}><%= @org.result.name %> loaded!</div>
  """
end
```

---

# Phoenix LiveView Async

![live-view-async]

---

# LiveView web development
- Perfect mix of performance, productivity, and fun.

---

# Summary

- LV has all building blocks ready
- Major benefits:
  - scales well
  - fresh data for free
  - easiest to refactor
  - no graphql/json/xml layers
  - js is no law land so kept to minimal
- LiveView is the Best tool for the job

{% include markdown/acronyms.md %}

[genserver]: /images/genserver.png 'GenServer'
[live-view-http]: /images/live-view-http.png 'LiveView HTTP'
[live-view-client-events]: /images/live-view-client-events.png 'LiveView Client Events'
[live-view-pubsub]: /images/live-view-pubsub.png 'LiveView PubSub'
[live-view-async]: /images/live-view-async.png 'LiveView Async'
[obstacle]: /images/obstacle.png 'obstacle'
