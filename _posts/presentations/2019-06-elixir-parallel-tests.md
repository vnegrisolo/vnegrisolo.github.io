# Parallel Feature Tests in Elixir

- elixir
- react
- websocket
- ecto
---
# Timing sample

- 12 feature sequential tests => 8.9 seconds
- 12 feature parallel tests => 4.7 seconds
- 150 property + 130 unit + 12 feature parallel => 5.3 seconds
---
# Feature test

```elixir
 1 defmodule WalletexWeb.Features.AuthenticationTest do
 2   use WalletexWeb.FeatureCase, async: true
 4   import Wallaby.Query, only: [css: 1, link: 1]
 7
 8   describe "when the user is authenticates on Google Mock" do
 9     test "authenticates", %{session: session, conn: conn} do
10       user = insert!(User, email_verified: true)
11
12       session =
13         session
14         |> visit(Routes.home_path(conn, :index, user_id: user.id))
15         |> click(link("Sign in"))
16         |> click(link("Google Mock"))
17
18       assert "Successfully authenticated." in texts_by(session, css(".alert-info"))
19     end
20   end
```
---
# FeatureCase support

```elixir
 1 defmodule WalletexWeb.FeatureCase do
 4   use ExUnit.CaseTemplate
 5   ...
 6   using do
 7     quote do
 8       ...
17       setup [:ecto_sandbox_setup, :build_conn_setup, :build_session_setup]
18     end
19   end
20 end
```
---
# Ecto sandbox setup

```elixir
 9 def ecto_sandbox_setup(%{async: async}) do
10   :ok = Ecto.Adapters.SQL.Sandbox.checkout(Walletex.Repo)
11
12   unless async do
13     Ecto.Adapters.SQL.Sandbox.mode(Walletex.Repo, {:shared, self()})
14   end
15
16   :ok
17 end
```
---
# Wallaby session setup

```elixir
15 def build_session_setup(_context) do
16   metadata = Phoenix.Ecto.SQL.Sandbox.metadata_for(Walletex.Repo, self())
17   {:ok, session} = Wallaby.start_session(metadata: metadata)
18   [session: session]
19 end
```

- `self()` returns the current PID
---
# So far so good

just follow the README so far

---
# The hack starts when JS comes to play

- async js call to fetch data
- Wallaby can't do their trick

---
# Let the 4 steps hack

---
# Custom plug for assigning `ecto sandbox pid`

```elixir
 1 defmodule WalletexWeb.Plug.AssignEctoSandboxPid do
 4   import Plug.Conn, only: [assign: 3]
 5
 6   def init([]), do: :ok
 7
 8   def call(%{owner: pid} = conn, _opts) when pid != nil do
 9     assign(conn, :ecto_sandbox_pid, Walletex.Process.serialize(pid))
10   end
11
12   def call(conn, _opts), do: conn
13 end
```
---
# Store ecto sandbox pid on window

```html
23 <script>
24   <%= if assigns[:user_token] do %>
25     window.userToken = "<%= assigns[:user_token] %>";
26   <% end %>
27   <%= if assigns[:ecto_sandbox_pid] do %>
28     window.ecto_sandbox_pid = "<%= assigns[:ecto_sandbox_pid] %>";
29   <% end %>
30 </script>
```
---
# JS connect to websocket

```javascript
1 import { Socket } from "phoenix";
4
5 const token = window.userToken;
6 const ecto_sandbox_pid = window.ecto_sandbox_pid;
8 let UserChannel = undefined;
9
10 if (token) {
11   const UserSocket = new Socket("/user-socket", {
12     params: {
13       token: token,
14       ecto_sandbox_pid: ecto_sandbox_pid
15     }
16   })
17   UserSocket.connect();
18
19   UserChannel = UserSocket.channel("user:lobby", {});
20   UserChannel.join()
21     .receive("ok", (resp) => {
22       // console.log("Joined successfully", resp);
23     })
24     .receive("error", (resp) => {
25       // console.log("Unable to join", resp);
26     });
27 };
28
29 export default UserChannel;
```
---
# Async js call to the app

```javascript
1 import React, { useState, useEffect } from "react"
2 import API from "../api"
3 import Loading from "../components/loading.jsx"
4
5 export default function LedgerIndex() {
6   const [ledgers, setLedgers] = useState()
7
8   useEffect(() => {
9     const timeout = 10000
10     API.UserChannel.push("list-ledgers", {}, timeout)
11       .receive("ok", (response) => {
12         // console.log("socket", "ok", response)
13         setLedgers(response.ledgers)
14       })
15       .receive("error", (reasons) => {
16         // console.log("socket", "error", reasons)
17       })
18       .receive("timeout", () => {
19         // console.log("socket", "timeout")
20       })
21   }, [])
```
---
# Lastly but not least

```elixir
1  defmodule WalletexWeb.UserSocket do
2    use Phoenix.Socket
8    channel "user:*", WalletexWeb.UserChannel
9
15   def connect(%{"token" => token} = params, socket, _connect_info) do
16     socket =
17       socket
18       |> maybe_assign_ecto_sandbox_pid(params)
19       |> maybe_allow_sandbox()
20     ...
21   end
22
36   if Walletex.env() == :test do
37     def maybe_allow_sandbox(%{assigns: %{ecto_sandbox_pid: pid}} = socket) when pid != nil do
39       Ecto.Adapters.SQL.Sandbox.allow(Walletex.Repo, pid, self())
40       socket
41     end
42   end
44   def maybe_allow_sandbox(socket), do: socket
45
46   if Walletex.env() == :test do
47     defp maybe_assign_ecto_sandbox_pid(socket, %{"ecto_sandbox_pid" => pid}) when pid != nil do
49       assign(socket, :ecto_sandbox_pid, Walletex.Process.deserialize(pid))
50     end
51   end
53   defp maybe_assign_ecto_sandbox_pid(socket, _params), do: socket
54 end
```
---
## And in the end

The coffee you take

Is equal to the code you make
