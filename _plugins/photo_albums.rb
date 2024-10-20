require 'net/http'
require 'json'

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
    return str.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
end

module PhotoAlbums
    class AlbumGenerator < Jekyll::Generator
  
        def generate(site)

            page_dir = "/photos/"
            album_data = []

            # create album pages
            site.data["photos"]["album_urls"].each do |album_url|

                puts "Creating album page for #{album_url}"

                # perform http request
                response_obj = fetch(album_url)
                if response_obj.code != "200"

                    puts "- http status #{response_obj.code}"

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

                    # create page
                    site.pages << Jekyll::PageWithoutAFile.new(site, site.source, page_dir, page_name).tap do |file|
                        file.content = page_content
                        file.data.merge!(
                            "layout"        => "album",
                            "sitemap"       => false,
                            "title"         => page_title,
                            "album_title"   => response["title"],
                            "album_desc"    => response["description"],
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
  