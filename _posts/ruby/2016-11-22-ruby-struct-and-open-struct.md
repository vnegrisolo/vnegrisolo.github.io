---
layout: post
title: "Ruby Struct and OpenStruct classes"
date: 2016-11-22 12:00:00
last_modified_at: 2016-11-22 12:00:00
categories: Ruby
---

Ruby `Struct` and `OpenStruct` are two different classes that handle to keep some data into a class instance. Although they have similar name and features they are actually very different in usage. Let's highlight the differences between these two classes and find out the best scenarios for using each one.

## First the Similarities

Both [Struct][ruby-struct] and [OpenStruct][ruby-open-struct] classes were made to handle some data into a instance of a class. In both instance created from `Struct` or instance of `OpenStruct` it is possible to:

- call its attributes using **getter** methods
- change attribute values using **setter** methods
- get attributes in **hash style** through a key that could be `String` or `Symbol`
- compare all **keys and values** using `==` method

Check this out:

{: data-title="struct-example.rb" class="two-column"}
```ruby
PersonStruct = Struct.new(:name)
joe = PersonStruct.new('Joe')

joe.name
#=> Joe
joe[:name]
#=> Joe
joe['name']
#=> Joe

joe.name = 'Not Joe anymore'
joe.name
#=> Not Joe anymore

joe_one = PersonStruct.new('Joe')
joe_two = PersonStruct.new('Joe')
joe_one == joe_two
#=> true
```

{: data-title="open-struct-example.rb" class="two-column"}
```ruby
require 'ostruct'
mary = OpenStruct.new(name: 'Mary')

mary.name
#=> Mary
mary[:name]
#=> Mary
mary['name']
#=> Mary

mary.name = 'Not Mary anymore'
mary.name
#=> Not Mary anymore

mary_one = OpenStruct.new(name: 'Mary')
mary_two = OpenStruct.new(name: 'Mary')
mary_one == mary_two
#=> true
```

Now let's check the differences.

## Struct

The [Struct][ruby-struct] is a Ruby core class, so you **don't need to require** it before usage.

First you define/initialize a `Struct` passing to the `new` method all acceptable **attributes**. At this point it's also possible to define **custom implementations**, such as methods.

After that you can create instances passing to them the **values in the same order** as it was defined earlier on. Omitted values will be set as `nil`.

You can use the methods `members` and `each_pair` to get all keys and values.

{: data-title="struct-example.rb"}
```ruby
PersonStruct = Struct.new(:name, :age) do
  def hi
    "Hello #{name}!"
  end
end

joe = PersonStruct.new('Joe', 29)
joe.age
#=> 29
joe.hi
#=> Hello Joe!

PersonStruct.new('Joe', 29).to_h
#=> {name: 'Joe', age: 29}
PersonStruct.new('Joe').to_h
#=> {name: 'Joe', age: nil}

joe.members
#=> [:name, :age]
joe.each_pair {|k, v| puts "key=#{k}, value=#{v}" }
#=> key=name, value=Joe
#=> key=age, value=29
```

## OpenStruct

The [OpenStruct][ruby-open-struct] is a Ruby stdlib class, so you **need to require** `ostruct` before usage.

`OpenStruct` is a simpler implementation than `Struct` and in fact it looks like a **wrapper** for `Hash` class. You initialize a `OpenStruct` with a hash and that's it, nothing more required.

It's **not possible to customize** this object.

You can use the methods `to_h` and `each_pair` to get all keys and values, almost the same way as `Struct`.

Finally it's possible to remove an attribute from a `OpenStruct` instance using `delete_field`.

{: data-title="open-struct-example.rb"}
```ruby
require 'ostruct'
mary = OpenStruct.new(name: 'Mary', age: 30)
mary.age
#=> 30

mary.to_h.keys
#=> [:name, :age]
mary.each_pair {|k, v| puts "key=#{k}, value=#{v}" }
#=> key=name, value=Mary
#=> key=age, value=30

mary.age = nil
mary.to_h
#=> {name: 'Mary', age: nil}
mary.delete_field(:age)
mary.to_h
#=> {name: 'Mary'}
```

## Conclusion

Both classes `Struct` and `OpenStruct` seems to solve the same problem, but it's important to know their differences very well for making wise choices:

- if you have **unknown attribute** keys then you'll need the flexible that comes with `OpenStruct`
- if you need some **custom implementation**, such as additional methods, you have to use `Struct`
- otherwise you can basically choose any of these that you'll be fine, so it's just chose the preferred flavor

{% include markdown/acronyms.md %}

[ruby-open-struct]: http://ruby-doc.org/stdlib-2.3.2/libdoc/ostruct/rdoc/OpenStruct.html 'Ruby open-struct'
[ruby-struct]: https://ruby-doc.org/core-2.3.2/Struct.html 'Ruby struct'
