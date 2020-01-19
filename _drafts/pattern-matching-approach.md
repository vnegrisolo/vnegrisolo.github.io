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

- 2 new syntax elements: `->` and `<-`

---
## Exercise

- classifying a workout
- list of intervals
- find the workout mode/type

---
## Exercise v1

#### Input => list of:

- `%{type: "dist", value: 500}` => 500 meters
- `%{type: "time", value: 600}` => 10 min

#### Output:

| rule | mode |
| ---- | ---- |
| if all same type `dist` | `FixedDistSplits` |
| if all same type `time` | `FixedTimeSplits` |
| if any different | `VariableInterval` |

---
## Exercise v1

<h4 class="two-column">
  {% include svgs/elixir.svg %}
  Elixir
</h4>

<h4 class="two-column">
  {% include svgs/ruby.svg %}
  Ruby
</h4>

{: class="two-column"}
- recursion
- pattern matching
- guards

{: class="two-column"}
- enumerable methods
- temporary variables
- conditions

---
## Exercise v1

{: data-title="v1.ex" class="two-column"}
```elixir
{% include codes/talks/pattern-matching-approach/v1.ex %}
```

{: data-title="v1.rb" class="two-column"}
```ruby
{% include codes/talks/pattern-matching-approach/v1.rb %}
```

---
## Exercise v2

#### New Input => list of:

- `%{type: "dist", value: 500, rest: 30}` => 500 meters and rest for 30s
- `%{type: "time", value: 600, rest: 0}` => 10 min

#### New Output:

| rule | mode |
| ---- | ---- |
| if all same type `dist` and no `rest` | `FixedDistSplits` |
| if all same type `dist` and `rest` | `FixedDistInterval` |
| if all same type `time` and no `rest` | `FixedTimeSplits` |
| if all same type `time` and `rest` | `FixedTimeInterval` |
| if any different | `VariableInterval` |

---
## Exercise v2 diff

{: data-title="v2-diff.ex" class="two-column"}
```diff
{% include codes/talks/pattern-matching-approach/v2-diff.ex %}
```

{: data-title="v2-diff.rb" class="two-column"}
```diff
{% include codes/talks/pattern-matching-approach/v2-diff.rb %}
```

---
## Exercise v2

{: data-title="v2.ex" class="two-column"}
```elixir
{% include codes/talks/pattern-matching-approach/v2.ex %}
```

{: data-title="v2.rb" class="two-column"}
```ruby
{% include codes/talks/pattern-matching-approach/v2.rb %}
```

---
## Exercise v3

#### New Input => list of:

- `%{type: "dist", value: 500, rest: 30}` => 500 meters and rest for 30s
- `%{type: "time", value: 600, rest: 0}` => 10 min

#### New Output:

| rule | mode |
| ---- | ---- |
| if all same type `dist`, `value`[1] and no `rest` | `FixedDistSplits` |
| if all same type `dist`, `value`[1] and `rest`[2] | `FixedDistInterval` |
| if all same type `time`, `value`[1] and no `rest` | `FixedTimeSplits` |
| if all same type `time`, `value`[1] and `rest`[2] | `FixedTimeInterval` |
| if any different | `VariableInterval` |

1. last `value` could be smaller (chill out)
2. last `rest` could be smaller, possibly 0

---
## Exercise v3 diff

{: data-title="v3-diff.ex" class="two-column"}
```diff
{% include codes/talks/pattern-matching-approach/v3-diff.ex %}
```

{: data-title="v3-diff.rb" class="two-column"}
```diff
{% include codes/talks/pattern-matching-approach/v3-diff.rb %}
```

---
## Exercise v3

{: data-title="v3.ex" class="two-column"}
```elixir
{% include codes/talks/pattern-matching-approach/v3.ex %}
```

{: data-title="v3.rb" class="two-column"}
```ruby
{% include codes/talks/pattern-matching-approach/v3.rb %}
```

---

# Summary

- Elixir syntax might be a challenge
- recursion is not scary with PM
- pattern matching rules!

{% include markdown/acronyms.md %}
