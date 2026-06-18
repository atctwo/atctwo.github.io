---
layout: post
title:  "MediaSession API Skeletons"
date:   2026-06-18
categories: posts
tags: [web, media]
author: "atctwo"
description: Inconsistent behaviour in the MediaSession Web API sent me down a long and deep rabbit hole
image: /assets/images/posts/mediasession/mediacontrols3.png
thumbnail: /assets/images/posts/mediasession/mediacontrols.jpg
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
        .cool-figure img:not(.smol), video {
            max-width: 70%;
        }
        .smol-container {
            width: 90%;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .smol {
            width: 45%;
        }
    }

    .code-container {
        position: relative;
    }

    @media (min-width: 767px) {
        .btn-test {
            position: absolute;
            right: 0px;
        }
    }
    .btn-test button {
        padding: 0.375rem;
        font-size: small;
    }

    blockquote {
        padding: 10px 10px;
        border-left: 3px solid var(--bs-secondary-color);
        color: var(--bs-secondary-color);
    }
    blockquote > p {
        margin-bottom: 0px;
    }
    html[data-bs-theme="light"] .about-social-dark {
        display: none;
    }
    html[data-bs-theme="dark"] .about-social-light {
        display: none;
    }
</style>


{% include admonition.html type="info" %}

<script>
    async function start_mediasession() {
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: "Velkommen",
                artist: "Stan LePard",
                album: "Windows XP",
                artwork: [{
                    src: "/assets/images/posts/mediasession/bliss.jpg",
                    sizes: "512x512",
                    type: "image/jpeg"
                }]
            });
            navigator.mediaSession.playbackState = "playing";
        }
    }
    async function pause_mediasession() {
        if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "paused";
        }
    }
</script>

<div style="text-align: center;">
    <p>This blog post is presented with the following musical accompaniment:</p>
    <audio controls onplay="start_mediasession()" onpause="pause_mediasession()">
        <source src="/assets/images/posts/mediasession/title.wma.flac" type="audio/flac">
        <source src="/assets/images/posts/mediasession/title.wma.mp3"  type="audio/mpeg">
        <p>It seems your browser doesn't support the HTML5 <code>&lt;audio&gt;</code> feature :(</p>
    </audio>
    <p>Please use this media element to see how the MediaSession API works on your operating system!</p>
</div>

{% include admonition_end.html %}

<!-- excerpt-start --> 

Over the holidays last Christmas, I took a break from all the engineering I do for my PhD by doing a bunch of engineering for a totally unrelated project - a music player app, designed from the ground up to fix all the issues I have with other music apps.

It was intended to be a quick holiday project so I didn't really want to learn a whole new app framework.  So I stuck to what I knew, and started making it as a web app.  But I very quickly started having to work around the limitations of the browser's Web APIs.  I decided to document what I've learned in my fight against one particular API - **The MediaSession API**.

<!-- excerpt-end --> 

As the musical accompaniment above is hopefully showing, the MediaSession API is used by websites to provide music metadata for the browser to send to the OS, for it to then use in it's own media control interfaces.

<figure class="cool-figure">
    <img src="/assets/images/posts/mediasession/mediacontrols3.png" alt="A collage of media control panels from various operating systems.  Each panel shows the same song - Velkommen by Stan LePard, with the default Windows XP wallpaper (Bliss) as the artwork.  Each panel is laid out chaotically on top of a large instance of Bliss">
    <figcaption>Media control panels from a few different operating systems</figcaption>
</figure>

As I was integrating the API into my music app, I started running into strange and inconsistent behaviour.  While I got it kinda working in one browser, it just wouldn't work in others.  This wasn't helped by the tiny amount of documentation!  So, I put together a simple test suite with each test building on the last, to see where the API stopped working in different browsers and environments.  Putting that data together I finally realised what the root causes of the issues were (and I discovered a new issue while testing)!

This post goes takes a introductory look at the MediaSession API, then discusses the edge cases that have been causing problems for my relaxing holiday project.

## Testing Methodology

To figure out the problem(s) and how bad they were, I created 11 test cases.  They each consist of a `<audio>` element playing [title.wma / Velkommen](https://microsoft.fandom.com/wiki/Windows_Welcome_Music), along with "Start" and "Stop" buttons.  These buttons invoke some JavaScript to start the audio, and setup the MediaSession metadata.  The first test starts with no MediaSession code, the next one adds basic metadata, the next one adds action handlers, and so on.

The tests can be accessed [here](/doodles/mediasession), where there's also a table showing what each test has changed from the previous one.  Throughout the post, example code samples are provided with links to the relevant test for you to try yourself!

I manually ran each test on a number of different web browsers, on a few different operating systems (described below).  The results of my testing in full can be found [here](/doodles/mediasession/results), and will be explained over the course of this post.

{% include admonition.html type="info" %}
<div class="no_toc_section" markdown="1">

<p><em>All tests were run in December 2025 / January 2026</em></p>
<p></p>

### On <i class="bi bi-tux"></i> Linux
- `chromium` 143.0.7499.40
- `google-chrome` 143.0.7499.169
- `firefox` 145.0.2
- `firefox-dev-edition` 146.0b9
- `waterfox` 6.6.6 (firefox 140.6.0) with [Natsumi Browser](https://github.com/greeeen-dev/natsumi-browser) 6.0.1
- `zen-browser` 1.17.15b
- each browser was tested separately with and without the [Plasma Browser Integration](https://community.kde.org/Plasma/Browser_Integration) extension
- because of [edge case 3](#edge-case-3-firefox-doesnt-update-arturl-if-the-art-hasnt-changed), all the testing with Firefox (and Firefox forks) on Linux was done with some (paused) music in another tab, to force artwork reloads between tests
- tested on EndeavourOS (kernel 6.17.9)

### On <i class="bi bi-windows"></i> Windows
- Google Chrome 143.0.7499.170
- Microsoft Edge 143.0.3650.9
- Firefox 146.0.1
- each browser was tested separately with and without the [Plasma Browser Integration](https://community.kde.org/Plasma/Browser_Integration) extension
- tested on Windows 11 25H2 (build 26200.6584) running under QEMU/KVM 10.1.2

### On <i class="bi bi-apple"></i> macOS
- Safari 15.6.1
- Chrome 143.0.7499.170
- Firefox 156.0.1
- tested on macOS Monterey (12.7.4) running under QEMU/KVM 10.1.2 (via [ultimate macOS KVM](https://github.com/Coopydood/ultimate-macOS-KVM))

### On <i class="bi bi-android"></i> Android
- Vanadium 143.0.7499.146 (GrapheneOS's Chrome fork)
- Firefox Nightly 145.0a1
- tested on GrapheneOS (based on Android 16) on a Pixel 8a

</div>
{% include admonition_end.html %}

{% include admonition.html type="warning" %}

Please note that much of the behaviour discussed here might change in future browser / extension versions.  If any of this changes in the future I'll try to update this post!

Each of the edge cases outlined in these posts aren't properties of MediaSession itself, but they do affect how it's handled by the browser.  I thought it would be useful to document anyway, in case someone else is experiencing these behaviours.

Also, a lot of this behaviour really only affects Linux systems which use the [MPRIS metadata interface](https://specifications.freedesktop.org/mpris/latest/) - but that's not to say that other operating systems aren't affected by these edge cases!

{% include admonition_end.html %}

# MediaSession Introduction
If you're already familiar with MediaSession, feel free to skip this section!

HTML5 provides *media elements*, which allow you to directly embed media within web pages - namely the [`<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio) and [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video) tags.  These abstract away most of the complexity of playing different media types on different platforms, but on their own they aren't capable of handling any metadata.

<!-- they are limited in what they can do outside of "play media".  They do one thing, and they do it well. -->

<!-- Most operating systems these days provide some kind of media center - something which not only lets you play and pause and skip songs, but also shows you the current song's title, artist, album artwork, and other metadata.  Each OS implements these differently ([SMTC](https://learn.microsoft.com/en-us/windows/uwp/audio-video-camera/system-media-transport-controls) on Windows, [Media Player](https://developer.apple.com/documentation/mediaplayer/) on macOS, [MPRIS](https://www.freedesktop.org/wiki/Specifications/mpris-spec) on Linux), but they all are ultimately used to show a user what's playing *outside* of the app it's playing in. -->

Most operating systems provide some kind of media control centre[^5], where the user can play, pause, and skip tracks, as well as see song metadata like title, artist, and the album artwork.  Since a media element couldn't normally interface with these OS-level APIs, the **MediaSession API** exists to bridge that gap.  This API allows webpages to specify media metadata to the OS and react to media control events like play and pause.  All of this happens in a platform-agnostic way!

[^5]: I made this cool list of OS media APIs but it got cut from the main body for brevity.  So here it is: Windows has it's [System Media Transport Controls](https://learn.microsoft.com/en-us/windows/uwp/audio-video-camera/system-media-transport-controls) (SMTC) API, macOS has the [Media Player](https://developer.apple.com/documentation/mediaplayer/) framework, Linux has the D-Bus-based [MPRIS](https://www.freedesktop.org/wiki/Specifications/mpris-spec) interface, and Android has the confusingly-named [MediaSession](https://developer.android.com/reference/android/media/session/MediaSession)[^6]!

[^6]: although maybe it's the MediaSession Web API that's confusingly named...

As an example, let's say we have a simple `<audio>` tag like the one at the top of this article:

<div class="code-container" markdown="1">
<a href="/doodles/mediasession/test1.html" class="btn-test" target="_blank"><button class="btn btn-primary rainbow-background">Try with test1</button></a>

```html
<audio id="audio" controls src="./media/title.wma.mp3" onplay="audio_onplay();"></audio>
```

</div>
<br>
<figure class="cool-figure">
    <img class="about-social-light" src="/assets/images/posts/mediasession/plasma-media-1.png" alt="Screenshot of KDE Plasma's media control panel, showing the page title of the test suite">
    <img class="about-social-dark" src="/assets/images/posts/mediasession/plasma-media-1-dark.png" alt="Screenshot of KDE Plasma's media control panel, showing the page title of the test suite">
    <figcaption>KDE Plasma's media control panel, showing the test page title</figcaption>
</figure>
<br>

On its own, the browser will usually just use the page title as the song title.  Using MediaSession, we can tell the browser exactly what's playing by assigning a new [MediaMetadata](https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata) object to the global `mediaSession` instance:

<div class="code-container" markdown="1">
<a href="/doodles/mediasession/test2.html" class="btn-test" target="_blank"><button class="btn btn-primary rainbow-background">Try with test2</button></a>

```js
function audio_onplay() {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: "Velkommen",
            artist: "Stan LePard",
            album: "Windows XP"
        });
    }
}
```

</div>

{% include admonition.html type="tip" %}

This code checks if `mediaSession` exists as a property of `navigator`, to prevent errors when running in a [browser that doesn't support MediaSession](https://caniuse.com/mdn-api_mediasession)!  This will be important later.

{% include admonition_end.html %}

Now when playing the audio, the `onplay` event will call this function, causing the title, artist, and album to be displayed correctly.

<br>
<figure class="cool-figure">
    <img class="about-social-light" src="/assets/images/posts/mediasession/plasma-media-2.png" alt="Screenshot of KDE Plasma's media control panel, showing the song's title, artist, and album name, as well as a progress bar.  The album artwork is not here, in its place is an icon of a CD tray.">
    <img class="about-social-dark" src="/assets/images/posts/mediasession/plasma-media-2-dark.png" alt="Screenshot of KDE Plasma's media control panel, showing the song's title, artist, and album name, as well as a progress bar.  The album artwork is not here, in its place is an icon of a CD tray.">
    <figcaption>KDE Plasma's media control panel, showing the song metadata but no artwork</figcaption>
</figure>
<br>

Now we have the song metadata, but where's the album artwork?  `MediaMetadata` objects support another property called [`artwork`](https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata/artwork), which lets you specify multiple different artwork sources.  It should take the form of an array of objects with a `src` attribute, and optional `sizes` and `type` attributes.  Building on the last example:


<div class="code-container" markdown="1">
<a href="/doodles/mediasession/test4.html" class="btn-test" target="_blank"><button class="btn btn-primary rainbow-background">Try with test4</button></a>

```js
function audio_onplay() {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: "Velkommen",
            artist: "Stan LePard",
            album: "Windows XP",
            artwork: [{
                src: "./media/bliss.jpg",
                sizes: "512x512",
                type: "image/jpeg"
            }]
        });
    }
}
```

</div>


<figure class="cool-figure">
    <img class="about-social-light" src="/assets/images/posts/mediasession/plasma-media-3.png" alt="Screenshot of KDE Plasma's media control panel, showing the song metadata as the previous example, but this time with the correct album artwork being displayed.">
    <img class="about-social-dark" src="/assets/images/posts/mediasession/plasma-media-3-dark.png" alt="Screenshot of KDE Plasma's media control panel, showing the song metadata as the previous example, but this time with the correct album artwork being displayed.">
    <figcaption>KDE Plasma's media control panel, showing the song metadata as well as the artwork</figcaption>
</figure>

And that's it for the basics!  There are a few more features like [setting action handlers](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler) and presentation control features but those are out of scope for this post.  However, there are a few other things you should know about.

First is the `playbackState`.  Normally the browser will try to infer whether the media element is playing or paused, and it's normally pretty good at this.  However, if you need to you can manually override this by setting the [`navigator.mediaSession.playbackState`](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/playbackState) property to one of {`none`, `playing`, `paused`}.

Another thing to be aware of (that isn't really documented very well) is that **there needs to be an actively playing media element for MediaSession work**!  Without one, the API won't send any of the provided metadata to the OS.

# Edge Case 1: MediaSession in Android WebViews
The first edge case I found is a little unrelated to the others, but it's worth taking a quick look anyway!

The last section pointed out that you should always make sure `navigator.mediaSession` actually exists, since some browsers don't support MediaSession.  This isn't *usually* a problem - at time of writing [~94% of global internet users](https://caniuse.com/?search=mediasession) use a browser that supports it.  That last 6% is probably old and unsupported versions of browsers, right?

There is one significant browser which doesn't support MediaSession - the [Android System WebView](https://play.google.com/store/apps/details?id=com.google.android.webview&hl=en_GB).  This is the embeddable browser that a lot of apps use to show web pages without having to send the user to the device's main web browser.  Normally the user is only in the webview for a few minutes so it's typically not a problem that this API is unsupported.

However, web-to-native app frameworks like [Capacitor](https://capacitorjs.com/) and [Tauri](https://v2.tauri.app/) work by bundling a web app and rendering it an a webview.  In these cases, the whole app runs in a webview - if that app needs to use MediaSession (for example, a music player), then it simply can't.

{% include admonition.html type="info" %}

This is only a problem on Android, since the iOS webview *does* support MediaSession.

{% include admonition_end.html %}


So what can you do?  If you're using a webview in a native app, you can still use Android's confusingly-named native [MediaSession API](https://developer.android.com/media/legacy/mediasession).  If you're using a web-to-native framework, check if there is a media session plugin (for example [capacitor-media-session](https://github.com/jofr/capacitor-media-session)).

# Edge Case 2: Artwork with data / blob URLs

In the intro to MediaSession, the album artwork provided to MediaSession was specified as a file path - in reality this was a relative HTTP(S) URL, pointing to the location of the artwork on the server.  We can actually observe the browser fetching the artwork if we look at the Network tab of the browser's Developer Tools.

<figure class="cool-figure">
    <img src="/assets/images/posts/mediasession/audio-fetch-artwork.png" alt="Screenshot of Chrome's Developer Tools, open on the Network tab, showing a series of resources fetched from the network.  Selected is a file called bliss.jpg, which is shown in a preview pane on the right side of the image.">
    <figcaption>Chrome's Dev Tools showing a preview of the fetched artwork</figcaption>
</figure>

Looking at the [MediaSession specification](https://w3c.github.io/mediasession/#dictdef-mediaimage), it specifies the `src` attribute of `artwork` entries as

<blockquote>
    <p>a URL from which the user agent can fetch the image’s data</p>
</blockquote>

Typically, MediaSession applications only really use remote HTTP URLs as artwork sources.  However, while it's not documented that well, **it is possible to use data and blob URLs** for album artwork `src` attributes!

{% include admonition.html type="tip" title="What are Data and Blob URLs?" %}

<!-- Most URLs (like `https://`, `ftp://`, `file://`) uniquely locate resources which are typically stored somewhere *remote*, as part of a different file or location.  In the examples in the last section, the artwork URL points to a resource which is distinct from the main HTML document.

[`data:`](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data) and [`blob:`](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob) URLs are ways of specifying resources which don't actually exist on some remote location.  They're used to reference resources stored within the memory of the webpage or browser itself.

When dealing with blocks of data or files within the JavaScript language, Blobs are often used as a generic binary-containing object.  Blob URLs can be provided by the browser using a function like [`URL.createObjectUrl()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static), so that things which only operate on URLs (like `<audio>` or `<img>`) can use Blobs.

Data URLs can be used in the same way, but rather than the URL *proving access* to the underlying data, data URLs *are* the data.  They actually contain the bytes of the data in the URL itself, typically encoded in base64.  This of course means the URLs are generally very very long. -->

While most URL schemes (like `https://` and `file://`) uniquely locate a resource at some other location (that is, they are *remote*), data and blob URLs provide ways to reference resources that are stored *in memory*.  

[Blob URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob) are created from [Blob objects](https://developer.mozilla.org/en-US/docs/Web/API/Blob) using a function like [`URL.createObjectUrl()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static), while [Data URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data) contain the resource's binary data directly in the URL (usually encoded in base64).  Both of these allow things with can only read from URLs (like the `<img>` tag) to read from in-memory sources of data.

Check these out (specifically what they link to) for some examples:

<div style="display: flex; gap: 10px; margin: 10px; width: 100%; justify-content: center;">
    <a target="_blank" id="test-blob-url"><button class="btn btn-primary rainbow-background">Blob URL</button></a>
    <a target="_blank" id="test-data-url"><button class="btn btn-primary rainbow-background">Data URL</button></a>
</div>

<script>

async function setup_blob_url(url) {
    let res = await fetch(url);
    let data = await res.blob();
    let blob_url = URL.createObjectURL(data);
    document.getElementById("test-blob-url").href = blob_url;
}

async function setup_data_url(url) {
    let res = await fetch(url);
    let data = await res.blob();
    let b64 = await toBase64(data);
    document.getElementById("test-data-url").href = b64;
}

// adapted from https://stackoverflow.com/a/57272491
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result?.toString() ?? "");
        reader.onerror = reject;
    });
}

let url = "/assets/images/posts/mediasession/bliss.jpg";
setup_blob_url(url);
setup_data_url(url);
</script>


{% include admonition_end.html %}

To demonstrate this, let's modify the examples from the last section.  Given a known artwork URL, you can use one of the two functions below to produce a blob URL or a data URL from the remote resource.  If you already have the remote URL then it might be easier to just use that, but sometimes you might only have access to a data or blob URL (for example if your app is accessing a file or is offline).

```js
// fetch the contents of a URL and return them as a blob: URL
// taken from test7
async function fetch_blob_url(url) {

    // fetch resource
    let res = await fetch(url);

    // get response body as binary data
    let data = await res.blob();

    // create a blob URL from the data
    let blob_url = URL.createObjectURL(data);

    // return url
    return blob_url;

}

// fetch the contents of a URL and return them as a base64 encoded data: URL
// taken from test8
async function fetch_data_url(url) {

    // fetch resource
    let res = await fetch(url);

    // get response body as binary data
    let data = await res.blob();

    // create a base64 string from the binary data
    let b64 = await toBase64(data);

    // return url
    return b64;

}

// adapted from https://stackoverflow.com/a/57272491
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result?.toString() ?? "");
        reader.onerror = reject;
    });
}
```

To use these in the `MediaMetadata` constructor, just use their output in place of the artwork URL.  Since they're `async` functions, you will either have to wait until their Promise resolves, or just `await` them.

<div class="code-container" markdown="1">
<a href="/doodles/mediasession/test7.html" class="btn-test" target="_blank"><button class="btn btn-primary rainbow-background">Try with test7</button></a>

```js
// for blob urls
artwork: [{
    src: await fetch_blob_url("./media/bliss.jpg"),
    sizes: "512x512",
    type: "image/jpeg"
}]
```
</div>

<div class="code-container" markdown="1">
<a href="/doodles/mediasession/test8.html" class="btn-test" target="_blank"><button class="btn btn-primary rainbow-background">Try with test8</button></a>

```js
// for data urls
artwork: [{
    src: await fetch_data_url("./media/bliss.jpg"),
    sizes: "512x512",
    type: "image/jpeg"
}]
```

</div>

From my MediaSession testing, I found that this feature worked perfectly on Chrome (and Chromium-based browsers) and Safari, on all the platforms I tried.  I however found that **neither data nor blob URLs work under Firefox** on Windows, macOS, or Linux.  In fact, this is a problem others have experienced before - there's a [Bugzilla report](https://bugzilla.mozilla.org/show_bug.cgi?id=1686895) documenting the issue that at time of writing is 4 years old.  The bug also seems to be the topic of [this GitHub issue](https://github.com/9001/copyparty/issues/992).

Having said that, both data and blob URLs work absolutely fine on Firefox for Android!

So, what can you do about this?  There's isn't a perfect workaround, but thankfully the `MediaMetadata.artwork` attribute is an array, and supports multiple artwork sources.  This means you can provide a fallback remote URL source as well as a data or blob URLs.  This is the workaround I've adopted for my music app, but it's not perfect since artwork for music stored locally on the device won't have a remote URL to fall back on.

# Edge Case 3: Firefox doesn't update `artUrl` if the art hasn't changed
When I was running the test cases in each browser, I found that on Firefox on Linux some test cases which had worked during test development had stopped working - the artwork wasn't loading, even though there was no reason it shouldn't.  Somehow, running the same test twice in a row caused the artwork to not work the second time.

After a bit of experimenting, I found that all the cases which had stopped working started working again *if there was music playing in another tab*.  My theory on why this works is that Firefox won't produce an MPRIS message *if the current artwork is the same as the last one* (or at least has the same `src`).  When running the same test twice, the artwork will be the same between them, so Firefox just doesn't produce an artwork message for the second run.  

By having some other media session in another tab (even if it's paused), when the test media session ends it [falls back](https://www.w3.org/TR/mediasession/#media-session-routing) to that one.  This is technically a change in artwork, and since the art between the two sessions is different, Firefox communicates this to MPRIS.

I wondered if this would affect playlists which have the same song multiple times in a row (and therefore the same artwork `src`).  I tried this on YouTube Music, and when moving from one instance of a song to the next it *did* produce MPRIS data (although data for both instances contained the same artwork URL).  I then closed the tab and immediately reopened it, to find that Firefox had not produced MPRIS data for the song.  When skipping to the next instance, Firefox did then produce MPRIS data.

I tried to find any discussion of this problem online but I couldn't really find much.  It's a pretty obscure edge case, and despite the strange behaviour it's probably not something most people would really notice.  Even at that, I only observed this behaviour on Firefox, and then only on Linux.  Either way, I thought it would still be useful to have documented somewhere on the internet!

# Edge Case 4: Plasma Browser Integration

<!-- 
bugs to find or report
- on chrome, needs playbackState to be set to playing after metadata is set
- on firefox, data URLs don't work due to firefox security
- on all browsers, the ext prevents the browser's native media handling - this is a problem when the ext stops working when there's no native host
-->

For users of [KDE Plasma](https://kde.org/plasma-desktop/), one recommended browser extension is [Plasma Browser Integration](https://community.kde.org/Plasma/Browser_Integration) (PBI), which provides better integration of web browsers into the Plasma environment.  It achieves this by [exchanging messages](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging) with a native host daemon, which itself interfaces with Plasma directly.

This edge case concerns a feature which allows the extension to provide better media metadata than what the browser produces on its own[^4].  The extension monitors MediaSession metadata, and communicates it to the native host, which then translates that into MPRIS messages.

[^4]: PBI was created at a time before most browsers had any media controls or MediaSession support, so from what I can see it was one of the only ways to get media metadata at the time!  While most browsers have these features now, PBI still provides a few very useful non-media integrations with Plasma that browser's don't do natively.

From general usage I've found that it works pretty well, but during my testing I discovered a few obscure bugs and side effects which affect how MediaSession works.

## Requiring `playbackState` to be set after `metadata`
When some MediaSession code is executed, PBI will communicate the updated info to the native client as one of a few different *events*.  For instance, when `mediaSession.metadata` is updated the extension sends the `metadata` event, and when `mediaSession.playbackState` is updated it will either send the `playing` or `paused` event.

An interesting implementation detail is that the native host will only register itself as a D-Bus client (and therefore will only provide MPRIS data) *when the `playing` event is received*.  This ultimately means that when PBI is installed, setting `metadata` on its own won't do anything - **you must specifically set `playbackState` to `playing`** (and as I've found, after `metadata` has already been set).

There's no harm in doing that anyway, but without PBI browsers typically provide MRPIS data irrespective of `playbackState`.

This behaviour stops tests 4 and 5 from working.  test6 still works, since of the three it's the only one that sets `playbackState` after setting `metadata`.

Additionally, it seems that if you have some system where one song plays after another automatically (like a playlist), then you might need to set `playbackState` to `none`, and then back to `playing`, in between songs.

## Handling of artwork as data URLs in Firefox
As well as the test cases that stop working due to the previous subsection, test7 doesn't work in Firefox - this is the test where artwork is provided as a data URL.  Edge Case 2 shows that these don't work for artwork in Firefox anyway, but PBI causes them to not work for different reasons.

<!-- 
extension-mpris.js before !151 -> https://invent.kde.org/plasma/plasma-browser-integration/-/blob/54a281348771536c38da2a9b174a9fd6862e2d7c/extension/extension-mpris.js

extension-mpris.js, latest, line where it handles artwork fetch errors -> https://invent.kde.org/plasma/plasma-browser-integration/-/blob/master/extension/extension-mpris.js?ref_type=heads#L270
-->

The extension caches artwork by calling `fetch()` on `metadata.artwork` `src`s directly within the extension[^1].  The cached artwork is then sent to the native host.  However, when attempting to fetch a blob URL from a different context the browser rejects the request for security reasons.

<figure class="cool-figure">
    <img src="/assets/images/posts/mediasession/pbi-test7.png" alt="A screenshot of the JavaScript console for the extension.  There is a error log and a warning log, both complaining about the same issue.  The error reads: Security Error: Content at moz-extension://extension id / _generated_background_page.html may not load data from blob:http://localhost:8000 / blob url id">
    <figcaption>Extension inspector showing the extension's console, and the generated error</figcaption>
</figure>

This ultimately causes the extension to not send any artwork, although other metadata is still sent.

[^1]: Historically the extension would simply retrieve the artwork URL and forward that to the host, which would forward that directly to MPRIS.  It would be up to the OS to actually fetch the artwork from the URL, which is a bit of a security risk.  Since merge request [!151](https://invent.kde.org/plasma/plasma-browser-integration/-/merge_requests/151), the extension instead does the fetching, passing the cached artwork to MPRIS.

## Preventing native media handling
From my understanding of the codebase, PBI is able to monitor changes in MediaSession properties by overriding the built-in `mediaSession` instance with a custom one, which relays changes back to the main extension in each properties setter method.  This is a neat way of doing it, but it unfortunately seems to prevent the default `mediaSession`'s behaviour of communicating metadata to the browser.  Ultimately this prevents the browser from sending any media info to the OS, totally relying on PBI to do all the work.

Normally this isn't something that would cause any issues[^2], except in the cases where PBI stops working.  This can happen when PBI can't communicate with the native host, for example if it's not installed or it's running on a different OS[^3].

[^2]: The OS can still retrieve metadata since PBI is still providing it, but things which depend on *the browser's* media handling exclusively might struggle.  For instance, Chrome's media window no longer has a source of metadata, so it just shows the page title.

[^3]: Even on Linux, native messaging might not work on some browsers.  From what I can tell it needs to be implemented on a per-browser basis (as was the case for [Librewolf](https://invent.kde.org/plasma/plasma-browser-integration/-/merge_requests/146) and [Waterfox](https://invent.kde.org/plasma/plasma-browser-integration/-/merge_requests/180), for examples).

<figure class="cool-figure">
    <div class="smol-container">
        <img class="smol" src="/assets/images/posts/mediasession/pbi-error-native-host.png" alt="Screenshot of Plasma Browser Integration's popup window, showing an error reading: Failed to connect to the native host.  Make sure the plasma-browser-integration package is installed correctly and that you are running Plasma 5.13 or later.  No such native application org.kde.plsama.browser_integration">
        <img class="smol" src="/assets/images/posts/mediasession/pbi-error-unsupported-os.png" alt="Screenshot of Plasma Browser Integration's popup window, showing an error reading: Unsupported operating system.  This extension is only supported on Linux and FreeBSD.">
    </div>
    <figcaption>PBI's popup window showing errors when failing to connect to the native host, and when running on an unsupported OS</figcaption>
</figure>

In these cases, neither the browser nor PBI will actually produce any metadata, which is a problem.

# Conclusionya~!!
That's about it for all the dragons I've encountered in my short time with the MediaSession API.  Of course, if any of these change (or if I discover any new ones), I'll try to update this post with all the details.

Most of these really are edge cases, in that it's pretty unlikely that *most* end-users (or even developers) will ever encounter them.  But that doesn't mean no one will encounter them, and if this post helps out even one engineer confused about why their code isn't working then my job is done!  No matter how obscure they are, I'm still happy to document them somewhere on the web.

Before I finish out this post, I want to draw your attention to the song I've used throughout this post.  *Velkommen* (most commonly known as the Windows XP out-of-box-experience music) was composed by someone called [Stan LePard](https://en.wikipedia.org/wiki/Stan_LePard), who is known for his musical work for various video games and software packages.  He passed away on 11 February 2021, so I'd like to end by recognising him and his contribution to the industry (and internet culture more broadly).  Thank you Stan!

<hr>

# Sources
## MediaSession API
- MediaSession docs on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession)
- The [W3C standard](https://www.w3.org/TR/mediasession/) and it's [GitHub repo](https://github.com/w3c/mediasession/tree/main)
- [web.dev article on MediaSession](https://web.dev/articles/media-session) by François Beaufort
- [Can I use mediasession?](https://caniuse.com/?search=mediasession)
- [iOS Web Apps and Media Session API](https://dbushell.com/2023/03/20/ios-pwa-media-session-api/) by David Bushell

## Plasma Browser Integration
- [PBI Source Code](https://invent.kde.org/plasma/plasma-browser-integration) on GitLab
- [PBI Bug List](https://bugs.kde.org/buglist.cgi?list_id=1517340&product=plasma-browser-integration) on KDE's bug tracker

<hr>