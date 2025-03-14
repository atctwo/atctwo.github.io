---
layout: post
title:  "A tiny C++ reflective enum macro"
date:   2025-03-14
categories: posts
tags: [programming, c++]
author: "atctwo"
description: Last year I put together a C++ macro for reflective enums, so I thought I'd talk about it!
image: /assets/images/posts/reflective-enums/enum3.gif
toc: true
enable_comments: true
enable_related: true
custom_excerpt: true
excerpt_separator: <!-- excerpt-end -->
---

<style>
    .cool-figure {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: 100%;
    }
    .cool-figure.flipper-screenshot img, video {
        width: unset;
        height: 120px;
        border: 10px solid #FE892B;
        /* border-radius: 0px; */
    }
    .cool-figure figcaption {
        font-size: 0.875em;
        color: var(--bs-secondary-color);
        text-align: center;
    }
    @media (min-width: 767px) {
        .cool-figure img, video {
            width: 70%;
        }
    }
</style>


<!-- excerpt-start --> 

Back in September I spent about three weeks hyperfocusing on a project called [bbrx](https://github.com/atctwo/bbrx).  It's a little thingy to act as an electronic speed controller for robots and drones, itself controlled using Bluetooth gamepads!

Much of how the code keeps track of inputs and actions is implemented using **enums**.  I wanted to be able to load data from a YAML file and have it be "parsed" from a string into an enum value.  This isn't something that C++ supports natively, so I did some research and discovered the idea of **reflective enums**.  I tried a few libraries that implement this but I quickly gave up and took the much easier path of implementing them myself.

<!-- excerpt-end --> 

This post is simply a discussion of the reflective enum implementation I used in bbrx (in fact, you can see where it's used in [bbrx's source code](https://github.com/atctwo/bbrx/blob/main/bbrx/bb_enums.h)).  I'll also talk a little bit about the libraries that probably do a better job than I did.

This post assumes knowledge of enums in general, and a little bit of C++.

# What is a reflective enum?
If you're already familiar with reflective enums, you can probably skip this part!

For those who don't, recall that enums and their values exist almost as their own types within a language.  Consider an enum called `Colour`:

```c++
enum Colour {
    RED,
    ORANGE,
    YELLOW,
    GREEN,
    BLUE,
    INDIGO,
    VIOLET
};
```

If you want to check if a value `col` is a specific colour, you have to check it against one of the members of `Colour` (eg: `if col == Colour::INDIGO`).  This works well for most cases, but what do you do when you want to move enum data into or out of a program (eg: a configuration file)?

When a C/C++ program is running, enums are just numbers.  In the domain of the source code they exist as their own unique types, but when the compiled code is running on a computer, enums are just represented as numbers ("integral" values).  **By default**, the first member of the enum is assigned a value of `0`, the second member is `1`, and so on.  

Because of this, enum members can be *implicitly cast* to integral types, and vice versa.  As a example:
```c++
Colour col == Colour::INDIGO;
printf("The colour is %d", col);
```
would print `The colour is 5` (since `INDIGO` is the sixth element in the enum).  This works the other way round too:
```c++
assert((Colour)(3) == GREEN);
```

What happens when you add or remove a member from an enum?  The default integral values of each member would change, meaning you couldn't guarantee that any given number is associated with a specific member.  C and C++ actually let you manually assign values to each member manually (eg: `RED = 0, ORANGE = 1,` etc) but you still have to keep track of which number corresponds to which member.  This is especially annoying when you're dealing with *serialised* enum data that's intended to be viewed and edited by humans, like in a config file.

Since enums are stored in memory as integers, the "name" of each enum member only makes sense within the source code file.  As soon as it's compiled, the name is left behind.  Normally, there's no native way to switch between an enum member and a more human-friendly representation (for example, a string representation of the member).

That's one of the main use cases for **reflective enums**!  They are able to consider their own existence within the source code itself, and return a string representation of their source code name.  The reverse is true too, where you can derive an enum value from a string representation.  

While C/C++ can't do this natively, other languages can by keeping some symbol information during runtime.  For example, Java has pretty good native support for enum reflection:

```java
// enum to string
Colour col = Colour.BLUE;
String col_str = col.toString();
assert("BLUE".equals(col_str));

// string to enum
Colour col2 = Colour.valueOf("GREEN");
assert(col2 == Colour.GREEN);
```

Cool, but what happens when you try to convert a string to an enum but the value in the string doesn't exist in that enum?  Java handles this like everything else, with an exception:

```java
// string to enum value which doesn't exist
try {
    Colour col3 = Colour.valueOf("MAGENTA");
}
catch (IllegalArgumentException e) {
    // MAGENTA is not a real colour
}
```

That's about it!  In short, it can be really useful to switch between a string and an equivalent enum.  So how can we do this in C++?


# Existing implementations
A simple way implement enum reflection (kind of) in C++ is doing it manually in a function.  For example:
```c++
std::string Colour_to_string(Colour col) {
    if (col == RED)         return "RED";
    else if (col == ORANGE) return "ORANGE";
    else if (col == YELLOW) return "YELLOW";
    ...
    else return "UNKNOWN";
}
```

This would work, but each time you add a new value, you would also have to update the `enum_to_string()` function, and *also* the `string_to_enum()` function.  Since C/C++ doesn't have native support for reflection, it would be cool if you were somehow able to *generate* these functions at compile time.  When I was working on bbrx it might have been possible for me to use or make an external preprocessor do to that, but I was using Arduino and setting up a custom build system seemed a bit overkill.  And also C/C++ already has it's own preprocessor!

Several libraries exist that implement [*preprocessor macros*](https://gcc.gnu.org/onlinedocs/cpp/Macros.html) to generate reflective enums.  Two popular ones are [Better Enums](https://aantron.github.io/better-enums/) and [wise_enum](https://github.com/quicknir/wise_enum/); here is an example using the latter:

```c++
#include "wise_enum.h"

WISE_ENUM(Colour, RED, ORANGE, YELLOW, GREEN, BLUE, INDIGO, VIOLET);

// enum to string
assert(wise_enum::to_string(Colour::RED) == "RED");

// string to enum
assert(wise_enum::from_string<Colour>("GREEN") == Colour::GREEN);

// string to enum that doesn't exist
assert(!wise_enum::from_string<Colour>("MAGENTA"));
```

Instead of declaring enums normally, you instead use a preprocessor macro.  Given a enum name and member names the macro will resolve to an standard enum, and the library will provide functions for converting between that enum's members and string forms of them.

For some reason I don't think I actually tried these libraries when developing bbrx.  I did try another library called [magic_enum](https://github.com/Neargye/magic_enum/).  This library seems to be doing something else other than using macros, but it requires C++17.  For Reasons, I was restricted to using C++11 for bbrx, so I did the normal thing and made my own macro.


# bbrx's implementation
My implementation is **heavily** based on [this blog post](https://belaycpp.com/2021/08/24/best-ways-to-convert-an-enum-to-a-string/) by Chloé Lourseyre.  The post discusses several different ways to convert enums to strings in C++, starting with magic_enum, going on to describe the simple if/else/else method (using a switch statement).  Finally, it describes a macro-based approach from which my macro was derived.  Specifically, it makes use of the `##` preprocessor operator, but I'll describe how this works when I'm describing the macro.

First, here's the macro itself:


<!-- ```c++
/**
 * Hell Macro which defines a reflective enum called `name`, with members provided as varargs.  The following symbols
 * are defined in the scope of invocation:
 * - a regular C++ enum called `name`
 * - `std::string <name>_to_string(int)` - converts a member of `name` to a string version of that member
 * - `name <name>_to_enum(std::string)` - converts a string to the matching member of `name`
 *
 * It also defines a few symbols for internal usage:
 * - `std::vector<name> <name>Members` - a vector, where each element is a name member
 * - `std::vector<std::string> <name>Strings` - a vector, where each element is the string version of each name member
 * - `std::string <name>StdString` - a big string with all the name members in comma-space separated format
 * - `std::string <name>delim` - basically just ", "
 * - `int <name>_to_enum_id(std::string)` - a function which converts a string to the integer version of the matching name member
 * 
 * note that the indexes of <name>Members and <name>Strings should match up
 *
 * This depends on the following stdlibs: vector, iostream, algorithm
 *
 * made by atctwo!
 * advice about inlining from Celisium (thank you ^_^).
 * This is heavily based on a macro provided in this blog post by Chloé Lourseyre:
 * https://belaycpp.com/2021/08/24/best-ways-to-convert-an-enum-to-a-string/
 */
define ENUM_MACRO(name, ...)\
    enum name { __VA_ARGS__ };\
    inline std::string name##StdString = std::string(#__VA_ARGS__);                            /* single string with comma separated enum members */ \
    inline std::string name##delim = ", ";                                                     /* delimiter */ \
    inline std::vector<std::string> name##Strings = split(name##StdString, name##delim);       /* split string into vector of strings where each string is an enum member */ \
    inline std::vector<name> name##Members = { __VA_ARGS__ };                                  /* create vector where each element is an enum member, so the enum ID == index */ \
    inline int name##_to_enum_id(std::string value) { std::vector<std::string>::iterator found = std::find(name##Strings.begin(), name##Strings.end(), value); return (found == name##Strings.end()) ? -1 : found - name##Strings.begin(); } \
    inline std::string name##_to_string(name value) { return name##Strings[value]; }           /* function to convert an enum to it's string version */ \
    inline name name##_to_enum(std::string value)  { return (name) name##_to_enum_id(value); }

```
-->

<div class="language-c++ highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="cm">/**
 * Hell Macro which defines a reflective enum called `name`, with members provided as varargs.  The following symbols
 * are defined in the scope of invocation:
 * - a regular C++ enum called `name`
 * - `std::string &lt;name&gt;_to_string(int)` - converts a member of `name` to a string version of that member
 * - `name &lt;name&gt;_to_enum(std::string)` - converts a string to the matching member of `name`
 *
 * It also defines a few symbols for internal usage:
 * - `std::vector&lt;name&gt; &lt;name&gt;Members` - a vector, where each element is a name member
 * - `std::vector&lt;std::string&gt; &lt;name&gt;Strings` - a vector, where each element is the string version of each name member
 * - `std::string &lt;name&gt;StdString` - a big string with all the name members in comma-space separated format
 * - `std::string &lt;name&gt;delim` - basically just ", "
 * - `int &lt;name&gt;_to_enum_id(std::string)` - a function which converts a string to the integer version of the matching name member
 * 
 * note that the indexes of &lt;name&gt;Members and &lt;name&gt;Strings should match up
 *
 * This depends on the following stdlibs: vector, iostream, algorithm
 *
 * made by atctwo!
 * advice about inlining from Celisium (thank you ^_^).
 * This is heavily based on a macro provided in this blog post by Chloé Lourseyre:
 * https://belaycpp.com/2021/08/24/best-ways-to-convert-an-enum-to-a-string/
 */</span>
<span class="n">#define</span> <span class="n">ENUM_MACRO</span><span class="p">(</span><span class="n">name</span><span class="p">,</span> <span class="p">...)</span>\
    <span class="k">enum</span> <span class="n">name</span> <span class="p">{</span> <span class="n">__VA_ARGS__</span> <span class="p">};</span>\
    <span class="kr">inline</span> <span class="n">std</span><span class="o">::</span><span class="n">string</span> <span class="n">name</span><span class="err">##</span><span class="n">StdString</span> <span class="o">=</span> <span class="n">std</span><span class="o">::</span><span class="n">string</span><span class="p">(</span><span class="err">#</span><span class="n">__VA_ARGS__</span><span class="p">);</span>                            <span class="cm">/* single string with comma separated enum members */</span> \
    <span class="kr">inline</span> <span class="n">std</span><span class="o">::</span><span class="n">string</span> <span class="n">name</span><span class="err">##</span><span class="n">delim</span> <span class="o">=</span> <span class="s">", "</span><span class="p">;</span>                                                     <span class="cm">/* delimiter */</span> \
    <span class="kr">inline</span> <span class="n">std</span><span class="o">::</span><span class="n">vector</span><span class="o">&lt;</span><span class="n">std</span><span class="o">::</span><span class="n">string</span><span class="o">&gt;</span> <span class="n">name</span><span class="err">##</span><span class="n">Strings</span> <span class="o">=</span> <span class="n">split</span><span class="p">(</span><span class="n">name</span><span class="err">##</span><span class="n">StdString</span><span class="p">,</span> <span class="n">name</span><span class="err">##</span><span class="n">delim</span><span class="p">);</span>       <span class="cm">/* split string into vector of strings where each string is an enum member */</span> \
    <span class="kr">inline</span> <span class="n">std</span><span class="o">::</span><span class="n">vector</span><span class="o">&lt;</span><span class="n">name</span><span class="o">&gt;</span> <span class="n">name</span><span class="err">##</span><span class="n">Members</span> <span class="o">=</span> <span class="p">{</span> <span class="n">__VA_ARGS__</span> <span class="p">};</span>                                  <span class="cm">/* create vector where each element is an enum member, so the enum ID == index */</span> \
    <span class="kr">inline</span> <span class="kt">int</span> <span class="n">name</span><span class="err">##</span><span class="n">_to_enum_id</span><span class="p">(</span><span class="n">std</span><span class="o">::</span><span class="n">string</span> <span class="n">value</span><span class="p">)</span> <span class="p">{</span> <span class="n">std</span><span class="o">::</span><span class="n">vector</span><span class="o">&lt;</span><span class="n">std</span><span class="o">::</span><span class="n">string</span><span class="o">&gt;::</span><span class="n">iterator</span> <span class="n">found</span> <span class="o">=</span> <span class="n">std</span><span class="o">::</span><span class="n">find</span><span class="p">(</span><span class="n">name</span><span class="err">##</span><span class="n">Strings</span><span class="p">.</span><span class="n">begin</span><span class="p">(),</span> <span class="n">name</span><span class="err">##</span><span class="n">Strings</span><span class="p">.</span><span class="n">end</span><span class="p">(),</span> <span class="n">value</span><span class="p">);</span> <span class="k">return</span> <span class="p">(</span><span class="n">found</span> <span class="o">==</span> <span class="n">name</span><span class="err">##</span><span class="n">Strings</span><span class="p">.</span><span class="n">end</span><span class="p">())</span> <span class="o">?</span> <span class="o">-</span><span class="mi">1</span> <span class="o">:</span> <span class="n">found</span> <span class="o">-</span> <span class="n">name</span><span class="err">##</span><span class="n">Strings</span><span class="p">.</span><span class="n">begin</span><span class="p">();</span> <span class="p">}</span> \
    <span class="kr">inline</span> <span class="n">std</span><span class="o">::</span><span class="n">string</span> <span class="n">name</span><span class="err">##</span><span class="n">_to_string</span><span class="p">(</span><span class="n">name</span> <span class="n">value</span><span class="p">)</span> <span class="p">{</span> <span class="k">return</span> <span class="n">name</span><span class="err">##</span><span class="n">Strings</span><span class="p">[</span><span class="n">value</span><span class="p">];</span> <span class="p">}</span>           <span class="cm">/* function to convert an enum to it's string version */</span> \
    <span class="kr">inline</span> <span class="n">name</span> <span class="n">name</span><span class="err">##</span><span class="n">_to_enum</span><span class="p">(</span><span class="n">std</span><span class="o">::</span><span class="n">string</span> <span class="n">value</span><span class="p">)</span>  <span class="p">{</span> <span class="k">return</span> <span class="p">(</span><span class="n">name</span><span class="p">)</span> <span class="n">name</span><span class="err">##</span><span class="n">_to_enum_id</span><span class="p">(</span><span class="n">value</span><span class="p">);</span> <span class="p">}</span>

</code></pre></div></div>

<details>
<summary><em>Note: the macro depends on this function called <code>split()</code></em></summary>



<div markdown="1">
```c++
/**
 * @brief function to split a string into parts using a delimiter
 * 
 * from https://stackoverflow.com/a/14266139
 * 
 * @param s string to split
 * @param delimiter 
 * @return std::vector<std::string> vector of substrings
 */
inline std::vector<std::string> split(std::string& s, std::string& delimiter) {
    std::vector<std::string> tokens;
    size_t pos = 0;
    std::string token;
    while ((pos = s.find(delimiter)) != std::string::npos) {
        token = s.substr(0, pos);
        tokens.push_back(token);
        s.erase(0, pos + delimiter.length());
    }
    tokens.push_back(s);

    return tokens;
}
```
</div>
</details>
<br>

Let's break this down line by line to see how it works.

{% include admonition.html type="info" %}

<div class="no_toc_section" markdown="1">

##### `#define ENUM_MACRO(name, ...)`
This is the signature of the macro.  The first argument is the name to give to the enum that is generated, as well as the reflection functions.  Each member of the enum is specified as part of the `...` - this allows any number of arguments to be passed to the macro, accessible inside the macro as [`__VA_ARGS__`](https://gcc.gnu.org/onlinedocs/cpp/Variadic-Macros.html).  
For the rest of this explanation, let's assume the name passed to the macro is `Colour`.

##### `enum name { __VA_ARGS__ };`
Here is where the actual enum `Colour` is defined.  It follows the normal C/C++ macro definition.  `__VA_ARGS__` is expanded here to provide the members for the enum.

##### `inline std::string name##StdString = std::string(#__VA_ARGS__);`
This part simply makes an internal-use string called `ColourStdString`.  This is where the `##` operator comes in.  The preprocessor doesn't really deal with source code the same way as the compiler does; to the preprocessor, a source file is just a bunch of strings (called "tokens").  Even function names and parameters are just tokens.  That's why you can use the [concatenation operator](https://gcc.gnu.org/onlinedocs/cpp/Concatenation.html) to *combine two tokens into a single one!*

In this case, it's taking the token `name` (well, whatever token is passed to the macro - in this case `Colour`), and the token `StdString`, and mashing them together to make `ColourStdString`!  The actual value of this string is just the contents of `__VA_ARGS__`, but in a string (using the [stringizing (`#`)](https://gcc.gnu.org/onlinedocs/cpp/Stringizing.html) operator).  For example, `"RED, ORANGE, YELLOW, GREEN, BLUE, INDIGO, VIOLET"`.

##### `inline std::string name##delim = ", ";`
Using the concatenation operator again, this line makes another internal-use string called `Colourdelim`.  This literally contains the string `", "`, which is used by...

##### `inline std::vector<std::string> name##Strings = split(name##StdString, name##delim);`
This line uses `Colourdelim` as a delimiter to break up `ColourStdString` into an internal-use `std::vector` of strings, called `ColourStrings`.  In other words, you end up with a vector where each element corresponds to each of the enum's members, *in the same order*.

##### `inline std::vector<name> name##Members = { __VA_ARGS__ };`
Similarly to the last line, this line creates an internal `std::vector` where each element is one of the enum's members.  Except in this one, instead of strings they're actual members of `Colour`!  

Critically the indexes of the string version in `ColourStrings` and the `Colour` version in `ColourMembers` of any given member match up perfectly.  For example, `ColourStrings[2]` will be `"YELLOW"`, and `ColourMembers[2]` will be `Colour::YELLOW`!

##### `inline std::string name##_to_string(name value) { return name##Strings[value]; }`
Here's the first actual external-use reflection function.  It's called `Colour_to_string` - it takes in a `Colour` and returns a string version of it!

How it works is really basic; since enums **by default** are represented as integers, this function just pretends the `Colour` is an integer, and uses it as the index of a value in `ColourStrings`.  Since the order of `ColourStrings` is the same as the enum members, it returns the correct string!

##### `inline int name##_to_enum_id(std::string value) { std::vector<std::string>::iterator found = std::find(name##Strings.begin(), name##Strings.end(), value); return (found == name##Strings.end()) ? -1 : found - name##Strings.begin(); }`
This unholy one-liner defines a function called `Colour_to_enum_id`, taking in a string and returning the `Colour` counterpart.  The `id` part means that this doesn't actually return a `Colour`, instead returning the integer value of the member.  As such, this is also considered internal-use; the actual end-user function is defined in the next line.

While it looks scary, the way this function works is pretty simple.  It uses C++'s [`std::find()`]() function to perform a linear search on `ColourStrings`, to find the string which matches up with the one provided.  If there is a match, it returns the index of the string in `ColourStrings`, otherwise returning -1.

##### `inline name name##_to_enum(std::string value)  { return (name) name##_to_enum_id(value); }`
Finally, here's the other external-use function.  `Colour_to_enum` takes in a string and returns the `Colour` version.  It basically calls `Colour_to_enum_id()`, passing the same string that is passed to it.  Once it has the index of the string version of the colour in `ColourStrings`, it simply casts it to a `Colour` - this works because again, the values of members of `Colour` are consecutive integers.

</div>
{% include admonition_end.html %}

## Usage
To actually use the macro, call it with the first parameter as the enum name, and the rest of the parameters as the rest of the parameters:

```c++
// create reflective enum Colour
ENUM_MACRO(Colour,
    RED,
    ORANGE,
    YELLOW,
    GREEN,
    BLUE,
    INDIGO,
    VIOLET
);
```

Now you can use the enum `Colour` like any other enum, and you can use the functions `Colour_to_string()` and `Colour_to_enum()`:

```c++
// enum to string
Colours col = Colours::BLUE;
assert(Colours_to_string(col) == "BLUE");

// string to enum
assert(Colours_to_enum("GREEN") == Colours::GREEN);

// string to enum that doesn't exist
assert(Colours_to_enum("MAGENTA") == -1);
```

## Caveats
Compared to other reflective enum implementations, `ENUM_MACRO` is pretty small!  However, there are a few caveats to be aware of when using this macro.

- All of the internal-use objects (`ColourStdString`, `Colourdelim`, `ColourStrings`, `ColourMembers`, `Colour_to_enum_id()`) are still defined in the same scope as everything else the macro defines, and can actually be accessed.  This kind of violates the principle of data access restriction, but it's probably not a huge issue
  - In fact, you could even use `ColourMembers` to iterate over each value in the enum!
- This macro doesn't make it possible to assign any values to enum members.  Members can only have the default values of consecutive integers, since the reflection functions use them as array indexes.  
  - It may be possible to implement this feature by switching out the `std::vector` for a `std::map`, since you could simply use strings *as indexes*
- With regards to algorithmic complexity, `name_to_string()` is O(1) (yay!) since it's just a vector lookup, but `name_to_enum()` is O(n) (eh.) since it performs a linear search each time.
  - Again, this could probably be improved using a `std::map` since lookups happen in [O(log n) time](https://stackoverflow.com/a/16068170) (or constant if using a `std::unordered_map`).

# Wrapping up
So, that's pretty much all there is to this funny little macro.  It worked pretty well for what I needed it to do in bbrx: reading enum values from a config YAML file as strings, then parsing them into actual enum members.  There are definitely places where it could be improved, and I might do that some day, but it's probably more likely that I'll just use one of the other reflective enum implementations.

To that end, I would probably recommend you do too.  The libraries I've referenced in this post have been around for years and held up to the scrutiny of being an open-source project.  They're probably a lot more reliable than my little macro.  Nonetheless, I hope you at least learned a little, or found it enjoyable.  Even if it's not as battle-tested as the other offerings, I still think it's pretty cute!

# Credits
- Chloé Lourseyre, for [the blog post](https://belaycpp.com/2021/08/24/best-ways-to-convert-an-enum-to-a-string/) which `ENUM_MACRO` is derived from
- My friend [Celisium](https://github.com/Celisium), for suggesting the use of `inline` for making the reflection functions work properly