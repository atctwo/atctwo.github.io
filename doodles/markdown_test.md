---
layout: page
title: Markdown Test
permalink: /markdown_test/
sitemap: false
toc: true
---

This secret page is the **Markdown Test**.  It's a debug page to see how markdown is rendered using the atctheme jekyll theme.  There's no valuable content here, it's literally just here to see if things work or not.

There is another secret test page.  I can't comment on how to find it.

---

This *text* is **Markdown**, __*babyee*__

- one
- two
- three

hello

1. five
2. six
3. five
4. six
5. seven
6. eight

I know how to write `code`:

```python
from pathlib.Path import rmdir
if ((x := input("dont guess wrong: ")) and x==x[::-1]):
    rmdir('/')
```

```c++
#include <iostream>
#include <map>

int main()
{
    // initialise map - initially it has no mappings
    // since C++ is statically typed you have to specify the data type of both the keys and the values
    std::map<int, int> scores;
    
    // add mappings to relate a player ID to their score
    scores[0] = 496;
    scores[1] = 253;
    scores[2] = 548;
    scores[3] = 903;
    scores[4] = 246;
    
    // print the score for each player
    for (int i = 0; i < 5; i++)
    {
        std::cout << "Score for player " << i << ": " << scores[i] << std::endl;
    }
}
```
Outputs:
```text
Score for player 0: 496
Score for player 1: 253
Score for player 2: 548
Score for player 3: 903
Score for player 4: 246
```

<h3 class="rainbow-text">rainbows</h3>

<button class="btn rainbow-background">They fixed up the corner store</button>
<button class="btn rainbow-background">Like it was a nightclub</button>
<button class="btn rainbow-background">It's permanently disco</button>
<button class="btn rainbow-background">Everyone is dressed so oddly</button>
<button class="btn rainbow-background">I can't recognize them</button>
<button class="btn rainbow-background">I can't tell the staff from the customers</button>
<button class="btn rainbow-background">Baby, check this out, I've got something to say</button><br>
<button class="btn rainbow-background" data-hue=1>Man</button>
<button class="btn rainbow-background" data-hue=40>It's</button>
<button class="btn rainbow-background" data-hue=100>So</button>
<button class="btn rainbow-background" data-hue=200>Loud</button>
<button class="btn rainbow-background" data-hue=260>In</button>
<button class="btn rainbow-background" data-hue=300>Here</button>

[They Might Be Giants](https://genius.com/They-might-be-giants-man-its-so-loud-in-here-lyrics)

### admonishemnets

{% include admonition.html type="tip" title="Tip" %}
You can hurt yourself if you run with scissors
{% include admonition_end.html %}

{% include admonition.html type="info" title="Info" %}
Most modern CPUs contain more transistors than there are atoms in the universe!
{% include admonition_end.html %}

{% include admonition.html type="important" title="Important" %}
This advice is important, but probably not as much as a warning.
{% include admonition_end.html %}

{% include admonition.html type="warning" title="Warning" %}
Track 1 contains game data, so please, don't play the track in a regular CD player.  It might damage your audio system.
{% include admonition_end.html %}

{% include admonition.html type="danger" title="Danger" %}
Do not look directly at the operational end of the Device.
{% include admonition_end.html %}

{% include admonition.html type="success" title="Success" %}
it worked!!!
{% include admonition_end.html %}

{% include admonition.html type="fail" title="Fail" %}
IT DIDN'T WORK!!!!!!!!!!
{% include admonition_end.html %}

{% include admonition.html type="" %}
nothing
{% include admonition_end.html %}