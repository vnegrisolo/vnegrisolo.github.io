---
layout: talk
title: "Phoenix LiveView"
categories: Talks
tags: Elixir Phoenix
date: 2021-06-10 12:00:00
last_modified_at: 2021-06-10 12:00:00
---

Phoenix LiveView will turn 2 years soon and is still one of the best ways to develop a very interactive and modern Web App. Let's navigate and discuss some topics about LiveView.

---

# Phoenix LiveView

> LiveView provides rich, real-time user experiences with server-rendered HTML

---

# Creating a LiveView project

```shell
mix phx.new my_app --live
```

---

# Our first LiveView

{: data-title="lib/my_app_web/router.ex" class="two-column"}
```elixir
defmodule MyAppWeb.Router do
  use MyAppWeb, :router

  ...

  scope "/", MyAppWeb do
    pipe_through :browser
    live "/", HomeLive, :index
  end
end
```

{: data-title="lib/my_app_web/live/home_live.ex" class="two-column"}
```elixir
defmodule MyAppWeb.HomeLive do
  use MyAppWeb, :live_view

  @impl Phoenix.LiveView
  def mount(_params, _session, socket) do
    socket |> assign(whom: "world") |> ok()
  end

  defp ok(socket), do: {:ok, socket}
end
```

{: data-title="lib/my_app_web/live/home_live.html.leex"}
```html
<h1>Hello <%= @whom %>! via <%= @live_action %></h1>
```

---

# What is a LiveView again?

The `LiveView` is a `Controller / WebSocket` component. Both not either.

---

# LiveView cycle

regular HTTP request <code>&#8680;</code> `mount/3` <code>&#8680;</code> `handle_params/3` <code>&#8680;</code> `render/1`

> First Meaningful Paint

js kicks in <code>&#8680;</code> WebSocket connection <code>&#8680;</code> `mount/3` <code>&#8680;</code> `handle_params/3` <code>&#8680;</code> `render/1`

---

# Redirect vs Patch

## Phoenix

{: class="two-column"}
```html
<%= link("home", to: "/") %>
```

{: class="two-column"}
```elixir
redirect(conn, to: "/")
```

## Phoenix LiveView

{: data-title="lib/my_app_web/live/home_live.html.leex" class="two-column"}
```html
<%= live_redirect "home", to:
  Routes.home_path(@socket, :index)
%>

<%= live_patch "home", to:
  Routes.home_path(@socket, :index)
%>
```

{: data-title="lib/my_app_web/live/home_live.ex" class="two-column"}
```elixir
{:noreply,
  push_redirect(socket, to: "/")
}

{:noreply,
  push_patch(socket, to: "/")
}
```

---

# Redirect vs Patch

## Redirect (another LiveView)

`mount/3` <code>&#8680;</code> `handle_params/3` <code>&#8680;</code> `render/1`

## Patch (same LiveView)

`handle_params/3` <code>&#8680;</code> `render/1`

---

# Let's make it more React

{: data-title="lib/my_app_web/live/home_live.html.leex" class="two-column"}
```html
<h1>Counted so far <%= @counter %></h1>

<button phx-click="count" phx-value-step="1">
  Add 1 more
</button>

<button phx-click="count" phx-value-step="2">
  Add 2 more
</button>

<button phx-click="count" phx-value-step="3">
  Add 3 more
</button>
```

{: data-title="lib/my_app_web/live/home_live.ex" class="two-column"}
```elixir
defmodule MyAppWeb.HomeLive do
  use MyAppWeb, :live_view

  def mount(_params, _session, socket) do
    socket |> assign(counter: 0) |> ok()
  end

  def handle_event("count", %{"step" => step}, socket) do
    counter = socket.assigns.counter + Integer.parse(step)

    socket |> assign(counter: counter) |> noreply()
  end

  defp ok(socket), do: {:ok, socket}
  defp noreply(socket), do: {:noreply, socket}
end
```

---

# LiveView Event Handlers

- State (socket.assigns) lives in the **backend** 😀
- HTML diff goes through the wire ⚡️
- Re-render happens automatically (React) ⚛️

---

# How to get Fresh Data?

## Polling

`Process.send_after(self(), :refresh, 1000)` <code>&#8680;</code> `defp handle_info(:refresh, socket) do`

## PubSub

`MyAppWeb.Endpoint.broadcast(@topic, @event, payload)`

`MyAppWeb.Endpoint.subscribe(@topic)` <code>&#8680;</code> `def handle_info(%{topic: t, event: e, payload: p}, socket) do`

---

# Being Lazy and Polling to Refresh

{: data-title="lib/my_app_web/live/home_live.ex"}
```elixir
defmodule MyAppWeb.HomeLive do
  use MyAppWeb, :live_view

  @refresh_interval 10000

  def mount(_params, _session, socket) do
    socket |> schedule_refresh() |> fetch_users() |> ok()
  end

  def handle_info(:refresh, socket) do
    socket |> schedule_refresh() |> fetch_users() |> noreply()
  end

  defp schedule_refresh(socket) do
    if connected?(socket) do
      Process.send_after(self(), :refresh, @refresh_interval)
    end
    socket
  end

  defp fetch_users(socket) do
    assign(socket, users: Accounts.get_users())
  end

  defp ok(socket), do: {:ok, socket}
  defp noreply(socket), do: {:noreply, socket}
end
```

---

# PubSub Not so Lazy Approach

{: data-title="lib/my_app_web/live/home_live.ex"}
```elixir
defmodule MyAppWeb.HomeLive do
  use MyAppWeb, :live_view

  @topic "counter"

  def mount(_params, _session, socket) do
    if connected?(socket), do: MyAppWeb.Endpoint.subscribe(@topic)
    socket |> fetch_users() |> ok()
  end

  def handle_event("count", %{"step" => step}, socket) do
    counter = socket.assigns.counter + Integer.parse(step)
    MyAppWeb.Endpoint.broadcast(@topic, "counter-update", counter)
    socket |> assign(counter: counter) |> noreply()
  end

  def handle_info(%{topic: @topic, event: "counter-update", payload: counter}, socket) do
    socket |> assign(counter: counter) |> noreply()
  end

  defp ok(socket), do: {:ok, socket}
  defp noreply(socket), do: {:noreply, socket}
end
```

---

# JS Integration

{: data-title="assets/js/app.js"}
```javascript
let liveSocket = new LiveSocket("/live", Socket, {
  hooks: {InfiniteScroll},
  params: {},
})
```

---

# JS Integration => JS event to Elixir

`js pushEvent` <code>&#8680;</code> `ex handle_event/3`

{: data-title="lib/my_app_web/live/home_live.html.leex"}
```html
<div id="infinite-scroll" phx-hook="InfiniteScroll" data-page="<%= @page %>">

</div>
```

{: data-title="assets/js/components/InfiniteScroll.js"}
```javascript
const InfiniteScroll = {
  page() { return this.el.dataset.page },
  mounted(){
    this.pending = this.page()
    window.addEventListener("scroll", e => {
      if(this.pending == this.page() && scrollAt() > 90){
        this.pending = this.page() + 1
        this.pushEvent("load-more", {})
      }
    })
  },
  updated(){ this.pending = this.page() }
}
```

---

# JS Integration => Elixir event to JS

`ex push_event` <code>&#8680;</code> `js handleEvent`

{: data-title="lib/my_app_web/live/home_live.html.leex"}
```html
<div id="chart" phx-hook="Chart">
```

{: data-title="lib/my_app_web/live/home_live.ex"}
```elixir
{:noreply, push_event(socket, "points", %{points: new_points})}
```

{: data-title="assets/js/components/Chart.js"}
```javascript
const Chart = {
  mounted(){
    this.handleEvent("points", ({points}) => MyChartLib.addPoints(points))
  }
}
```

---

# LiveView Cycle

![liveview-graph]

---

# More topics, NO Time

- reuse code with `LiveComponent`
  - LiveComponent lifecycle
- connection errors handling
- more DOM bindings
  - debounce / throttle
- more JS callbacks
- auth{entic,oriz}ation
- uploads
- DOM patching & Temporary Assigns

---

# Summary

- Blazing Fast ⚡️
- State is on the Server
- Integrates well with JS ⚛️
- Regular CSS / SCSS
- Very well suited for web development!!!

{% include markdown/acronyms.md %}

[liveview-graph]: /images/graphs/phoenix-liveview.dot.png 'LiveView Graph'
