
sets = {
    "nouns": {
        "set": [],
        "filename": "Wordlist-Nouns-All.txt",
        "tag": "{noun}"
    },
    "verbs": {
        "set": [],
        "filename": "Wordlist-Verbs-All.txt",
        "tag": "{verb}"
    }
}

function readTextFile(file, callback)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                // console.log("response for file", file, ":", allText);
                callback(allText);
            }
        }
    }
    rawFile.send(null);
}

function get_words()
{
    for (const set in sets)
    {
        readTextFile(sets[set].filename, data => {
            sets[set].set = data.split(/\r?\n/);
        })
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function random_word(set)
{
    var index = getRandomInt(set.length);
    return set[index];
}

function generate()
{
    var string = document.getElementById("template").value;

    for (const set in sets)
    {
        // create regex
        var replace = sets[set].tag;
        var regex = new RegExp(replace, "g");

        // replace set
        var num_nouns = (string.match(regex) || []).length;
        for (var i = 0; i <= num_nouns; i++)
        {
            string = string.replace(sets[set].tag, random_word(sets[set].set))
        }
    }

    // show result
    document.getElementById("result").innerText = string;
}

get_words();