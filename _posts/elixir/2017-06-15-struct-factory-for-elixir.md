---
layout: post
title:  "Struct Factory for Elixir"
date:   2017-06-15 12:00:00
last_modified_at: 2017-06-15 12:00:00
categories: elixir
---

How easy is to build a **Factory** solution for **Elixir** applications? In this post I share a simple **20ish lines-of-code** solution including its testing ✅. Check this out and start using factories for building data for tests and seed.

## The Goal

The main goal here is to build a Factory 🏭 system for structs on an Elixir app. For being in the same page, struct is just a "named" Map with pre-defined keys and default values. Back to the problem... The solution has to be **easy** to create, maintain and test. The idea behind factories is to reuse the same functions to build similar data, sort of building-blocks tool.

The first part of this is the factories definition, in other words how the data will be created. For that I'd like to have a separate module with all definitions my application will need. Let's use a lot of function **pattern match** here. Here is a simple example:

```elixir
defmodule Factories do
  def factory(Post), do: %Post{title: "Some Title"}
end
```

The following example I extracted for some tests I created for this, so we can clearly see how to `build` or `create` something, in this case a `Post` struct, and what it's being produced by that function:

```elixir
test "posts build/creation" do
  assert build(Post) == %Post{title: "Some Title"}
  assert build(Post, title: "New Title") == %Post{title: "New Title"}

  assert create(Post) == %Post{title: "Some Title", id: 99}
  assert create(Post, title: "New Title") == %Post{title: "New Title", id: 99}
end
```

There's no nice DSL here, just simple modules and functions. DSLs are great, I love them, but it also become painful to maintain very fast, so if you can avoid to build them.

It also comes with the power to override at calling time the attributes and values. So let's see the initial approach next.

## Build and Create

First things first: naming. 😓 Hard to come up with a good one, so I just called `ExFactory`, no judgements.

`ExFactory` comes with only 2 functions, for `build` and `create` a struct. The difference between is that the `create` function gets the return of `build` and insert into the `Repo`. I'm using `Ecto.Repo` but this could be easly changed to something else.

Another aspect to be highlighted is that the `Factories` definitions and `Repo` are both being **injected** for testing purposes, but I got a default to the implementations I'd like to use for real.

Both `build` and `create` functions receive the struct name and a list of attributes for **overriding** factory defaults.

Last detail to watch is the usage of the pipe operator `|>`. This operator fits really well on both methods because the main idea here is to build something and for every step change it to the next step. ❤️

{: data-path="test/support/ex_factory.ex"}
```elixir
defmodule MyApp.ExFactory do
  alias MyApp.{Repo,Factories}

  def create(name, attr_list \\ [], factories \\ Factories, repo \\ Repo) do
    name |> build(attr_list, factories) |> repo.insert!
  end

  def build(name, attr_list \\ [], factories \\ Factories) do
    name |> factories.factory |> struct(attr_list)
  end
end
```

Testing this module was as simple to code as `ExFactory` module. I'd like to **isolate** this test from real application modules, so I created some **dummy modules** for that 🕶. Using these dummy modules by just 💉 **injecting** them to the real implementation is a great way to keep tests simple in functional programming and does not requires any external tool for mocking, stubbing, etc. The last point here was to delegate `build` and `create` from the test module to `ExFactory` in order to add the new dummy modules for `Factories` and `Repo`.

{: data-path="test/ex_factory/ex_factory_test.exs"}
```elixir
defmodule MyApp.ExFactoryTest do
  use ExUnit.Case, async: true
  alias MyApp.ExFactory

  defmodule Post do
    defstruct id: nil, title: nil
  end
  defmodule Repo do
    def insert!(model), do: struct(model, id: 99)
  end
  defmodule Factories do
    def factory(Post), do: %Post{title: "Some Title"}
  end

  def build(name, attrs \\ []), do: ExFactory.build(name, attrs, Factories)
  def create(name, attrs \\ []), do: ExFactory.create(name, attrs, Factories, Repo)

  doctest MyApp.ExFactory

  describe "build/2 create/2" do
    test "posts build and creation" do
      assert build(Post) == %Post{title: "Some Title"}
      assert build(Post, title: "New Title") == %Post{title: "New Title"}

      assert create(Post) == %Post{title: "Some Title", id: 99}
      assert create(Post, title: "New Title") == %Post{title: "New Title", id: 99}
    end
  end
end
```

All tests are joint under the same `describe` and `test` because I want to make this post as short as I can, but I usually keep each assertion on its own `test` definition.

A bonus here is the fact that `doctest MyApp.ExFactory` are defined just after the dummy classes, so you can use them on your executable examples. 😍

## Traits for DRY factories

So far so good, but I want a **building-blocks** system to reuse pieces, and maybe share them across different types of struct. To keep `Factories` definitions DRY I decided to go with **traits**. Traits are **atoms** that the developer could use to override a bunch of attributes in a single shot. This feature is very useful when defining associations, or a bunch of attributes and in some way relate to each other. It's common to have a database table with a column called `status`, and based on its value it's expected to have another fields. For example we could define a trait `:rejected` that could be mapped to: `%{status: :rejected, reason: "Not affordable"}`.

This time I'll start with the tests, and for now on I'm showing just the bits that have changed so far.

{: data-path="test/ex_factory/ex_factory_test.exs"}
```elixir
defmodule MyApp.ExFactoryTest do

  ...

  defmodule User do
    defstruct id: nil, age: nil
  end
  defmodule Post do
    defstruct id: nil, title: nil, user: nil
  end

  ...

  defmodule Factories do
    import MyApp.ExFactory

    def trait(:with_user), do: %{user: build(User, [], Factories)}

    def factory(User), do: %User{age: 25}
    def factory(Post), do: %Post{title: "Some Title"}
  end

  ...

  describe "build/2 create/2" do

    ...

    test "posts build and creation with traits" do
      assert %Post{
        title: "New Title",
        user: %User{
          age: 25
        }
      } = build(Post, [:with_user, title: "New Title"])
      assert %Post{
        id: 99,
        title: "Some Title",
        user: %User{
          age: 25
        }
      } = create(Post, [:with_user])
    end
  end
end
```

Note that at this point traits and attributes are mixed all together in the same List. And that's fine. It keeps the function signature simple and with `Enum.split_with/2` it can be split. Here is the new code:

{: data-path="test/support/ex_factory.ex"}
```elixir
defmodule MyApp.ExFactory do

  ...

  def build(name, attr_list \\ [], factories \\ Factories) do
    {traits, attrs} = Enum.split_with(attr_list, &is_atom/1)
    trait_attrs = Enum.flat_map(traits, &factories.trait/1)

    name
    |> factories.factory
    |> struct(trait_attrs)
    |> struct(attrs)
  end
end
```

The order here is important to define the behavior of `ExFactory` on override same attributes. For instance traits will override factories definition and attributes will override the previous ones.

## Sequence for uniqueness

`ExFactory` is already very useful, but databases uniqueness indexes could become a boring problem to be solved by the developer. To solve that I decided to add a **sequence** feature.

To do that I used the amazing sugar syntax of function captures. This might not be very readable at first glance, but as soon as you get used with that you'll love it. We can use factory or trait definition such as: `&"example_#{&1}@mail.com"`. This is a function that receives an integer as `&1` first argument and interpolates it with the rest of the string. This `&"..."` just means that we are creating an anonymous function that returns a string.

Starting with the tests again notice that I used the `=~` operator to match the generated email. Now the order of tests execution and parallelism will change the produced result.

{: data-path="test/ex_factory/ex_factory_test.exs"}
```elixir
defmodule MyApp.ExFactoryTest do

  ...

  defmodule User do
    defstruct id: nil, email: nil, age: nil
  end

  ...

  defmodule Factories do
    import MyApp.ExFactory

    def trait(:with_user), do: %{user: build(User, [], Factories)}

    def factory(User), do: %User{email: &"example_#{&1}@mail.com", age: 25}
    def factory(Post), do: %Post{title: "Some Title"}
  end

  ...

  describe "build/2 create/2" do

      ...

    test "posts build and creation with sequence" do
      assert %User{email: email, age: 25} = build(User)
      assert email =~ ~r/example_\d+@mail\.com/

      assert build(User, email: "foo@bar.com") == %User{email: "foo@bar.com", age: 25}

      assert %User{email: email, age: 25, id: 99} = create(User)
      assert email =~ ~r/example_\d+@mail\.com/

      assert create(User, email: "foo@bar.com") == %User{email: "foo@bar.com", age: 25, id: 99}
    end
  end
end
```

The implementation of this feature is the last step in the build pipeline. It is basically filter attributes where the value is a function and apply it with an auto-incremented integer.

{: data-path="test/support/ex_factory.ex"}
```elixir
defmodule MyApp.ExFactory do

  ...

  def build(name, attr_list \\ [], factories \\ Factories) do
    {traits, attrs} = Enum.split_with(attr_list, &is_atom/1)
    trait_attrs = Enum.flat_map(traits, &factories.trait/1)

    name
    |> factories.factory
    |> struct(trait_attrs)
    |> struct(attrs)
    |> apply_sequences
  end

  defp apply_sequences(model) do
    attrs = model
            |> Map.from_struct
            |> Enum.filter(fn({_k, v}) -> is_function(v) end)
            |> Enum.map(fn({k, v}) -> {k, v.(next_int())} end)

    struct(model, attrs)
  end

  def start_link(), do: Agent.start_link(fn -> 1 end, name: __MODULE__)
  defp next_int(), do: Agent.get_and_update(__MODULE__, &{&1, &1 + 1})
end
```

Elixir is a functional programming, so there is no object holding a state for you. The resolution was actually an opportunity to use the module `Agent` 👀. I just needed to implement `start_link` and call it from `test/test_helper.exs`. Also I have `next_int` but that's the sequence implementation.

{: data-path="test/test_helper.exs"}
```elixir
MyApp.ExFactory.start_link()
```

## Wrapping Up

Here it is a simple `Factories` example for your app. Same structure as the one used as a dummy class for the `ExFactory` tests.

{: data-path="test/support/factories.ex"}
```elixir
defmodule MyApp.Factories do
  import MyApp.ExFactory
  alias MyApp.Blog

  def trait(:with_user), do: %{user: build(Blog.User)}

  def factory(Blog.User) do
    %Blog.User{
      email: &"example_#{&1}@mail.com"
    }
  end
  def factory(Blog.Post) do
    %Blog.Post{
      slug: "some slug",
      title: "some title",
      description: "some description",
      published_at: ~D[2010-04-17]
    }
  end
end
```

🎉🎉🎉 Finally `ExFactory` module with `@spec`s and `@doc`s.

{: data-path="test/support/ex_factory.ex"}
```elixir
defmodule MyApp.ExFactory do
  alias MyApp.{Repo,Factories}

  @doc """
  Creates a struct based on factories definition and save it on repo.

  ## Examples

      iex> create(Post)
      %Post{id: 99, title: "Some Title"}

      iex> create(Post, title: "New Title")
      %Post{id: 99, title: "New Title"}
  """
  @spec create(String.t, list(atom | {atom, any})) :: Struct.t
  def create(name, attr_list \\ [], factories \\ Factories, repo \\ Repo) do
    name |> build(attr_list, factories) |> repo.insert!
  end

  @doc """
  Builds a struct based on factories definition.

  ## Examples

      iex> build(Post)
      %Post{title: "Some Title"}

      iex> build(Post, title: "New Title")
      %Post{title: "New Title"}
  """
  @spec build(String.t, list(atom | {atom, any})) :: Struct.t
  def build(name, attr_list \\ [], factories \\ Factories) do
    {traits, attrs} = Enum.split_with(attr_list, &is_atom/1)
    trait_attrs = Enum.flat_map(traits, &factories.trait/1)

    name
    |> factories.factory
    |> struct(trait_attrs)
    |> struct(attrs)
    |> apply_sequences
  end

  defp apply_sequences(model) do
    attrs = model
            |> Map.from_struct
            |> Enum.filter(fn({_k, v}) -> is_function(v) end)
            |> Enum.map(fn({k, v}) -> {k, v.(next_int())} end)

    struct(model, attrs)
  end

  def start_link(), do: Agent.start_link(fn -> 1 end, name: __MODULE__)
  defp next_int(), do: Agent.get_and_update(__MODULE__, &{&1, &1 + 1})
end
```

Remember you can import `build` and `create` functions into your test cases modules as this is the kind of function to be used very often in the tests.

{: data-path="test/support/data_case.ex"}
```elixir
defmodule SharingCode.DataCase do

  ...

  using do
    quote do
      ...

      import SharingCode.ExFactory
    end
  end

  ...

end
```

## Conclusion

`ExFactory` leverages Elixir syntax in favor of building great solutions yet very simple. It's notable that we can build meaningful functionalities without to have to build DSLs for that or had to add another dependency to your code. This means more control and customizability for the application. There's no meta-programming, just a bunch of **pattern matching**, **pipe operator** and **function captures**.

I hope you enjoyed the reading as I enjoyed all the process of learning and sharing all of these. 👍

{% include markdown/acronyms.md %}
{% include markdown/links.md %}
{% include markdown/images.md %}
