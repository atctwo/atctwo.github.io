let el_time = document.getElementById("time");
let el_date = document.getElementById("date");

// function to update date and time
function update() {

    // get current time + date
    let date = new Date();

    // set time
    el_time.innerText = date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "numeric",
        "second": "numeric"
    });

    // set date
    el_date.innerText = date.toLocaleDateString(undefined, {
        day: "numeric",
        weekday: "long",
        month: "long",
        // year: "long"
    });

}

// update every half second
// setInterval(update, 500);

// initial update on page load
update();