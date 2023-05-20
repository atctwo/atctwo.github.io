'''
YouTube Playlist Shuffler
by atctwo

Credits:
pantuts and robgibbons - youParse.py (which I modified slightly (line 54))
'''

#!/usr/local/bin/python3.6

#Import required modules
from youParse import crawl
from random import shuffle
import cgi,cgitb

#Retreive stuff from forms
form=cgi.FieldStorage()
url=form.getvalue("playlist-url")
autoplay=form.getvalue("autoplay")

#declare variables
urls=[]

#Get URLs
if (url):
	url_flag=1
	urls=crawl(url)
else:
	url_flag=0
	
#Get autoplay info
if (autoplay):
	autoplay_flag=1
else:
	autoplay_flag=0
    
#Shuffle URLs
shuffle(urls)

#Print HTML
print ("Content-type:text/html")
print()
print ("<html>")
print ('<head>')
print ('<title>YouTube Playlist Shuffler</title>')
print ('</head>')
print ('<body>')
print("<h1>YouTube Playlist Shuffler</h1>")
if (not url_flag):
	print("<p>You actually have to input a valid playlist URL.  You may want to try again.</p>")
else:
	print("<p>Watching playlist <b>%s</b>.</p>"%url)
	print("<p>Autoplay is <b>%s</b></p>"%autoplay)
	print ('<iframe width="800" height="400"src="https://www.youtube.com/embed/{0}?autoplay={1}"></iframe>'.format(urls[0].replace("://www.youtube.com/watch?v=","").replace("https","").replace("http",""),autoplay_flag))
	print("<br><button class='button' style='height:100;width:800px' onClick='window.location.reload()'>Shuffle!</button>")
print ('</body>')
print ('</html>')