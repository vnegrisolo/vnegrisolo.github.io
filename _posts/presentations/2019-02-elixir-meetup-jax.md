# Title

## Title 2

The very first year working on a full time Elixir job can be challenging.
Libraries are new, syntax is new, the way to code is new.
On this talk Vinny will share his experience on his first Elixir job
and how he could get up to the speed by testing better.

![LGO](../slidify/images/logo-128.png)

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| **col 3 is**  | right-aligned | $1600 |
| col 2 is      | *centered*    |   $12 |
| zebra stripes | ~~are neat~~  |    $1 |

after table

> Hello World!

Here's an idea: why don't we take `SuperiorProject` and turn it into `**Reasonable**Project`.

```elixir
x = 0
x = 2 + 2
what is x
```

task

- [x] checked list item
- [ ] unchecked list item

list

* Item
+ Item
- Item

---
# Test to be Fast :zap:
## How to Get Productive in Elixir

<!--
Thank you all for coming.
On this talk I’d like to share some of the experience I got from my first Elixir job
and I’ll focus on the most important thing for me on this job for getting up to speed,
and that’s testing.
-->

---
# Who am I

Vinicius Negrisolo || Vinny

https://github.com/vnegrisolo

Java |> Ruby |> Elixir

<!--
That's my name and the English version of it.
My github profile
And I put here some big moves in terms of coding languages I've done
Just to show what's my background.
So from 2 object oriented languages
Java and Ruby
To my first functional one => Elixir
This was a pretty big deal for me
-->

---
# The Dream

- Functional
- Immutability
- Compiled
- Performance
- Pattern Matching
- Fault Tolerance
- Concurrent
- Simpler than OO
- ...

<!--
So about 3y ago Micah sold me the Elixir dream.
He was not the 1st one, but he was by far the most passionate about it.
So if I am here talking about that it's because of him. Thank you man!
All these features seemed to be very nice for me at that moment
And combined it seemed to me that it would be way simpler to code.
So I decided to invest my time on that.
-->

---
# The Saga begins

Documentation / Tutorials

Blog posts (Elixir Radar / ElixirWeekly)

Meetups

Conferences

Small apps and libraries

<!--
Besides regular documentation and tutorials
I started reading loads of blog posts
I attended to meetups and conferences
I wrote some small apps and libraries
And eventually I got confident enough to start a full time elixir job.
-->

---
# The Job

Chat && Order

Restaurant |> Suppliers

<!--
So I applied for a job in London
On a small startup that was using elixir for the backend.
It was a chat App with some ordering features
So restaurants could talk directly to their suppliers and make orders.
-->

---
# Tech Overview

- 2.5 yo production app
- single git repo
- umbrella app (≈15)
- distillery releases (≈4)
- CI with auto deploy
- docker containers
- 3x AWS medium size

<!--
That's just an overview of what we had
And that's just for the Elixir part of the project, the backend team.
[READ ^^^]
-->

---
# Team Velocity

- backend team is slow
- witch hunt

<!--
Shortly after joining the company I started to hear that the backend team was slow.
Totally unfair but it doesn't matter.
We had to change that perception.
-->

---
# Test Feedback Cycle

- defines development speed
- :zap: fast
- :white_check_mark: reliable

<!--
On my humble opinion the team velocity is very related to the test efficiency.
So if you have a fast and reliable test suite your team will be more confident, hence more productive
It's not about test all the possible things but smart.
-->

---
# Test Situation

- test suite
  - brittle / intermittent / gaps
  - 11 min to run / all sequential
- manual tests on staging
- Continuous Integration
  - rerun if test fails? really?

<!--
And as you can imagine the situation was pretty bad.
We had a brittle and flakey test suite with loads of not covered code.
It also took about 11 min to finish what's a lot for this type of project.
And as the result we overused the staging environment.
We deployed there every little change and we asked for help to the Q&A team.
CI was not practical as well.
-->

---
# How to revert this scenario?

- test
  - remove brittleness
  - fill the gaps
  - speed and paralelism

<!--
I've seen this situation to happen in several projects, other languages.
This situation was not new to me, but Elixir was.
So let's go over some topics and see how we can solve them with Elixir.
-->

---
# Test data {.big}

A Big Win!

---
# Test data - Situation

- module attrs with fixed values
- setup to build data
- attrs, setup and assertions were far apart

<!--
The first aspect I want to talk about testing in general is the data used on testing.
Module attributes on every test file to populate all fields imaginable.
The very most of them has nothing to do at all with what's been tested.
As producing data was too verbose they were also using setup to save all that data.
So in the end attributes, the setup and the test assertions were too far apart.
It was hard to maintain.
-->

---
# Test data - Code Situation

```elixir
@attrs %{
  email: "user@mail.com",
  full_name: "Billy Bob",
  age: 30,
  gender: :male
}

setup do
  user = @attrs |> User.new() |> Repo.insert!()
  [user: user]
end

test "do something", %{user: user} do
  ...
  assert page.user_full_name == user.full_name
end
```

---
# Test data - Factory

- Keep it simple
- A single factory definition per schema
- Random data all the time
- Build all regular attributes
- Build all belongs_to relation
- Everything else defined on tests

<!--
That's not new, just another factory system being used on a project.
We kept rules strict and simple.
So a single definition per schema. We don't need more.
Random data for all fields.
We don't want developer to trust hard coded values on factories.
We generated all regular fields and also all belongs_to relations.
Has one and has many were out of factory definitions.
-->

---
# Test data - Factory Sample

```elixir
defmodule Factory do
  use MapBot

  def new(User) do
    %User{
      email: &"#{&1}_#{Faker.Internet.email()}",
      full_name: Faker.Name.name(),
      age: 15 + :rand.uniform(100),
      gender: Enum.random(~w(male female)a)
    }
  end
end
```

{.column}

```elixir
# usage
user = Factory.build(User, age: 17)
%User{} = Factory.insert!(User, age: 21)
```

---
# Test data - Factory Benefits

- no database cycles
- no need to open factory definitions
- no assertions on hardcoded factory values
- schema changes <=> factory changes
- new test scenarios <=> no factory changes

<!--
The Factory System was a big win for us.
Very cheap to implement, it reduced the noise on test files, reduced the time to build a test in general.
Here are some benefits we can get from our implementation with all that strict rules I mentioned.
[READ ^^^]
-->

---
# Unit Testing {.big}

---
# Unit Testing

- single level of describe
- describe/test/assert/refute
- async false by default
- async by test file

<!--
Elixir is functional so testing is way simpler in general.
Here are some qualities of unit testing in Elixir.
There is no nested describe levels, just a single one.
The main functions used are describe/test/assert and refute.
Async is turned off by default so please put some effort trying to make it parallel.
And just remember that async is by file.
-->

---
# Unit Testing

```elixir
defmodule MyApp.Ecto.NormalizerTest do
  use ExUnit.Case, async: true
  alias MyApp.Ecto.Normalizer

  describe "trim/2" do
    test "trims a valid changeset for single atom" do
      attrs = %{name: " Bob ", email: "bob@mail.com"}
      changeset = attrs |> changeset() |> Normalizer.trim(:name)

      assert changeset.changes.name == "Bob"
    end
  end

  defp changeset(attrs) do
    ...
  end
end
```

---
# Unit Testing - Pattern Matching

- flip the assertion
- add/remove the pin

<!--
Pattern match is really important in Elixir and we use it for test assertions as well.
The message on error is not the best as assert equals but it's very convenient to use that.
Just keep in mind these assertion flips.
Add/remove the pin as well.
Let's see some examples.
-->

---
# Unit Testing - Pattern Matching

```elixir
assert changeset.changes.name == "Bob"
```

```elixir
assert changeset.changes.name == full_name
```

```elixir
assert changeset.changes.name == user.name
```

{.column}

```elixir
assert %{name: "Bob"} = changeset.changes
```

```elixir
assert %{name: ^full_name} = changeset.changes
```

```elixir
name = user.name
assert %{name: ^name} = changeset.changes
```

---
# Unit Testing - Data Table

- controlled input/output
- scale up tests

<!--
I personally love data table tests.
We control input and output for each test.
I like to use this approach on functions that manipulate strings or numbers and other simple cases.
Let's see an example
-->

---
# Unit Testing - Data Table

```elixir
defmodule MyApp.Ecto.Type.MoneyTest do
  use ExUnit.Case, async: true
  alias MyApp.Ecto.Type.Money

  @cast_data [
    {nil, {:ok, nil}},
    {"314", {:ok, 314.00}},
    {"314.59", {:ok, 314.59}},
    {314, {:ok, 314.00}},
    {314.59, {:ok, 314.59}}
  ]

  describe "cast/1" do
    for {value, expected} <- @cast_data do
      @value value
      @expected expected

      test "casts '#{inspect(@value)}'" do
        assert Money.cast(@value) == @expected
      end
    end
  end
end
```

---
# Unit Testing - Properties

- inputs are random and abundant
- catches some unthinkable edge cases

<!--
This type of test I found a bit harder to find very good cases to work with.
In some cases that I used I liked to add it not as a replacement but as an addition to other tests
To be honest I liked to learn about that but I am not very excited about property tests anymore.
-->

---
# Unit Testing - Properties

```elixir
defmodule MyApp.Ecto.Type.MoneyTest do
  use ExUnit.Case, async: true
  use ExUnitProperties
  alias MyApp.Ecto.Type.Money

  describe "cast/1, dump/1 and load/1" do
    property "cast/1, dump/1, load/1 binary dollars+cents" do
      check all dollars <- integer(),
                cents <- 0..99 |> integer() do
        value = "#{dollars}.#{cents}"
        {expected, ""} = Float.parse(value)

        assert {:ok, value} = Money.cast(value)
        assert {:ok, value} = Money.dump(value)
        assert Money.load(value) == {:ok, expected}
      end
    end
  end
end
```

---
# Special Test Cases {.big}

## Controller / WebSocket / Feature

<!--
If you are using phoenix there's a chance you'll get to test:
Controller/WebSocket or the user interface through a feature test.
I am going to present a simple example of each
to show how simple they are and how similar to regular unit tests.
-->

---
# Controller Testing {.big}

---
# Controller Testing

- `use MyAppWeb.ConnCase`
- exposes `Plug.Conn`
- http request/response

<!--
It uses a special ExUnit.Case called ConnCase and exposes a Plug.Conn struct.
We have to use the Plug.Conn struct to get the request/response.
-->

---
# Controller Testing

```elixir
defmodule MyAppWeb.PostControllerTest do
  use MyAppWeb.ConnCase, async: true

  describe "show/2 when the user is authenticated" do
    setup [:authenticated_conn_setup]

    test "renders show page", %{conn: conn, current_user: user} do
      post = insert!(Post, user: user)
      conn = get(conn, Routes.post_path(conn, :show, post))

      assert response = html_response(conn, 200)
      assert response =~ "Post"
    end
  end
end
```

---
# WebSocket Testing {.big}

---
# WebSocket Testing

- `use MyAppWeb.ChannelCase`
- exposes `Phoenix.Socket`
- channel join/push/reply/broadcast
- joined channels runs on new pids
- ecto sandbox allow for async

<!--
It uses ChannelCase that exposes a Phoenix.Socket struct.
And we use Phoenix.Socket to join the channel, to push/reply and broadcast messages.
The joined channel under test runs on different pids,
So you need to allow Ecto sandbox if you are using ecto.
-->

---
# WebSocket Testing

```elixir
defmodule MyAppWeb.UserChannelTest do
  use MyAppWeb.ChannelCase, async: true

  describe "handle_in/3 for list-posts when joined on user:lobby" do
    setup [:authenticated_user_socket_setup, :join_user_lobby_setup]

    test "returns all user posts", %{socket: socket, current_user: user} do
      post = insert!(Post, user: user)
      ref = push(socket, "list-posts")

      assert_reply(ref, :ok, response, 500)
      assert response == %{posts: [%{name: post.name}]}
    end
  end

  def join_user_lobby_setup(%{socket: socket}) do
    {:ok, _reply, socket} = subscribe_and_join(socket, UserChannel, "user:lobby")
    Ecto.Adapters.SQL.Sandbox.allow(MyApp.Repo, self(), socket.channel_pid)
    [socket: socket]
  end
end
```

---
# Feature Testing {.big}

---
# Feature Testing

- covers all the layers
- slower, but not slow
- can be parallel
- `wallaby` / `hound`

<!--
Feature tests usually cover a lot of things.
From js to models. So it's worth it.
They are usually the slowest test but that's Elixir, so they are not slow.
These tests can run in parallel for speed,
So if you use javascript to interact with the app you may need to do some extra work to set ecto sandbox properly.
Both wallaby and hound are great libraries.
-->

---
# Feature Testing

```elixir
defmodule MyAppWeb.Features.PostTest do
  use MyAppWeb.FeatureCase, async: true
  import Wallaby.Query, only: [css: 1, link: 1]

  describe "when the user is authenticated" do
    setup [:authenticated_session_setup]

    test "posts page", %{session: session, current_user: user} do
      post = insert!(Post, user: user)
      session = visit(session, "/posts")

      assert "Posts" in texts_by(session, css("h1"))
      assert "Name" in texts_by(session, css("table th"))
      assert post.name in texts_by(session, css("table td"))

      session = click(session, link(post.name))

      assert current_path(session) == "/posts/#{post.id}"
    end
  end
end
```

---
# Solid and Fast Test suite

- Developers run locally
- faster feedback cycle
- oftener and smaller deploys
- easier to manage deploys
- less bugs
- builds your confidence

<!--
In the end we got really good results in terms of project maintainability.
After a lot of effort to improve our test suite and CI we got a better situation in the team.
We were deploying more features and more frequently.
The message I want to pass is =>
-->

---
# Don't underestimate how tests can help us {.big}

## Test to be Fast :zap:

---
# Thanks! / Questions?
