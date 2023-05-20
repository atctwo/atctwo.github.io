var autoplay = 1
var loop = 0

var ytpl = require('ytpl');
 
ytpl('PL6KbZCib25EReub6cYiwkUmoLSANP69eg', function(err, playlist) {
    if(err) throw err;
    console.log("YouTube Playlist Shuffler - JavaScript edition")
    console.log("Playlist name:    "+playlist.title)
    console.log("Number of videos: "+playlist.total_items)
    console.log("Uploader:         "+playlist.author.user)
    popisdead = Math.floor((Math.random()*playlist.items.length))
    idThingy = playlist.items[popisdead].id
    console.log("https://www.youtube.com/embed/"+idThingy+"?autoplay="+autoplay+"&loop="+loop)
});