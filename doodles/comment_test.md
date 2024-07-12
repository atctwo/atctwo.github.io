---
layout: page
title: Comment Test
permalink: /comment_test/
sitemap: false
---

aah!  you found the secret comment test page, where I was testing the comment box for blog posts.  leave a comment and say hi to all the other people who ended up here.

<div id="remark42"></div>

<script>
  var remark_config = {
        host: 'https://comments.atctwo.net',
        site_id: "atctwo.net",
        components: ['embed', 'last-comments'],
        max_shown_comments: 100,
        theme: 'dark',
        page_title: 'My custom title for a page',
        locale: 'en',
        show_email_subscription: true,
        simple_view: false
    }
</script>

<script>!function(e,n){for(var o=0;o<e.length;o++){var r=n.createElement("script"),c=".js",d=n.head||n.body;"noModule"in r?(r.type="module",c=".mjs"):r.async=!0,r.defer=!0,r.src=remark_config.host+"/web/"+e[o]+c,d.appendChild(r)}}(remark_config.components||["embed"],document);</script>