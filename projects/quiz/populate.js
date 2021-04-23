
button_colours = [
    "#05668D",
    "#028090",
    "#00A896",
    "#02C39A"
];

window.score = 0;
window.answered = false;
window.token = "";

getSessionToken(function(res) {

    console.log("retrieved session token");
    window.token = res.token;

}, function() {

    console.log("failed to get session token");

});

function title_easter_egg()
{
    document.getElementById("title").style.color = chance.color();
}

function populateQuestionBox()
{
    var question_box = document.getElementById("question-box");

    var difficulty = document.getElementById("difficulty").value;
    var category = document.getElementById("category").value;

    if (difficulty === "any") difficulty = null;
    if (category === "any") category = null;

    getQuestion(difficulty, category, window.token, function(res) {

        switch(res.response_code)
        {
            case 0: // success

                // show question
                question = res.results[0];
                question_box.style.display = "";
                question_box.style.borderColor = "blue";
                question_box.innerHTML = question.question;

                // shuffle answers
                answers = [];
                answers.push(question.correct_answer);
                answers = answers.concat(chance.pickset(question.incorrect_answers, 3));
                answers = chance.shuffle(answers);
                window.correct_answer = answers.indexOf(question.correct_answer);
                window.selected_ans = -1;

                // show answers
                for (var i = 0; i <= 3; i++)
                {
                    var answer_btn = document.getElementById("answer" + i);
                    answer_btn.style.display = "block";
                    answer_btn.style.backgroundColor = "transparent";
                    answer_btn.onclick = function(event) {

                        // set the background colour of the selected button
                        var element = event.path[0];
                        var thing = element.id.substr( element.id.length - 1 );
                        window.selected_ans = parseInt(thing);
                        if (thing == "0") element.style.backgroundColor = "#028090";
                        if (thing == "1") element.style.backgroundColor = "#00A896";
                        if (thing == "2") element.style.backgroundColor = "#02C39A";
                        if (thing == "3") element.style.backgroundColor = "#02C39A";

                        // set the background colour of the non-selected buttons
                        for (var j = 0; j <= 3; j++)
                        {
                            console.log(thing, j, ("answer" + j));
                            if (j !== parseInt(thing)) document.getElementById("answer" + j).style.backgroundColor = "transparent";
                        }
                    };
                    answer_btn.style.borderColor = button_colours[i];
                    answer_btn.innerHTML = answers[i];
                }

                // show check answer button
                //document.getElementById("check_answer").style.display = "block";
                window.answered = false;

                break;

            case 1: // no results
                question_box.style.display = "";
                question_box.style.borderColor = "darkmagenta";
                question_box.innerHTML = "No questions were returned.";
                break;

            case 2: // invalid parameter
                question_box.style.display = "";
                question_box.style.borderColor = "darkmagenta";
                question_box.innerHTML = "Invalid parameters.";
                break;

            case 3: // token not found
                question_box.style.display = "";
                question_box.style.borderColor = "darkmagenta";
                question_box.innerHTML = "Token not found (stored token = " + window.token + ").  Try refreshing the page.";
                break;

            case 4: // token empty
                question_box.style.display = "";
                question_box.style.borderColor = "darkmagenta";
                if (category) question_box.innerHTML = "You've been asked all of the questions in this category!  Refresh the page to reset the session token, or pick a different category.";
                else question_box.innerHTML = "You've been asked all of the questions in the database!  Please refresh the page to reset the session token.";
                for (var i = 0; i < 4; i++) document.getElementById("answer" + i.toString()).style.display = "none";
                break;
        }

    }, function(error) {

        question_box.style.display = "";
        question_box.style.borderColor = "red";
        question_box.innerHTML = "An error occurred.  HTTP status" + error;

    });
}

function checkAnswer()
{
    console.log("check answer")
    if (!window.answered)
    {
        var correct_answer_btn = document.getElementById("answer" + window.correct_answer);
        correct_answer_btn.style.backgroundColor = "green";
        correct_answer_btn.style.borderColor = "green";

        if (window.correct_answer == window.selected_ans) 
        {
            window.score++;
            document.getElementById("score").innerText = "Score: " + window.score;
        }
        window.answered = true;
    }
}