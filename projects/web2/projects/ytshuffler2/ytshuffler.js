const playlistID = "PL6KbZCib25EReub6cYiwkUmoLSANP69eg";
const keyvar = "AIzaSyDS0zKPXTDmJ5_A1zdbUktIeAjcVY--NBQ";
var autoplay = 1
var loop = 0

const {google} = require('googleapis');
const youtube = google.youtube('v3');

var params = 
{
    key: keyvar,
    playlistId: playlistID,
    part: "snippet,contentDetails",
    maxResults: "30"
}


youtube.playlistItems.list(params, function(err, response) {
    if (err) 
    {
      console.log('The API returned an error: ' + err);
      return;
    }
    rItems = response.data.items
    /*for (var video in rItems)
    {
        console.log(rItems[video].snippet.title);
        idThingy = (rItems[video].contentDetails.videoId);
        console.log("https://www.youtube.com/embed/"+idThingy);
    }*/
    popisdead = Math.floor((Math.random()*rItems.length))
    idThingy=(rItems[popisdead].contentDetails.videoId)
    console.log("https://www.youtube.com/embed/"+idThingy+"?autoplay="+autoplay+"&loop="+loop);
});