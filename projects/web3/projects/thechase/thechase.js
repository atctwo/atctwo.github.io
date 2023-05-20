positions = [1, 1, 1, 1, 1, 1, 1];
player_position = 2;
chaser_position = 0;
player_answer = -1;
chaser_answer = -1;
right_answer = -1;
lock_timer = -1;
chkbox_sound = false;
money = 5000;

sounds = {

    lock_player: new sound("audio/h2h_lock_player.mp3"),
    lock_chaser: new sound("audio/h2h_lock_chaser.mp3"),
    fiveseclock: new sound("audio/h2h_5seclock.mp3"),
    player_answer: new sound("audio/h2h_player_answer.mp3"),
    chaser_answer: new sound("audio/h2h_chaser_answer.mp3"),
    right_answer: new sound("audio/h2h_correct_answer.mp3"),
    player_moves: new sound("audio/h2h_player_moves.mp3"),
    chaser_moves: new sound("audio/h2h_chaser_moves.mp3")

}

/*
sounds = {

    lock_player: new Howl({src: ["audio/h2h_lock_player.mp3"]}),
    lock_chaser: new Howl({src: ["audio/h2h_lock_chaser.mp3"]})

}
*/

//from w3schools (https://www.w3schools.com/graphics/game_sound.asp)
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        if (chkbox_sound)
        {
            this.sound.currentTime = 0;
            this.sound.play();
        }
    }
    this.stop = function(){
        if (chkbox_sound) this.sound.pause();
    }
  }

function displayMainMenu(thing, callback=null)
{
    //if thing is false, the main menu is hidden
    //if thing is true, the main menu is shown

    function hidemenu()
    {
        console.log("eee");
        mainmenu.style.display = "none";
        if (callback) callback();
        mainmenu.removeEventListener("transitionend", hidemenu);
    }

    var mainmenu = document.getElementById("main-menu");

    if (thing) //show menu
    {
        mainmenu.style.display = "block";
        setTimeout(function(){mainmenu.style.opacity = 1;}, 10);
        if (callback) callback();
    }
    else //hide menu
    {
        mainmenu.addEventListener("transitionend", hidemenu);
        mainmenu.style.opacity = "0";
    }
}

function displayAboutMenu(thing, callback=null)
{
    //if thing is false, the main menu is hidden
    //if thing is true, the main menu is shown

    function hidemenu()
    {
        console.log("eee");
        aboutmenu.style.display = "none";
        if (callback) callback();
        aboutmenu.removeEventListener("transitionend", hidemenu);
    }

    var aboutmenu = document.getElementById("about-menu");

    if (thing) //show menu
    {
        aboutmenu.style.display = "block";
        setTimeout(function(){aboutmenu.style.opacity = 1;}, 10);
        if (callback) callback();
    }
    else //hide menu
    {
        aboutmenu.addEventListener("transitionend", hidemenu);
        aboutmenu.style.opacity = "0";
    }
}

function displayEEE(thing, callback=null)
{
    //if thing is false, the main menu is hidden
    //if thing is true, the main menu is shown

    function hidemenu()
    {
        table.style.display = "none";
        qthing.style.display = "none";
        if (callback) callback();
        table.removeEventListener("transitionend", hidemenu);
    }

    var table = document.getElementById("chase-table");
    var qthing = document.getElementById("qthing");

    if (thing) //show menu
    {
        table.style.display = "block";
        qthing.style.display = "block";

        setTimeout(function(){
            table.style.opacity = 1;
            qthing.style.opacity = 1;
        }, 10);

        if (callback) callback();
    }
    else //hide menu
    {
        table.addEventListener("transitionend", hidemenu);
        table.style.opacity = "0";
        qthing.style.opacity = "0";
    }
}

function aboutMenu(thing)
{
    //if thing is false, the about menu is shown
    //if thing is true, the about menu is hidden

    var mainmenu = document.getElementById("main-menu");
    var aboutmenu = document.getElementById("about-menu");

    if (thing) //hide about menu
    {
        displayAboutMenu(false, function() {
            displayMainMenu(true);
        });
    }
    else //show about menu
    {
        displayMainMenu(false, function() {
            displayAboutMenu(true);
        })
    }
}

function updTable()
{
    for (var i = 1; i < 8; i++)
    {

        pos = document.getElementById("pos" + i.toString());
        console.log(pos);
        switch(positions[i-1])
        {
            case 0: //passed by chaser
                pos.style.backgroundColor = "red";
                break;

            default:
            case 1: //not passed
                pos.style.backgroundColor = "blue";
                break;

            case 2: //passed by player
                pos.style.backgroundColor = "cyan";
                break;
        }
        if (i < 8 && i == player_position + 1) pos.innerHTML = "<span class='centre'>⮞ £" + money.toString() + " ⮜</span>"
        else pos.innerHTML = "";
    }
}

function beginTheChase()
{
    var menu = document.getElementById("main-menu");

    function eeeeehelpme()
    {
        if   (menu.style.display == "none") menu.style.display = "normal";
        else menu.style.display = "none";

        menu.removeEventListener("transitionend", eeeeehelpme);

        player_position = 2;
        chaser_position = 0;
        chkbox_sound = document.getElementById("chkbox_sound").checked;

        setupTable();
        setupChase();
    }

    menu.addEventListener("transitionend", eeeeehelpme);
    menu.style.opacity = "0";
}

function setupTable()
{
    positions = [2, 2, 1, 1, 1, 1, 1];
    updTable();
}

function lockout()
{
    if (player_answer == -1) 
    {
        document.getElementById("qbox").innerHTML = "<span class='vertical-aligned-span'>You took too long, and were locked out!</span>";
        player_answer = -2;
    }
    if (chaser_answer == -1) 
    {
        document.getElementById("qbox").innerHTML = "<span class='vertical-aligned-span'>The Chaser took too long, and was locked out!</span>";
        chaser_answer = -2;
    }
    waitForResponsesFlag = false;
    showAnswers();
}

function setupChase()
{
    

    setUpQbox(function(ans_index) {

        //show table and qbox
        document.getElementById("qthing").style.display = "grid";
        document.getElementById("chase-table").style.display = "grid";

        setTimeout(function() {
            document.getElementById("qthing").style.opacity = 1;
            document.getElementById("chase-table").style.opacity = 1;
        }, 10);
        

        //hide player names
        document.getElementById("name_player").style.visibility = "hidden";
        document.getElementById("name_chaser").style.visibility = "hidden";

        var ans1 = document.getElementById("ans1");
        var ans2 = document.getElementById("ans2");
        var ans3 = document.getElementById("ans3");

        [ans1, ans2, ans3].forEach(function(ans_i, i) {

            ans_i.style.backgroundColor = "#155467";
            ans_i.style.borderColor = "grey";
            ans_i.style.backgroundImage = "none";

        });

        //reset answer variables
        player_answer = -1;
        chaser_answer = -1;
        right_answer = ans_index;

        //reset timeout ids
        lock_timer = -1;

        //update table colours
        updTable();

        //set chaser timeout
        setTimeout(function() {

            //if chance.js picks a number from 1 to 100 that is less than 95, assume that the chaser picked the right answer.
            //otherwise, assume they picked one of the wrong answers (which one they picked is chosen at random)
            if (chance.integer({min:1, max:100}) < 75) chaser_answer = right_answer;
            else chaser_answer = chance.pickone([0, 1, 2].splice(ans_index));

            //play chaser answer sound
            sounds.lock_chaser.play();

            //show the name box for chaser
            document.getElementById("name_chaser").style.visibility = "visible";

            //start 5 second lock period
            if (player_answer == -1)
            {
                clearTimeout(lock_timer);
                lock_timer = setTimeout(lockout, 5000);
            }

            if (player_answer == -1) sounds.fiveseclock.play();
            else sounds.fiveseclock.stop();

        }, chance.integer({min: 10, max: 3000}));

        //set player answer button behaviour
        [ans1, ans2, ans3].forEach(function(ans_i, i) {

            ans_i.onmouseenter = function() {
                //if player hasn't chosen an answer, highlight the button
                if (player_answer == -1) ans_i.style.backgroundColor = "blue";
            }
    
            ans_i.onmouseleave = function() {
                //if player hasn't chosen an answer, unhighlight the button
                if (player_answer == -1) ans_i.style.backgroundColor = "#155467";
            }
    
            ans_i.onclick = function() {
                if (player_answer == -1)
                {
                    //set player answer
                    player_answer = i;

                    //set answer box colour to cyan
                    ans_i.style.backgroundColor = "#00ccff";

                    //play player answer sound
                    sounds.lock_player.play();

                    //show player name box
                    document.getElementById("name_player").style.visibility = "visible";

                    //start 5 second lock period
                    clearTimeout(lock_timer);
                    lock_timer = setTimeout(lockout, 5000);

                    if (chaser_answer == -1) sounds.fiveseclock.play();
                    else sounds.fiveseclock.stop();

                    
                    
                }

            }

        });

        

    });
}



function showAnswers()
{
    clearTimeout(lock_timer);
    if (player_answer >= 0 && chaser_answer >= 0)
    sounds.fiveseclock.stop();

    var ans1 = document.getElementById("ans1");
    var ans2 = document.getElementById("ans2");
    var ans3 = document.getElementById("ans3");

    //after 2 seconds, show "the correct answer is" prompt
    //after 4 seconds, show the correct answer in green
    //after 7 seconds, show "the chase put" prompt
    //after 9 seconds, show the chaser's answer
    //after 14 seconds, figure out what to do next
    //nested setTimeouts probably aren't a good idea
    setTimeout(function() {

        document.getElementById("qbox").innerHTML = "<span class='vertical-aligned-span'>The correct answer is...</span>";

        setTimeout(function() {

            [ans1, ans2, ans3][right_answer].style.backgroundColor = "#00ff66";
            sounds.right_answer.play();
            var status = "You were wrong.  You stay still";
            if (player_answer == right_answer)
            {
                status = "You got it right! You move closer to home by one step";
                setTimeout(function() {
                    positions[player_position] = 2;
                    player_position++;
                    updTable();
                    sounds.player_moves.play();
                }, 1646);
            }

            //if the player made it home
            if (player_position >= 6)
            {
                document.getElementById("qbox").innerHTML = "<span class='vertical-aligned-span'>You made it home!</span>";
                setEndgameChoices();
            }
            else
            {

                document.getElementById("qbox").innerHTML = "<span class='vertical-aligned-span'>The correct answer is...<br>"+status+"</span>";

                setTimeout(function() {

                    document.getElementById("qbox").innerHTML = "<span class='vertical-aligned-span'>The Chaser put...</span>";

                    setTimeout(function() {

                        [ans1, ans2, ans3][chaser_answer].style.borderColor = "#990000";
                        sounds.chaser_answer.play();
                        status = "The Chaser got it wrong!  They stay still";
                        if (chaser_answer == right_answer)
                        {
                            status = "The Chaser got it right.  They move one step forwards";
                            setTimeout(function() {
                                positions[chaser_position] = 0;
                                chaser_position++;
                                updTable();
                                sounds.chaser_moves.play();
                            }, 1985);
                        }
                        document.getElementById("qbox").innerHTML = "<span class='vertical-aligned-span'>The Chaser put...<br>"+status+"</span>";
                        

                        //next round
                        setTimeout(function() {
                            //if the player has been caught
                            if (chaser_position > player_position)
                            {
                                document.getElementById("qbox").innerHTML = "<span class='vertical-aligned-span'>You have been caught by the Chaser!</span>";
                                setEndgameChoices();
                            }
                            else setupChase();

                        }, 5000);

                    }, 2000);

                }, 3000);

            }

        }, 2000);

    }, 2000);
}

function setEndgameChoices()
{
    var ans1 = document.getElementById("ans1");
    var ans2 = document.getElementById("ans2");
    var ans3 = document.getElementById("ans3");

    [ans1, ans2, ans3].forEach(function(ans_i, i) {

        ans_i.style.backgroundColor = "#155467";
        ans_i.style.borderColor = "grey";

    });

    ans1.innerHTML = "<span class='vertical-aligned-span'>Return to main menu</span>";
    ans2.innerHTML = "<span class='vertical-aligned-span'>Replay</span>";
    ans3.innerHTML = "<span class='vertical-aligned-span'></span>";

    player_answer = -1;

    ans1.onclick = function(){
        displayEEE(false, function() {
            displayMainMenu(true);
        });
    };
    ans2.onclick = function(){
        player_position = 2;
        chaser_position = 0;
        setupTable();
        setupChase();
    };
    if (player_position >= 6)
    {
        ans3.style.backgroundImage = "url('dog.png')";
        ans3.style.backgroundSize = "100%";
        ans3.style.backgroundPosition = "right 75%";

        ans3.onclick = function(){
            window.open("https://www.youtube.com/watch?v=FAbZ13fW1tg");
        };
    }
    else
    {
        ans3.onclick = function() {
            //nop
        }
    }
    
}