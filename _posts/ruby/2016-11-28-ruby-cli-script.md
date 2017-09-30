---
layout: post
title:  "Ruby CLI Script"
date:   2016-11-28 12:00:00
last_modified_at: 2016-11-28 12:00:00
categories: Ruby
---

To create **CLI script** that runs Ruby code is super fast and straightforward. With that you can run any Ruby code **directly from terminal**, including your **own gem**. Let's take a look what's need to be done in order to get a nice maintainable CLI script written in Ruby.

## CLI Script

To create a Ruby CLI script you need to create a **text file**, enable **execution** and add a Ruby **header**:

```shell
touch my-script
chmod 744 my-script
echo "#!/usr/bin/env ruby" > my-script
```

The first line of your script just tells the shell terminal where is the executable for the following lines, in this case Ruby. At this point your Ruby script will looks like this:

{: data-path="my-script"}
```ruby
#!/usr/bin/env ruby

# Your Ruby code goes here...
```

In order to run your script you can type in your terminal:

```shell
./my-script
```

And then, you can add any Ruby code you want, including requiring gems and also, always, testing your script with for example `rspec`.

## Make your Gem executable

If you have a Gem, and you want to make it executable in command line terminal, you'll need:

- create a CLI script file with the same name as the script you'll want to run from terminal
- move this script file to inside the bin folder: `~/your_gem/bin/my-script`
- require `bundler/setup` and `your_gem`
- change your `your_gem.gemspec` file to add you script into `spec.executables` attribute

Your gemspec file will look like this:

{: data-path="your_gem.gemspec"}
```ruby
...
Gem::Specification.new do |spec|
  ...
  spec.bindir        = 'bin'
  spec.executables   = %w(my-script)
end
```

And here it comes your script file:

{: data-path="bin/my-script"}
```ruby
#!/usr/bin/env ruby

require "bundler/setup"
require "your_gem"

YourGem.do_something_smart
```

## Testing CLI scripts

If you want to create an **integration** test with your Ruby script, you can use a Ruby `Kernel` method to execute a command from terminal and then verify your code correctness.

The first strategy is to call [Kernel#system][ruby-kernel-system] method and assert a Ruby stubbed call for example. Something like:

{: data-path="spec/my_script_spec.rb"}
```ruby
require 'spec_helper'

RSpec.describe './my-script' do
  it 'calls your Ruby class with the correct arguments' do
    expect(MyLibrary).to receive(:process).with('foo')
    system('./my-script')
  end
end
```

Another strategy is if your script prints out some results you can grab it and verify its value with [Kernel#`][ruby-kernel-backtick] (backtik) method. Check this out:

{: data-path="spec/my_script_spec.rb"}
```ruby
require 'spec_helper'

RSpec.describe './my-script' do
  it 'calls your Ruby class with the correct arguments' do
    expect(`./my-script`).to eq(
      <<~OUT
      +---+---+---+
      |   | 2 | 3 |
      +---+---+---+
      | 2 | 4 | 6 |
      | 3 | 6 | 9 |
      +---+---+---+
      OUT
    )
  end
end
```

## Conclusion

Creating a Ruby script file is super easy and straightforward.

Additionally making your gem executable through a ruby script file it's a very nice way to make your gem usable in terminal.

Finally a good Ruby code keeps its quality through simple and direct tests and this is a very easy task to do. So there's no reason for leaving a script file without testing. Let's do that!

{% include markdown/acronyms.md %}
{% include markdown/links.md %}
{% include markdown/images.md %}
