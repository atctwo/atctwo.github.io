'''
atctwo.net photo album generator!
=================================

this Jekyll plugin creates photo album pages, as well as an index page.
it looks for a list of URLs in a site data file called `photos`.  these
URLs should point to album.json files for each album to create pages for

these json files are created for a directory of images by using the
accompanying preprocessing script:
    https://gist.github.com/atctwo/7ed41d155c6e9368b695ba185133e57f

for each album, this plugin will create a page using the `album.html`
layout, setting the page variable `images` to the hash of images
contained within the album.json files

for reference usage, check out the source code for atctwo.net:
    https://github.com/atctwo/atctwo.github.io

i made a writeup on how atctwo.nets photo section works, it includes
a description of how this plugin is used in practice:
    https://atctwo.net/2024/10/29/photography-section.html

'''


require 'net/http'
require 'json'

# fetch the contents of a file from it's URL (over HTTP)
# specifically following redirects
# from https://stackoverflow.com/a/6934503
def fetch(uri_str, limit = 10)
    # You should choose better exception.
    raise ArgumentError, 'HTTP redirect too deep' if limit == 0
  
    url = URI.parse(uri_str)
    req = Net::HTTP::Get.new(url.path, { 'User-Agent' => 'Mozilla/5.0 (etc...)' })
    response = Net::HTTP.start(url.host, url.port, use_ssl: true) { |http| http.request(req) }
    case response
    when Net::HTTPSuccess     then response
    when Net::HTTPRedirection then fetch(response['location'], limit - 1)
    else
      response.error!
    end
end

# make a string friendly for use in a url
# from https://stackoverflow.com/a/4308399
def slugify(str)
    return str.downcase.strip.gsub(' - ', ' ').gsub(' ', '-').gsub(/[^\w-]/, '')
end

module PhotoAlbums
    class AlbumGenerator < Jekyll::Generator
  
        def generate(site)

            page_dir = "/photos/"   # base path for album pages
            album_data = []         # thingy for creating album index later

            # create album pages
            site.data["photos"]["album_urls"].each do |album_url|

                Jekyll.logger.info "photo_albums.rb:", "Creating album page for #{album_url}"

                # perform http request
                response_obj = fetch(album_url)
                if response_obj.code != "200"

                    Jekyll.logger.warn "photo_albums.rb:", "- problem fetching album.json, http code #{response_obj.code}"

                else

                    # parse response
                    response = JSON.parse(response_obj.body)
                    page_content = "<a href='/photos/'>Return to index</a>"
                    page_title = response["title"]
                    page_name = slugify(response["title"]) + ".html"

                    # response["images"].each do |j, img|
                    #     page_content.concat(img["filename"])
                    #     page_content.concat("<br>")
                    # end

                    # store album data for making index
                    album_data.append(response)

                    # create page, setting page variables
                    site.pages << Jekyll::PageWithoutAFile.new(site, site.source, page_dir, page_name).tap do |file|
                        file.content = page_content
                        file.data.merge!(
                            "layout"        => "album",
                            "sitemap"       => false,
                            "title"         => page_title,
                            "description"   => response["description"],
                            "image"         => response["cover_image"] || response["images"][response["images"].keys[-1]]["sizes"]["1080"],
                            "album_title"   => response["title"],
                            "album_desc"    => response["description"],
                            "sorting"       => response["sorting"] || "date",
                            "images"        => response["images"],
                            "dates"         => response["dates"],
                            "hide_title"    => true,
                            "main_content_class" => "",
                        )
                        file.output
                    end
                    
                end
            end

            # create index page
            site.pages << Jekyll::PageWithoutAFile.new(site, site.source, page_dir, "index.html").tap do |file|
                file.content = ""
                file.data.merge!(
                    "layout"        => "album_index",
                    "sitemap"       => false,
                    "title"         => "Photos",
                    "albums"        => album_data,
                )
                file.output
            end


        end
    end
  end
  