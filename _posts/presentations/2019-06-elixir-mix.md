# Elixir Files
- Elixir script file => `foo.exs`
    * test files, mix task files
    * compiles and executes at the same time
- Elixir file => `foo.ex`
    * code, templates, etc
    * compiles to beam files
- Beam file => `./_build/dev/lib/my-proj/ebin/MyProject.beam`
    * executed by Erlang Beam (VM)
---
# Elixir basic tooling
- `elixir foo.exs` => compiles and executes script file
- `mix [task] [args]` => run a mix task
- `mix help` => show all mix tasks
- `mix help new` => documentation for `new` mix task
- `iex` => Elixir's interactive shell
- `iex -S mix` => load mix env and run iex shell
- `MIX_ENV=test mix compile` => compiles for test env
---
# Mix new project
```elixir
mix.exs
.formatter.exs
config/config.exs
config/{dev,test,prod}.exs
lib/my_project.ex
test/test_helper.exs
test/my_project_test.exs
```
---
# Phoenix new project
```elixir
priv/gettext  => I18n
priv/static   => fixtures
priv/repo/{structure.sql,seeds.exs}
assets/{package.json,webpack.config.js} => webpack (brunch old versions)
assets/{css,js,static,vendor}
lib/my_project_web/gettext.ex
lib/my_project_web/endpoint.ex  => configure router, sockets, etc
lib/my_project_web/router.ex    => routes through pipelines
lib/my_project_web/templates/home/index.html.eex   => same as ERB
lib/my_project_web/controllers/home_controller.ex
lib/my_project_web/views/home_view.ex              => decorator
lib/my_project_web/views/helpers/error.ex
lib/my_project_web/channels/user_socket.ex
lib/my_project_web/channels/user_channel.ex
test/test_helper.exs
test/support/data_case.ex     => db tests
test/support/channel_case.ex  => channel tests
test/support/conn_case.ex     => controller tests
```
