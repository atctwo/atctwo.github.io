function getQuestion(callback)
{
    var http = new XMLHttpRequest();
	http.open("POST", "https://opentdb.com/api.php?amount=1&type=multiple", true);
	http.send();
	
	http.onreadystatechange = function(e) {
		if (http.readyState == 4 && http.status == 200) 
		{
			console.log("Got response from server");
			q = JSON.parse(http.responseText);
            console.log(q);
            callback(q)
		}
		if (http.readyState == 4 && http.status == 403)
		{
			console.error("Couldn't fetch question");
		}
	} 
}

function setUpQbox(callback)
{
    getQuestion(function (question) {

        if (question != null)
        {
            //get qbox and answer boxes
            var qbox = document.getElementById("qbox");
            var ans1 = document.getElementById("ans1");
            var ans2 = document.getElementById("ans2");
            var ans3 = document.getElementById("ans3");

            //question
            qbox.innerHTML = "<span class='vertical-aligned-span'>"+question.results[0].question+"</span>";

            //answers
            answers = [];
            answers.push(question.results[0].correct_answer);
            answers = answers.concat(chance.pickset(question.results[0].incorrect_answers, 2));
            answers = chance.shuffle(answers);

            console.log(answers);

            ans1.innerHTML = "<span class='vertical-aligned-span'>"+answers[0]+"</span>";
            ans2.innerHTML = "<span class='vertical-aligned-span'>"+answers[1]+"</span>";
            ans3.innerHTML = "<span class='vertical-aligned-span'>"+answers[2]+"</span>";

            ans_index = answers.indexOf(question.results[0].correct_answer);

            //call callback
            if (callback) callback(ans_index);
        }
        else console.log("Question was null");

    });
}