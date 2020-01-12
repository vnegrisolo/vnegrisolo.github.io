---
layout: post
title: "Ruby OptionParser"
date: 2016-11-29 12:00:00
last_modified_at: 2016-11-29 12:00:00
categories: Ruby
---

In order to parse user inputs passed to **CLI Scripts** we can use the Ruby class `OptionParser`. With that it's possible to define an argument specification like **required/optional**, or **restrict values** or even convert into a **specified class**. Find out how to configure `OptionParser` and use it.

## User Inputs

It's quite common for **CLI Scripts** to receive arguments like:

| --------------- | ----------------------------- |
| flag and value  | description                   |
| --------------- | ----------------------------- |
| `-f`            | short style without any value |
| `-f bar`        | value separated by whitespace |
| `-f=bar`        | value separated by `=`        |
| `--foo bar`     | long style with value         |
| `--foo bar,baz` | multiple values (list)        |
| --------------- | ----------------------------- |

This is so common that this become implemented by `OptionParser` class. Let's see how to configure all that.

## `OptionParser` class

The Ruby standard library has a class called [OptionParser][ruby-option-parser] that handle user inputs in a very easy way. The main idea is to define a `parser` and parse it, simple as:

```ruby
OptionParser.new do |parser|
  # define your parser here
end.parse!
```

The `parse!` method has a default of `ARGV` and so you can receive ruby script arguments.

Another nice catch is to use a `Struct` class to hold the configuration variables parsed by `OptionParser`, and possibly with default values, something like this:

```ruby
Config = Struct.new(*%i[color drink lang fun point sports time user]) do
  def initialize
    self.fun    = false
    self.point  = 0
    self.sports = []
  end
end
```

Finally it's important to memoize the `Config` instance, so we are going to have just one **parser** and call `parse!` method just once.

```ruby
class OptparseExample
  class << self
    def config
      @config ||= Config.new.tap do |config|
        build_parser(config).parse!
      end
    end
  end
end
```

## Complete example

Maybe the easiest way to explain how to configure and use `OptionParser` is providing a **full example** with a Ruby script file and call it with some arguments. Check this out:

{: data-path="lib/config.rb"}
```ruby
Config = Struct.new(*%i[color drink lang fun point sports time user]) do
  DRINKS = %i[water tea beer]
  LANGS  = {
    de: 'Deutsch',
    en: 'English',
    fr: 'Français',
  }

  def self.drinks
    DRINKS
  end

  def self.langs
    LANGS
  end

  def initialize
    self.drink  = DRINKS.first
    self.lang   = LANGS.values.first
    self.fun    = false
    self.point  = 0
    self.sports = []
  end
end
```

The `User` class just represents a simple model, and this class is being used for **Custom Converters**. In this case I want to receive a user by id, fetch him in the database and provide as a configuration the found `User`, not just the `id`. This is just to show how powerful can be a **Custom Converter**.

{: data-path="models/user.rb"}
```ruby
User = Struct.new(:name) do
  def self.find(id)
    all[id - 1]
  end

  def self.all
    [
      User.new('John'),
      User.new('Mary'),
    ]
  end
end
```

Finally the full Ruby script file:

{: data-path="my-script"}
```ruby
#!/usr/bin/env ruby

require 'optparse'
require 'optparse/time'

class OptparseExample
  class << self
    def config
      @config ||= Config.new.tap do |config|
        build_parser(config).parse!
      end
    end

    private

    def build_parser(config)
      OptionParser.new do |parser|
        parser.banner = 'Help: ./my-script --help'
        define_custom_converters(parser)

        parser.separator "\nCommon options:"
        define_common_config(parser, config)

        parser.separator "\nSpecific options:"
        define_specific_config(parser, config)
      end
    end

    def define_custom_converters(parser)
      parser.accept(User) { |id| User.find(id.to_i) }
    end

    def define_common_config(parser, config)
      parser.on('-h', '--help',    'Show help')    { quit_script(parser) }
      parser.on('-v', '--version', 'Show version') { quit_script('Version => 1.0.0') }
    end

    def define_specific_config(parser, config)
      parser.on('-c', '--color=COLOR', 'Favorite Color')           { |v| config.color  = v }
      parser.on('-d', '--drink=DRINK', drinks, "Drink: #{drinks}") { |v| config.drink  = v }
      parser.on('-l', '--lang=LANG', langs, "Lang: #{langs}")      { |v| config.lang   = v }
      parser.on('-f', '--[no-]fun', 'Run with Fun Mode')           { |v| config.fun    = v }
      parser.on('-p', '--point=POINT', Float, 'Points')            { |v| config.point  = v }
      parser.on('-s', '--sports=X,Y,Z', Array, 'Favorite Sports')  { |v| config.sports = v }
      parser.on('-t', '--time=TIME', Time, 'Starting time')        { |v| config.time   = v }
      parser.on('-u', '--user=USER_ID', User, 'User ID')           { |v| config.user   = v }
    end

    def quit_script(message = nil)
      puts message if message
      exit
    end

    def drinks
      Config.drinks
    end

    def langs
      Config.langs
    end
  end
end

puts OptparseExample.config
```

If we run this script with the `--help` flag:

```shell
./my-ruby-script --help
#=> Usage: ./my-script [options]
#=>
#=> Common options:
#=>     -v, --version                    Show version
#=>     -h, --help                       Show help
#=>
#=> Specific options:
#=>     -c, --color=COLOR                Favorite Color
#=>     -d, --drink=DRINK                Drink: [:water, :tea, :beer]
#=>     -l, --lang=LANG                  Lang: {:de=>"Deutsch", :en=>"English", :fr=>"Français"}
#=>     -f, --[no-]fun                   Run with Fun Mode
#=>     -p, --point=POINT                Points
#=>     -s, --sports=X,Y,Z               Favorite Sports
#=>     -t, --time=TIME                  Starting time
#=>     -u, --user=USER_ID               User ID
```

Now running the same script **setting** a lot of different flags:

```shell
./my-ruby-script -c blue \
                 -d tea \
                 -l en \
                 -f \
                 -p 5 \
                 -s hockey,soccer,rugby \
                 -t 14/07/2016-08:53:20 \
                 -u 1;

#=> #<struct Config
#=>   color="blue",
#=>   drink=:tea,
#=>   lang="English",
#=>   fun=true,
#=>   point=5.0,
#=>   sports=["hockey", "soccer", "rugby"],
#=>   time=2016-07-14 08:53:20 -0300,
#=>   user=#<struct User name="John">
#=> >
```

Try yourself with this code and verify what happens if you change the flags configuration or values when calling the script.

## Conclusion

`OptionParser` class is a simplifier class when we are dealing with Ruby Script files. It helps us to define and parse an user input and with this definition we can use it to **print a help** message in the same script. Let's use it to **get user inputs**, restrict to a list of **possible values**, make them **required**, convert to **specific classes** and so on.

{% include markdown/acronyms.md %}

[ruby-option-parser]: http://ruby-doc.org/stdlib-2.3.3/libdoc/optparse/rdoc/OptionParser.html 'Ruby option-parser'
