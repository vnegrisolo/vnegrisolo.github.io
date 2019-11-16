# Elixir Basic Types
```elixir
1      # integer

0b1010 # integer, binary => 10

0x1F   # integer, hex => 31

0o777  # integer, octal => 511

1.0    # float

true   # boolean

:atom  # atom => special memory section
```
---
# Elixir Compound Types
```elixir
iex> {1, 2, 3}            # tuple
iex> {:ok, response}      # tuple

iex> "elixir"             # string
iex> <<102, 111, 111, 0>> # binary
iex> "foo" <> <<0>>       # <<102, 111, 111, 0>>

iex> [1, 2, 3]            # list
iex> [foo: 5, bar: 4]     # keywordlist
iex> 'hello'              # charlist
iex> [0|'foo']            # [0, 102, 111, 111]

iex> %{foo: "bar"}        # Map
iex> %User{name: "foo"}   # struct => Map with :__struct__
iex> 1..3                 # range
iex> ~D[2019-05-25]       # Date sigil
```
---
# Basic "operators"
https://hexdocs.pm/elixir/Kernel.html
```elixir
iex> 1 + 2
3
iex> 5 * 5
25
iex> 10 / 2
5.0
iex> div(10, 2)
5
iex> div 10, 2
5
iex> rem 10, 3
1
```
---
# Elixir Organization
- Elixir - standard library
- EEx - templating library
- ExUnit - unit test library
- IEx - interactive shell
- Logger - built-in Logger
- Mix - build tool
---
# Support services
- https://hex.pm/
- https://hexdocs.pm/
