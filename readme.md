# atctwo's site

[![Deploy Jekyll site to Pages](https://github.com/atctwo/atctwo.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/atctwo/atctwo.github.io/actions/workflows/jekyll.yml)

This repository has the source code for my website [atctwo.net](https://atctwo.net)!  It's built using HTML5, Bootstrap, and a little bit of JavaScript.  It's a static site generated using Jekyll, hosted on GitHub Pages, and uses a custom Jekyll theme called [atctheme](https://github.com/atctwo/atctheme).  Most of the website's functionality is implemented in this theme but some atctwo.net-specific parts are implemented here.

# Building
This site is built using Jekyll 4.  First, make sure all the plug-ins and dependencies are installed by running `bundle install`.  To run the site locally for testing, run
```
jekyll serve -H 0.0.0.0 -P 8000
```

# Credits and Inspiration
This website uses a number of assets created by other people.  Since most assets are part of atctheme, check out [its credit section](https://github.com/atctwo/atctheme?tab=readme-ov-file#credits) for full credits!  For this site specifically though:
- Social icons and most technology icons were provided by [Simple Icons](https://simpleicons.org/)
- Comments for blog posts are implemented using [Remark42](https://remark42.com/)
- Favicons were generated using [Real Favicon Generator](https://realfavicongenerator.net/)

The design of this website was inspired by a number of other websites, from personal blogs to organisation sites.  Here is a non-exhaustive list of sites that inspired this one:
- [Stargirl Flowers](https://thea.codes/)
- [Julia Evans](https://jvns.ca/)
- [foosel.net](https://foosel.net/blog/)