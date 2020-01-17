---
layout: talk
title: "The Pattern Matching Approach"
categories: Talks
tags: Elixir Ruby
---

How pattern matching affects coding in Elixir? Let's talk about Elixir pattern matching and how this would change the way we solve problems.

---
## What is Pattern Matching?

- **destructured assignment**
- **validation** by raises `MatchError`
- right to left <=

---
## Example

- **destructured assignment**
- **validation** by raises `MatchError`
- right to left <=

{: data-title=":ok" class="two-column"}
```elixir
user = %User{id: 1}
result = {:ok, user}

{:ok, %{id: id}} = result

id
#=> 1
```

{: data-title="MatchError" class="two-column"}
```elixir
user = %User{id: 1}
result = {:ok, user}

{:error, message} = result
#=> ERROR** (MatchError)
#=>   no match of right hand side value:
#=>   {:ok, %{id: 1}}
```

---
## More Examples

{: data-title=":ok" class="two-column"}
```elixir
# Map
%{} = %{key: :value}

# Struct
%{id: 1} = %User{id: 1}

# Tuple
{:ok, _} = {:ok, "Processed"}

# List
[:apple | _rest] = [:apple, :pear]

# Order matters
%{k1: 1, k2: 2} = %{k2: 2, k1: 1}
```

{: data-title="MatchError" class="two-column"}
```elixir
# Map
%{key: :value} = %{}

# Struct
%User{id: 1} = %{id: 1}

# Tuple
{:ok} = {:ok, "Processed"}

# List
[:pear | _rest] = [:apple, :pear]

# Order matters
[:pear, :apple] = [:apple, :pear]
```

---
## Check against variables

- default to **assign**
- `^` the pin operator

{: data-title="assigning" class="two-column"}
```elixir
%{id: user_id} = %User{id: 1}
user_id #=> 1
```

{: data-title="pin operator" class="two-column"}
```elixir
user_id = 1
%{id: ^user_id} = %User{id: 1}
```

---
## Pin operator take aways

- complicates syntax `^`
- NO pin for nested `^user.id` => `CompileError`
- allow error swallowing

{: data-title="pin on nested" class="two-column"}
```elixir
user = %{id: 6}
%{id: ^user.id} = %User{id: 6}
#=> ERROR** (CompileError)
#=>   invalid argument for unary operator ^,
#=>   expected an existing variable, got: ^user.id()
```

{: data-title="error swallowing" class="two-column"}
```elixir
user_id = 5
%{id: user_id} = %User{id: 1}

user_id
#=> 1
```

---
## Where to use Pattern Matching?

{: data-title="equal" class="two-column"}
```elixir
%{id: _} = %User{id: 1}

#=> could raise MatchError
```

{: data-title="def" class="two-column"}
```elixir
def valid?(%{id: nil}), do: :error
def valid?(_), do: :ok
#=> could raise FunctionClauseError
```

{: data-title="case" class="two-column"}
```elixir
case %User{id: 1} do
  %{id: _} -> :ok
  {:some_error} -> :error
end

#=> could raise CaseClauseError


```

{: data-title="with" class="two-column"}
```elixir
with %{id: user_id} = %{id: 5},
     %{id: _} <- %{id: user_id} do
    :ok
  else
    {:some_error} -> :error
end
#=> could raise MatchError
#=> could raise WithClauseError
```

---
## Exercise

- classifying a workout
- list of intervals
- find the workout mode/type

---
## Exercise v1

#### Input => list of:

- `%{type: "time", value: 600}` => 10 min
- `%{type: "dist", value: 500}` => 500 meters

#### Output:

| rule | mode |
| ---- | ---- |
| if all types are `time` | `FixedTimeSplits` |
| if all types are `dist` | `FixedDistSplits` |
| if any different | `VariableInterval` |

---
## Exercise v1

{: class="two-column"}
### Elixir

{: class="two-column"}
### Ruby

{: class="two-column"}
- recursion
- pattern matching

{: class="two-column"}
- enumerable methods
- guards / ifs

---
## Exercise v1

{: data-title="v1.ex" class="two-column"}
```elixir
defmodule ErgZone.WorkoutMode do
  def run([
    %{type: t} | [
      %{type: t} | _
    ] = tail
  ]) do
    run(tail)
  end

  def run([%{type: "dist"}]) do
    "FixedDistSplits"
  end

  def run([%{type: "time"}]) do
    "FixedTimeSplits"
  end

  def run(_intervals) do
    "VariableInterval"
  end
end
```

{: data-title="v1.rb" class="two-column"}
```ruby
class ErgZone::WorkoutMode do
  def self.run(intervals)
    all_types = intervals.map(&:type)
    uniq_types = all_types.uniq

    if uniq_types.size > 1
      return "VariableInterval"
    end

    case uniq_types[0]
      when "dist" then "FixedDistSplits"
      when "time" then "FixedTimeSplits"
    end
  end
end
```

{% include markdown/acronyms.md %}
