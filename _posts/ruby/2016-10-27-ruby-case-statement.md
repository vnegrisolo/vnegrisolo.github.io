---
layout: post
title:  "Ruby Case Statement and the `threequals`"
date:   2016-10-27 12:00:00
last_modified_at: 2016-10-27 12:00:00
categories: Ruby
---

Ruby `case/when/else` statement uses the Ruby operator `===`, also known as **threequals**. There are some nice implementations of `===` that we have to know. So let's see some of them.

## Ruby Threequals Operator

The first of all, `===` is a **Ruby operator**, and this means that it can be called in this two distinct ways:

```ruby
'hello' === 'hello'
#=> true

'hello'.===('hello')
#=> true
```

And that's why the **order (left/right)** matters. See this example:

```ruby
Integer === 4
#=> true
4 === Integer
#=> false
```

Additionally [ruby-object] implementation is the same as calling `==`. So let's see the cases that they differ.

## Class and Module implementation

The most used `===` implementation comes from [ruby-module] that's the same for Ruby Modules and Ruby Classes. This implementation checks if the argument is an **instance or descendant** of a Class/Module.

```ruby
Integer === 4
#=> true

Numeric === 5
#=> true

Float === 6
#=> false
```

## Range implementation

[ruby-range] implementation of `===` verifies if the **range contains** the argument.

```ruby
(1..10) === 7
#=> true
(1..10) === 15
#=> false
```

## Regexp implementation

[ruby-regexp] `===` implementation evaluates the regexp with the argument and returns if the argument matched the regexp or not:

```ruby
/^[a-z]+$/ === 'hello'
#=> true

/^[a-z]+$/ === 'HELLO'
#=> false
```

## Proc and Lambda implementation

Another interesting implementation of `===` is in [ruby-proc]. It evaluates the block passing the argument to the Proc or Lambda.

```ruby
even = ->(n) { n % 2 == 0 }
even === 5
#=> false
even === 4
#=> true
```

```ruby
odd = lambda { |n| n % 2 != 0 }
odd === 5
#=> true
odd === 4
#=> false
```

## Ruby Case Statement

And finally we know that the Ruby `case/when/else` statement **uses** `===` method to evaluate which clause matches the argument. Putting all together, let's see this example and how the syntax is short and nice to read:

```ruby
def find_out(obj = nil)
  even = ->(n) { Integer === n && n % 2 == 0 }
  odd = lambda { |n| Integer === n && n % 2 != 0 }

  case obj
  when Symbol; 'This is a Symbol'
  when 1..10;  'This is a small Integer'
  when /^9/;   'Starts with 9'
  when even;   'This is an even Integer'
  when odd;    'This is an odd Integer'
  else;        'I could not identify it'
  end
end

find_out(:foo)
#=> "This is a Symbol"
find_out(5)
#=> "This is a small Integer"
find_out('97')
#=> "Starts with 9"
find_out(100)
#=> "This is an even Integer"
find_out(101)
#=> "This is an odd Integer"
find_out(foo: :bar)
#=> "I could not identify it"
```

## Conclusion

The Ruby operator `===` threequals allow us to define custom implementations and then use it in the `case` statement. The main goal here is to let code more readable. So let's use the threequals operator more often.

{% include markdown/acronyms.md %}
{% include markdown/links.md %}
{% include markdown/images.md %}
