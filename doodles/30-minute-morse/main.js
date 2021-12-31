
morse_table = {
    "a": "·-",
    "b": "-···",
    "c": "-·-·",
    "d": "-··",
    "e": "·",
    "f": "··-·",
    "g": "--·",
    "h": "····",
    "i": "··",
    "j": "·---",
    "k": "-·-",
    "l": "·-··",
    "m": "--",
    "n": "-·",
    "o": "---",
    "p": "·--·",
    "q": "--·-",
    "r": "·-·",
    "s": "···",
    "t": "-",
    "u": "··-",
    "v": "···-",
    "w": "·--",
    "x": "-··-",
    "y": "-·--",
    "z": "--··",
    "1": "·----",
    "2": "··---",
    "3": "···--",
    "4": "····-",
    "5": "·····",
    "6": "-····",
    "7": "--···",
    "8": "---··",
    "9": "----·",
    "0": "-----",
}

/**
 * Adds a morse character to the input
 * @param {*} char true for dot, false for dash
 */
function add_morse_character(char)
{
    var morse_input = document.getElementById("input");

    if (char) // add a dot
    {
        morse_input.innerText += "·"
    }
    else // add a dash
    {
        morse_input.innerText += "-"
    }
}

function check_morse()
{
    var roman_letter = document.getElementById("current-letter").innerText.toLowerCase();
    var morse_letter = document.getElementById("input").innerText;
    var answer = morse_table[roman_letter];

    var answer_status = document.getElementById("answer-status");
    if (morse_letter == answer)
    {
        answer_status.style.color = "green";
        answer_status.innerText = "You got it right!"
    }
    else
    {
        answer_status.style.color = "red";
        answer_status.innerText = "Not quite!"
    }
}

function reset_letter()
{
    var letters = Object.keys(morse_table)
    var letter = letters[getRandomInt(letters.length)]

    // show new random letter
    document.getElementById("current-letter").innerText = letter.toUpperCase();
    if (letter == "e") document.getElementById("current-letter").classList.add("e")
    else document.getElementById("current-letter").classList.remove("e")


    // clear input
    document.getElementById("input").innerText = "";

    // clear answer status
    document.getElementById("answer-status").innerText = "\u200b";
}

function input_backspace()
{
    var thing = document.getElementById("input");
    thing.innerText = thing.innerText.substring(0, thing.innerText.length-1)
}

function reveal_answer()
{
    var roman_letter = document.getElementById("current-letter").innerText.toLowerCase();
    var answer = morse_table[roman_letter];

    var answer_status = document.getElementById("answer-status");
    answer_status.style.color = "cyan";
    answer_status.innerText = "The answer is " + answer;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


function toggle_dark_mode()
{
    document.body.classList.toggle("dark-mode")
    document.getElementById("input").classList.toggle("dark-mode")
}

reset_letter();