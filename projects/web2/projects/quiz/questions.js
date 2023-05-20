function getQuestion(difficulty, category, token, success_callback, error_callback)
{
    var req = "https://opentdb.com/api.php?amount=1&type=multiple";
    if (difficulty) req += "&difficulty=" + difficulty;
	if (category) req += "&category=" + category;
	if (token) req += "&token=" + token;

    console.log("getting question: ", req);

    var http = new XMLHttpRequest();
	http.open("POST", req, true);
	http.send();

	http.onprogress = function(event) {

		console.log(((event.loaded / event.total) * 100) + "%");

	};
	
	http.onreadystatechange = function(e) {
		if (http.readyState == 4 && http.status == 200) 
		{
			console.log("Got response from server");
			q = JSON.parse(http.responseText);
            console.log(q);
            success_callback(q)
		}
		if (http.readyState == 4 && http.status == 403)
		{
            console.error("Couldn't fetch question");
            error_callback(http.status);
		}
	} 
}

function getSessionToken(success_callback, error_callback)
{
    var req = "https://opentdb.com/api_token.php?command=request";

    console.log("getting question: ", req);

    var http = new XMLHttpRequest();
	http.open("POST", req, true);
	http.send();
	
	http.onreadystatechange = function(e) {
		if (http.readyState == 4 && http.status == 200) 
		{
			console.log("Got response from server");
			q = JSON.parse(http.responseText);
            console.log(q);
            success_callback(q)
		}
		if (http.readyState == 4 && http.status == 403)
		{
            console.error("Couldn't fetch session token");
            error_callback(http.status);
		}
	} 
}