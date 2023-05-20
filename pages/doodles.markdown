---
layout: page
permalink: /doodles/
title: Doodles
---

Welcome to an assortment of really random useless stuff

- <a href='javascript:open("https://www.adafruit.com/product/" + Math.floor(Math.random() * 5756), "_self");'>Random Adafruit Product</a>
- [Make entire webpage editable](javascript:var c=document.body.children;for(var i=0;i<c.length-1;i++){c.item(i).contentEditable=true})
    - recreation of something I found in the comments of a YouTube video, but I could never find again
    - this is designed to be used as a bookmarklet (you should be able to use it on any website)
- [teapot](/doodles/teapot/index.html)
- [EIIRP](/doodles/eiirp.html)
- [cmd.txt](/doodles/cmd.txt)
- [Byakuya Togami](/doodles/togami)
- [>30 Minute Morse Code](/doodles/30-minute-morse//index.html)
- [LG TV Web Remote](/doodles/lg_remote.html)
- [Prompt Generator](/doodles/words)

<body>
    <span id="notice"></span>
</body>

<script src="chance.js"></script>

<script>
    document.getElementById("notice").innerHTML = ("atctwo.net is not endorsed by " + chance.company() );
</script>