---
layout: talk
title: "Phoenix LiveView & GenServer"
categories: Talks
tags: Elixir Phoenix
date: 2024-08-27 12:00:00
last_modified_at: 2024-08-27 12:00:00
---

My Goal is to talk about how GenServer defines Web Development for LiveView

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

# Phoenix LiveView Basics

- uses Phoenix Controller for HTTP GET
- uses Phoenix Channel for WS
- 2 calls once on `mount`, `live_params` and `render`

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

# LiveView & GenServer

- LiveView uses Phoenix Channel
- Phoenix Channel uses GenServer
- WS connection has their own state

| characteristics | implications |
| --- | --- |
| in memory state can go away | the **deploy** problem |
| state growth increases server memory | **too much data** problem |
| user can get locked on long queries | **1 message at a time** problem |

---

# How it feels

| How it feels | How's it Supposed to Feel |
| --- | --- |
| ![obstacle] | ![obstacle]{: .rotate-90 } |

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

# Async Stream idea

> if the data takes too long to be retrieved and if it's too much to keep in memory

- mix stream & async

```elixir
defmodule MyAppWeb.Admin.UserLive.Index do
  use MyAppWeb, :live_view

  def mount(_params, _session, socket) do
    socket
    |> stream(:users, [])
    |> assign_users()
    |> ok()
  end

  def handle_async(:users, {:ok, results}, socket) do
    socket
    |> assign(:users, AsyncResult.ok(:users))
    |> stream(:users, results, reset: true)
    |> noreply()
  end

  def render(assigns) do
    ~H"""
    <div class={["mt-6 flex flex-col gap-2", @users.loading && "loading"]}>
      <.table id="users" rows={@streams.users}>
        <:col :let={ {_id, user} } label="Role"><%= user.role %></:col>
        <:col :let={ {_id, user} } label="Email"><%= user.email %></:col>
      </.table>
    </div>
    """
  end

  def assign_users(socket) do
    %{current_user: current_user} = socket.assigns

    socket
    |> assign(:users, AsyncResult.loading())
    |> start_async(:users, fn -> Repo.search(User, current_user, %{}) end)
  end
end
```

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
