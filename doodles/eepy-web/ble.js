

//===========================================
// globals and defines
//===========================================

const SERVICE_NRF_UART_UUID =           "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const CHARACTERISTIC_NRF_UART_RX_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const CHARACTERISTIC_NRF_UART_TX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let ble_device = null;
let ble_gatt_server = null;
let ble_service_nrf_uart = null;
let ble_char_nrf_uart_rx = null;
let ble_char_nrf_uart_tx = null;

let esp_pin_left_a =  4;   // m1a
let esp_pin_left_b =  16;  // m1b
let esp_pin_right_a = 23;  // m2a
let esp_pin_right_b = 22;  // m2b

//===========================================
// get handles to elements
//===========================================

const el_status = document.getElementById("status");
const el_status_container = document.getElementById("status-container");
const el_btn_connect = document.getElementById("btn-connect");
const el_btn_disconnect = document.getElementById("btn-disconnect");


//===========================================
// update status
//===========================================

function update_status(msg, err=false) {

    // update status box colour
    // el_status.style.color = err ? "var(--bs-danger)" : "black";
    if (err) {
        el_status_container.classList.remove("alert-info");
        el_status_container.classList.add("alert-danger");
    } else {
        el_status_container.classList.add("alert-info");
        el_status_container.classList.remove("alert-danger");
    }

    // update status text
    el_status.innerText = msg;

}



//===========================================
// bluetooth callbacks
//===========================================

function ble_on_connect_finish() {
    update_status("Connected to " + ble_device.name);
    el_btn_connect.disabled = true;
    el_btn_disconnect.disabled = false;
}

function ble_on_disconnect(event) {
    const device = event.target;
    console.log("disconnecting from " + device.name);

    ble_device = null;
    ble_gatt_server = null;
    ble_service_nrf_uart = null;
    ble_char_nrf_uart_rx = null;
    ble_char_nrf_uart_tx = null;

    update_status("Disconnected from " + device.name);
    el_btn_connect.disabled = false;
    el_btn_disconnect.disabled = true;
}


//===========================================
// bluetooth functions
//===========================================

function ble_start_scan() {
    console.log("starting ble scan via requestDevice");

    navigator.bluetooth.requestDevice({
        filters: [{
                services: [SERVICE_NRF_UART_UUID]
            }
        ]
    }).then(device => {

        // store ble device
        ble_device = device;

        console.log("> connected to " + device.name);
        update_status("Connecting to " + device.name + "...");

        device.addEventListener("gattserverdisconnected", ble_on_disconnect);

        // try to connect to gatt server
        return device.gatt.connect();

    }).then(server => {

        // store server
        ble_gatt_server = server;
        console.log("> got gatt server");

        // connect to nrf uart service
        return server.getPrimaryService(SERVICE_NRF_UART_UUID);

    }).then(service_nrf_uart => {

        // store service
        ble_service_nrf_uart = service_nrf_uart;
        console.log("> got nrf uart service")

        // get tx characteristic
        return service_nrf_uart.getCharacteristic(CHARACTERISTIC_NRF_UART_TX_UUID);

    }).then(char_nrf_uart_tx => {

        // store characteristic
        ble_char_nrf_uart_tx = char_nrf_uart_tx;
        console.log("> got nrf uart tx char");

        // get rx characteristic
        return ble_service_nrf_uart.getCharacteristic(CHARACTERISTIC_NRF_UART_RX_UUID);

    }).then(char_nrf_uart_rx => {

        // store characteristic
        ble_char_nrf_uart_rx = char_nrf_uart_rx;
        console.log("> got nrf uart rx char");

        // i think thats it???
        ble_on_connect_finish();
        

    }).catch(err => {

        console.error("error performing ble scan:", err);
        update_status("Error scanning for devices:\n" + err, true);

    })

}

function ble_device_disconnect() {
    ble_device.gatt.disconnect();
}


//===========================================
// esp32 functions
//===========================================

function write_pin(pin, state) {

    console.log("setting pin " + pin + " to " + state);

    const utf8encoder = new TextEncoder();
    let cmd = `:w${pin}${state}`;
    let cmd_bytes = utf8encoder.encode(cmd);

    return ble_char_nrf_uart_rx.writeValueWithoutResponse(cmd_bytes);
}

function drive_stop() {
    console.log("stopping");
        write_pin(esp_pin_left_a, 0)
    .then(_ => {
        write_pin(esp_pin_left_b, 0);
    }).then(_ => {
        write_pin(esp_pin_right_a, 0);
    }).then(_ => {
        write_pin(esp_pin_right_b, 0);
    })
}

function drive_forward() {
    console.log("driving forward");
    write_pin(esp_pin_left_a, 1)
    .then(_ => {
        write_pin(esp_pin_left_b, 0);
    }).then(_ => {
        write_pin(esp_pin_right_a, 1);
    }).then(_ => {
        write_pin(esp_pin_right_b, 0);
    })
}

function drive_backward() {
    console.log("driving backward");
    write_pin(esp_pin_left_a, 0)
    .then(_ => {
        write_pin(esp_pin_left_b, 1);
    }).then(_ => {
        write_pin(esp_pin_right_a, 0);
    }).then(_ => {
        write_pin(esp_pin_right_b, 1);
    })
}

function drive_rot_right() {
    console.log("driving right");
    write_pin(esp_pin_left_a, 0)
    .then(_ => {
        write_pin(esp_pin_left_b, 1);
    }).then(_ => {
        write_pin(esp_pin_right_a, 1);
    }).then(_ => {
        write_pin(esp_pin_right_b, 0);
    })
}

function drive_rot_left() {
    console.log("driving left");
    write_pin(esp_pin_left_a, 1)
    .then(_ => {
        write_pin(esp_pin_left_b, 0);
    }).then(_ => {
        write_pin(esp_pin_right_a, 0);
    }).then(_ => {
        write_pin(esp_pin_right_b, 1);
    })
}