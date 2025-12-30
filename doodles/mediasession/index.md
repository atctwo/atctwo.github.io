---
layout: page
permalink: /doodles/mediasession
title: MediaSession Bones
---

## Demo of MediaSession's silly little quirks

made by <a href="https://atctwo.net/">atctwo</a> in 2025!

you can view my results for these tests on [this page](./results)

### Please select a test
<table class="table">
    <thead>
        <tr>
            <td>test</td>
            <td>test target</td>
            <td>MediaSession <code>metadata</code></td>
            <td>MediaSession action handlers</td>
            <td>MediaSession <code>metadata.artwork</code></td>
            <td>MediaSession <code>playbackState</code></td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><a href="./test1.html">test1</a></td>
            <td>html5 <code>&lt;audio&gt;</code></td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><a href="test2.html">test2</a></td>
            <td>html5 <code>&lt;audio&gt;</code></td>
            <td>✅</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><a href="test3.html">test3</a></td>
            <td>html5 <code>&lt;audio&gt;</code></td>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><a href="test4.html">test4</a></td>
            <td>html5 <code>&lt;audio&gt;</code></td>
            <td>✅</td>
            <td>✅</td>
            <td>✅<br>(remote URL)</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><a href="test5.html">test5</a></td>
            <td>html5 <code>&lt;audio&gt;</code></td>
            <td>✅</td>
            <td>✅</td>
            <td>✅<br>(remote URL)</td>
            <td>✅<br>(before <code>metadata</code>)</td>
        </tr>
        <tr>
            <td><a href="test6.html">test6</a></td>
            <td>html5 <code>&lt;audio&gt;</code></td>
            <td>✅</td>
            <td>✅</td>
            <td>✅<br>(remote URL)</td>
            <td>✅<br>(after <code>metadata</code>)</td>
        </tr>
        <tr>
            <td><a href="test7.html">test7</a></td>
            <td>html5 <code>&lt;audio&gt;</code></td>
            <td>✅</td>
            <td>✅</td>
            <td>✅<br>(<code>blob:</code> URL)</td>
            <td>✅<br>(after <code>metadata</code>)</td>
        </tr>
        <tr>
            <td><a href="test8.html">test8</a></td>
            <td>html5 <code>&lt;audio&gt;</code></td>
            <td>✅</td>
            <td>✅</td>
            <td>✅<br>(<code>data:</code> URL)</td>
            <td>✅<br>(after <code>metadata</code>)</td>
        </tr>
        <tr>
            <td><a href="test9.html">test9</a></td>
            <td>html5 <code>&lt;audio&gt;</code></td>
            <td>✅</td>
            <td>✅</td>
            <td>✅<br>(<code>blob:</code> URL)</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><a href="test10.html">test10</a></td>
            <td>html5 <code>&lt;audio&gt;</code></td>
            <td>✅</td>
            <td>✅</td>
            <td>✅<br>(<code>data:</code> URL)</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><a href="test11.html">test11</a></td>
            <td>howler.js</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅<br>(remote URL)</td>
            <td>❌</td>
        </tr>
    </tbody>
</table>
<br>

<p>Your User-Agent: <strong><span id="useragent"></span></strong></p>

<script>
    // display user-agent
    document.getElementById("useragent").innerText = navigator.userAgent;
</script>