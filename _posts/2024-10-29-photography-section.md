---
layout: post
title:  "I made a photography section on my website"
date:   2024-10-29
categories: posts
tags: [web, photography]
author: "atctwo"
description: I got a new camera but I didn't have anywhere to share my pictures.  So I made somewhere!
image: /assets/images/posts/photography-section/thumb.png
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
    .cool-figure figcaption {
        font-size: 0.875em;
        color: var(--bs-secondary-color);
    }
    @media (min-width: 767px) {
        .cool-figure img, video {
            height: 400px;
        }
    }
</style>

<!-- excerpt-start --> 

After years of putting it off, I finally got myself a camera!  I've been having lots of fun taking pictures but I didn't really have anywhere to share them.  I didn't really like my options for photography-oriented social media, so I just did it myself, and over-engineered a photography section for my website.  I thought it would be fun to talk about how it works!

<!-- excerpt-end -->

If you're curious, you can find the photography section by using the "Photos" link in the header, or by clicking <a href="/photos/">this link</a>!  I only have a few photo albums up so far, but my intention is to add to it over time.  I'm still learning photography, so I hope my images will get better over time as well!

This post will contain a wee bit of discussion on photography subjects but not much (since I'm still learning after all), and will mostly focus on the web development aspect.  I hope you find it useful, or at least find it enjoyable!

<figure class="cool-figure">
    <img src="/assets/images/posts/photography-section/1.png" alt="Screenshot of the &quot;Belfast&quot; album at the time of writing">
    <figcaption>Screenshot of the &quot;Belfast&quot; album at the time of writing</figcaption>
</figure>

# The New Camera
I'm of course going to use this post as an excuse to talk about my new camera!  I opted for a [Panasonic GX80](https://www.panasonic.com/uk/consumer/cameras-camcorders/lumix-mirrorless-cameras/lumix-g-cameras/dmc-gx80eb.html), mainly because I was looking for a small camera that I could keep in my bag when out and about.  It's a compact mirrorless (ie: not a DSLR) so it's the perfect size!  It does however have a Micro Four Thirds lens mount, so I can swap out the lens if needed.  While it's not the most high end compact camera on the market, it *feels* really fun to use, which is personally more important to me since I'll be more likely to use it more often.

<figure class="cool-figure">
    <img src="/assets/images/posts/photography-section/ooo_tiny_baby.jpg" alt="Picture of my tiny baby camera">
    <figcaption>Picture of my tiny baby camera</figcaption>
</figure>

I only have one lens for now, a [Lumix G Vario HD 12-32mm](https://www.dpreview.com/products/panasonic/lenses/panasonic_12-32_3p5-5p6) pancake zoom lens.  I went for a pancake lens to ensure that it would fit in my bag, and I went with a zoom lens because I don't have much experience with prime (non-zoom) lenses.  I think this lens is pretty good as a starter lens (in fact it was included in many Panasonic camera kits), since it's wide focal length range covers a lot of use cases.

# Image Editing, Processing, and Hosting
I'm still working out my editing workflow since I'm pretty new to photography, but here's what I'm doing for now.  After taking a load of images, I move them into a folder on my computer.  There's one folder for each "event" on each date (for example, a day out in Belfast might have a folder called `26.10.24 Belfast`).

Once the images have been copied, I open them in my editing program.  I usually use free and open source software for everything, so I've been (slowly) learning how to edit my photos in [darktable](https://www.darktable.org/).  Once I've edited all the pictures which I think are good enough, I can export them.  darktable exports pictures to a subdirectory called `darktable_exported` by default which makes sorting exported photos easier.

Next, I move the processed images over to a server.  More specifically, I have a VPS which I use for a few things, running [Caddy](https://caddyserver.com/) as a reverse proxy.  Caddy's actually a really flexible web server, and can be used as [a static file host](https://caddyserver.com/docs/quick-starts/static-files), which is what I'm using to host my images [^1].  The Caddyfile snippet I'm using is as follows:

```caddyfile
# static file host
static.atctwo.net {
	root * /static/
	encode gzip

	file_server
}
```

Images on the static file host are sorted into **albums**, and each album gets it's own page on the website.  These are different from the folders on my computer, which are really meant as a way to organise raw files.  Albums are how edited images are grouped together and *presented* on the photography section of this site.  The idea is that I can create albums with very general criteria which I can add to as time goes on (eg: "Belfast"), but I can also make albums for specific events (eg: "Pride 2025", if I get comfortable taking pictures at events).

Each album gets it's own subdirectory on the static file host, and this is where all the edited photos get copied to.  But that's not the end of the server-side story.  Even after editing, each image is usually thousands of pixels wide and tall (in terms of file size they usually work out around 20 MiB), so it would be unreasonable to embed dozens of these full-resolution files into each album page; it would just take way too long to load.  That's where the [preprocessing script](https://gist.github.com/atctwo/7ed41d155c6e9368b695ba185133e57f) comes in!

This script iterates over each image in the specified folder, and does two main things.  The first, is that it duplicates and resizes each image to a *set* of heights.  I have the script set up to create 400 pixel tall and 1080 pixel tall copies of each image, so by the time the script finishes, each image will have three versions.  Resized images have their height appended to their filenames, as well as the `p` character so that the script knows not to process them if it's run again (otherwise you would be processing the results of the previous processing).

<figure class="cool-figure">
    <img src="/assets/images/posts/photography-section/album_files.png" alt="Screenshot of file listing from one of the albums">
    <figcaption>Screenshot of file listing from one of the albums</figcaption>
</figure>

The 400 pixel versions are small enough to be used as thumbnails on album pages, while the 1080 pixel versions are used as the "full resolution" image on a pop-up lightbox which appears when you click an image.  However the 1080 pixel versions aren't really full resolution, so there's a link to the actual full-res version on the lightbox too (but we'll get to that later)!  This makes load times *much* better.

Anyway, the second thing the script does is that it generates a file called `album.json`.  This file basically acts as an index for that album, providing a big list of the images the album contains, *including URLs for each size of image*.  It also contains info on what the "next" and "previous" images in an album are for each image, and provides a title and description for the album.  Finally, it contains a key called `dates`, the subkeys of which correspond to each day in which pictures in the album were taken.  That's a weird way of phrasing it, but basically it provides a list of images which were taken on each date.

Here is the `album.json` for the Miscellaneous album, at the time of writing:

```jsonc
{
    "title": "Miscellaneous",
    "description": "Pictures that don't really fit into any other album",
    "sorting": "date",
    "images": {
        "P1110487.jpg": {
            "filename": "P1110487.jpg",
            "title": "",
            "description": "",
            "prev": "P1100161.jpg",
            "next": "P1100161.jpg",
            "sizes": {
                "original": "https://static.atctwo.net/photos/misc/P1110487.jpg",
                "400": "https://static.atctwo.net/photos/misc/P1110487_400p.jpg",
                "1080": "https://static.atctwo.net/photos/misc/P1110487_1080p.jpg"
            }
        },
        "P1100161.jpg": {
            "filename": "P1100161.jpg",
            "title": "",
            "description": "",
            "prev": "P1110487.jpg",
            "next": "P1110487.jpg",
            "sizes": {
                "original": "https://static.atctwo.net/photos/misc/P1100161.jpg",
                "400": "https://static.atctwo.net/photos/misc/P1100161_400p.jpg",
                "1080": "https://static.atctwo.net/photos/misc/P1100161_1080p.jpg"
            }
        }
    },
    "dates": {
        "1729461600": [     // dates are specified in UNIX timestamp format
            "P1110487.jpg"
        ],
        "1725055200": [
            "P1100161.jpg"
        ]
    }
}
```

So, what is this JSON file actually used for?  The answer is...

# Generating Album Pages
My intention with this project was that I could just dump my edited pictures onto the server, run a script, and that would be it.  I wanted to avoid having to manually edit any config files or HTML or Markdown.  In particular, I wanted to avoid having to manually create and update pages for each album, as well as having to update the album index page.

This website is built using [Jekyll](https://jekyllrb.com/), and a lot of the content here is actually programmatically generated when the site is built, using Liquid tags.  For example, the [Projects](/projects/) page is automatically generated from [a YAML file](https://github.com/atctwo/atctwo.github.io/blob/web4/_data/projects.yml) describing each project and their metadata.  If I want to add a new project, I don't actually have to edit the Project page, just this data file [^2].  I wanted to do something similar for album pages, but one limitation of this system in Jekyll is that dynamic content can only be built into existing pages; that is, you can't dynamically generate new pages with Liquid.

You can, however, do this with [plugins](https://jekyllrb.com/docs/plugins/)!  Jekyll supports loading plugins written in Ruby, which can do a couple of things, including programmatically generating new pages.  The photography section uses [a custom plugin](https://github.com/atctwo/atctwo.github.io/blob/web4/_plugins/photo_albums.rb) which generates album pages (and the album index) automatically based on the `album.json`s of each album!

To start off with, there's [a data file](https://github.com/atctwo/atctwo.github.io/blob/web4/_data/photos.yml) similar to the one for Projects, which specifies the URLs of the `album.json` file for each album (ok, so there's a *little bit* of config editing, but just a wee bit).  At the time of writing, the data file looks like this:

```yaml
album_urls:
# - https://static.atctwo.net/photos/test/album.json
- https://static.atctwo.net/photos/belfast/album.json
- https://static.atctwo.net/photos/belfast_harbour/album.json
- https://static.atctwo.net/photos/signs/album.json
- https://static.atctwo.net/photos/misc/album.json
```

This list is then read by the custom plugin.  The JSON files at each URL are fetched and parsed.  For each album a new page is created using the [`album.html`](https://github.com/atctwo/atctwo.github.io/blob/web4/_layouts/album.html) layout (template), to which the album data is passed.  At this point, it's up to the album page layout template to decide what to do with the album information, rather than the plugin; the plugin just creates the page and passes the album info to it.

All the album page layout really does is iterate over each image, and create an `<img>` tag with the `src` attribute set to point to the URL of the 400 pixel version.  The way that `<img>` tags are positioned depends on the `sorting` key in each album's metadata, but ultimately they all make use of the same system.  For example, here is how images are added when no sorting scheme is specified:

```html
{% raw %}
<div class="thumb-container">
    {% for image in page.images %}
        <a id="{{image[0]}}">
        <img class="thumb image photo" src="{{image[1].sizes.400}}" 
            data-image='{{image[0]}}'
            onclick="reset_lightbox('{{image[0]}}');"
        >
        </a>
    {% endfor %}
</div>
{% endraw %}
```

You might notice that these image thumbnails are wrapped in an `<a>` tag.  This isn't used for linking anywhere, but is actually used as a *page anchor* for each image.  This allows visitors to copy links to an image, and when you navigate to these links, it actually jumps directly to that image!

The result of this is that each album page is statically generated at build time.  There is zero server-side rendering, and (at least for the thumbnails on album pages) zero client-size processing.  I decided to do it this way so that each album had it's own dedicated HTML file.  If I had have made a single album page which was populated using JavaScript, then that page would be useless without some kind of parameter to specify which album to load.  To me, that sort of defeats the point of statically generating the website.

Having said that, I wanted to implement a lightbox system (so when you click on the image, a bigger version pops up).  I would have no idea how to implement this statically, so from this point I pretty much exclusively used JavaScript 😜

# The Bootstrap Lightbox
At this point in development I had managed to get each image being shown as thumbnails.  However I wanted visitors to be able to see the images in a larger size, at the whim of the visitor.  I decided to go with a lightbox system.  These are found all over the internet; when you click on a small image, a larger version of the image is drawn over most of the screen, with the background dimming to highlight the image.  There are a lot of lightbox templates available online that I could have used, but I didn't like any of them.  Specifically, I wanted to be able to display image metadata beside the image within the lightbox itself, and I couldn't find any templates that did this.  So, again, I did it myself!

My implementation is based off [Bootstrap Modals](https://getbootstrap.com/docs/5.3/components/modal/).  When an image is clicked, it calls a JS function called `reset_lightbox(image_str)`, where image_str is set to the filename of the image to load (you can see the `onclick` handler in the HTML snippet above!).  This function looks up the filename in the data received from the Ruby plugin, and if it matches an image in the album, it sets the `src` element of the image in the modal to the URL of the 1080 pixel version of the image.

Before the modal is shown to the visitor, the function tries to extract the image's metadata.  This is done by parsing the image's EXIF data using the [exif-js](https://github.com/exif-js/exif-js) library.  It tries to parse technical information like shutter speed, ISO, aperture, focal length, and a few other things including image description.  This data is then inserted into the appropriate fields on the modal, below the image.  If values for each field aren't available in the EXIF data, then the field is hidden.

Two additional values which are parsed are latitude and longitude- the image's geolocation.  My cool new camera doesn't have GPS so I have to manually add geotagging info to each image manually, but I don't mind too much.  It works out pretty well since I don't always want location data on my images (it's fine if it's in a public location but less ideal if it's at my house or something), so it's effectively opt-in!  Anyway, the raw latitude and longitude values are displayed along with other metadata, but these values are also used to render a little interactive [slippy map](https://wiki.openstreetmap.org/wiki/Slippy_map)!  The map engine used is [OpenStreetMap](https://www.openstreetmap.org), implemented using the *really* easy to use [Leaflet](https://leafletjs.com/) library.

<figure class="cool-figure">
    <img src="/assets/images/posts/photography-section/lightbox.png" alt="Screenshot of the custom lightbox">
    <figcaption>Screenshot of the custom lightbox</figcaption>
</figure>

Also, the lightbox supports keyboard shortcuts!  You can navigate between images using the <kbd>ArrowLeft</kbd> and <kbd>ArrowRight</kbd> keys, and you can close the lightbox using the <kbd>Esc</kbd> key.  This is done using an event listener registered for key events.

When either of the arrow keys are pressed, it stores the filename of the image to show (it knows this by using the `next` and `prev` keys of the current image data, as determined by the preprocessing script!), then it hides the modal.  Once the modal is hidden, `reset_lightbox()` is called with the new image, and the modal is updated and shown again.  This means that the modal disappears then reappears, which looks a lot nicer than the contents of the modal just changing with no transition.

When Escape is pressed, the resulting process is much simpler - it just invokes the `hide()` method of the modal!

The code for this is shown below; it's cleaned up a little from the code which actually runs but it still shows what's happening:

```js
const modal_lightbox_div = document.getElementById("lightbox-modal");
const modal_lightbox = new bootstrap.Modal(modal_lightbox_div);


modal_lightbox_div.addEventListener("hidden.bs.modal", event => {
    if (reset_after_hide != null) {
        reset_lightbox(reset_after_hide);
        reset_after_hide = null;
    }
});


// keyboard shortcuts
document.addEventListener("keydown", event => {

    // nav left (left arrow)
    if (event.keyCode == 37) {
        if (prev_image_id != "") {
            reset_after_hide = prev_image_id;
            modal_lightbox.hide();
        }
    }

    // nav right (right arrow)
    if (event.keyCode == 39) {
        if (next_image_id != "") {
            reset_after_hide = next_image_id;
            modal_lightbox.hide();
        }
    }

    // close (esc)
    if (event.keyCode == 27) {
        modal_lightbox.hide();
    }

})
```

Finally, recall in the last section I mentioned that when you copy a link to an image, it jumps straight to that image on the page.  Well, it actually opens the image in the lightbox as well!  The jumping behaviour is implemented by the web browser, but this feature is implemented in JavaScript.  When the page loads, if there is an image specified in the URL then it calls `reset_lightbox()` with that image.  Easy peasy!

```js
// little bit of code to open image if one is specified in url
let hash = window.location.hash;
if (hash != "") {
    let image = hash.substring(1); // remove '#' from image id
    console.log("jumping to image", image);

    // check if specified image is in this album
    if (image in images) {
        reset_lightbox(image);
    }
}
```

# Conclusion
So, there's a quick-ish overview of how the photo section works!  While I definitely did not need to go to this effort to share my photos online, it was fun!  A lot of it was stuff I had done before (ie: this website) although I did learn some things about the technical side of photography (for example, how EXIF data works)!  But most importantly it was an enjoyable and kind of therapeutic experience.  It was a low-stakes side project I could do in my spare time, which provided a nice break from my main work (in which I have no idea what I'm doing).

One of the reasons I hesitated to buy a camera for years was that I was worried that I would never use it.  That's why I bought a compact camera, so that I could bring it with me and spontaneously take pictures.  I think this photo section will encourage me to keep practising my new hobby too!

<hr>

[^1]: This site is actually hosted on GitHub Pages, but there are [limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github) on how big your repository and it's files can be.  Since photos can be pretty big (even the JPEG versions) I decided to use an external static file host, and naturally I decided to self-host it.

[^2]: I should also mention that this is all done at build time.  The entire site is regenerated when a change is pushed to the GitHub repository, then the new version is statically served.  There is no server-side rendering!