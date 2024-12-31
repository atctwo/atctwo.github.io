---
layout: post
title:  "Listening to and faking wireless doorbells"
date:   2024-12-02
categories: posts
tags: [embedded, rf, arduino]
author: "atctwo"
description: After researching how wireless doorbells work, what can one actually do with this knowledge?
image: /assets/images/posts/wireless-doorbells/scope5.png
toc: true
enable_comments: true
enable_related: true
custom_excerpt: true
excerpt_separator: <!-- excerpt-end -->
---



<!-- excerpt-start --> 

In the previous post, I went through the whole process of reverse engineering a wireless doorbell.  Well, it felt more like piecing together threads of information together that I found about the protocol it uses.  With details about how the protocol works and the data that doorbells send, what can we actually do with it?

<!-- excerpt-end -->

It's really up to you!  For me, I'm definitely going to find this info useful for future projects (like making custom receivers for my doorbell).  While I'm happy using an SDR or a Flipper for reverse engineering, they're a bit overkill (and expensive) to be installed in a project long-term.  I would be much happier using those inexpensive 433 MHz <abbr title="Amplitude Shift Keying">ASK</abbr> modules I talked about in the previous post.

The receiver module can output the encoded data, but we still have to decode it to make use of it.  And for the transmitter, we would still have to encode it in the first place if we want it to be compatible with existing receivers.  Where most commercial devices use dedicated hardware for (de, en)coding, we can do it in software!  Thankfully there's a really cool Arduino library called [rc-switch](https://github.com/sui77/rc-switch) which can handle it for us!

[todo: link to previous post]

*This is a follow-up to my previous post.  It's designed to be useful on it's own, but I would still recommend reading the previous post if you aren't familiar with EV1527 encoding!*

# Protocols
- rc-switch supports different protocols

# Receiving Data
- how to receive data

# Transmitting Data
- how to send data

# Other Libraries
- other arduino libraries are available

# Closing Thoughts