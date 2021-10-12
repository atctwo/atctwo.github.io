---
layout: post
title:  "Classic Bluetooth using ESP-IDF"
date:   2021-04-23 23:59:59 +0100
tags: esp32 bluetooth electronics
---

I recently wanted to do an audio project using Bluetooth.  I chose to use the ESP32, because I've been using it for a while now, although I've only ever used it with Arduino (and later using Arduino as an ESP-IDF component).  I had never written code directly using ESP-IDF on its own.  I decided to write the code for my project using ESP-IDF without Arduino as a learning experience (and so I could know how the Bluetooth stack is being handled at any given point).

While there are *loads* of online resources for using BLE in Arduino on the ESP32, I wasn't using BLE or Arduino.  The only resources I could find for Classic Bluetooth in ESP-IDF were the official documentation and official example code (which took a long time to understand because they are pretty complicated).

I though I would try to write a friendly introduction to Classic Bluetooth.  I'm not going to talk about implementing any specific profile other than GAP (at least in this post), but I will walk though the process of setting up Bluetooth, and scanning for devices.  This post was written considering ESP-IDF v4.2, and it should work for most other v4 releases (i hope), although things might be pretty different for v3 releases.

Oh, also, the ESP32 Arduino core does have a built in Classic Bluetooth library, but as of writing, it only supports the Serial Port Profile (SPP), while I needed to use the Advanced Audio Distribution Profile (A2DP).  There is a [library for A2DP using Arduino](https://github.com/pschatzmann/ESP32-A2DP), but I wanted to do I2S and UART stuff in the same project, so I decided to bite the bullet and do the whole thing in ESP-IDF.

## A Quick Primer on Bluetooth
If you already know Bluetooth, you can skip this bit.  This is just a quick primer on various concepts that you need to know when using Bluetooth.

- Classic Bluetooth is not the same thing as Bluetooth Low Energy (BLE).  The ESP32 can handle both, but this article will only focus on Classic Bluetooth

### Controller and Host

- The ESP32's Bluetooth system is split into two bits: the *controller* and the *host*
- The controller is the software that controls the Bluetooth hardware (ie: the really low level physical layer stuff)
- The host is the software that handles the various protocols and profiles that Bluetooth uses (ie: the high level structure of the data that is sent)
	- the default host stack is called "Bluedroid", and was originally created for Android.
	- the ESP32 can use NimBLE as an alternative host stack.  it has *much* lower resource consumption than Bluedroid, but it only supports BLE.
- Normally, the controller and host both run on the ESP32 itself, but you can set it up so that the host runs on a different device (so the ESP32 is the controller), although in this article I'm going to keep them on the ESP32.

### Profiles

- Different types of data are sent over Bluetooth using a number of "profiles".  Each profile deals with a specific class of information (like images or audio or files or "human interaction").  [Here's a list of the profiles](https://en.wikipedia.org/wiki/List_of_Bluetooth_profiles) defined by the Bluetooth SIG (Special Interest Group, the people who standardise the Bluetooth specifications)
- ESP-IDF only supports a few of these profiles (at the minute).  These are:
	- **GAP (Generic Access Profile)** this profile handles device information, and how each device discovers and connects to each other (including things like scanning and PIN codes). this profile is usually at the core of most Bluetooth things. 
	- **A2DP (Advanced Audio Distribution Profile)** this is used to send high quality audio between devices (audio is sent from a *source* device (like a phone) to a *sink* device (like a speaker or headphones))
	- **AVRCP (Audio/Video Remote Control Profile)** this allows a *controller* device (eg: headphones with play/pause and volume buttons) to send remote control commands to a *target* device (eg: phone).  this is generally used with A2DP (when using the ESP32, you can't use AVRCP without using A2DP, although you can use A2DP without AVRCP)
	- **SPP (Serial Port Profile)** this is a implementation of the RS232 Serial protocol over Bluetooth.  Because you can send any bytes you want, this is great for implementing custom protocols
	- **HFP (Hands Free Profile)** this profile allows hands-free devices (like a car) to communicate with a phone for things like making phone calls
- ESP-IDF implements a lot of lower level Bluetooth protocols that the profiles listed above depend on, but I'm not going to talk about them because they scare me (I'm also not sure if they're actually documented)

For more info about how the ESP32's Bluetooth implementation works, see [this PDF](https://www.espressif.com/sites/default/files/documentation/esp32_bluetooth_architecture_en.pdf).

## Setting up the Bluetooth Stack

Before you do anything with profiles, you need to tell the ESP32 to setup the Bluetooth controller and host.  There are a few functions you need to call before you call any other Bluetooth function (otherwise the ESP32 will crash).  They look a bit scary, but once you realise what they do, it becomes easier to know what is happening.

### sdkconfig

The first thing you should do is enable Classic Bluetooth (and check some other Bluetooth options) in sdkconfig.  Run `idf.py menuconfig`, and go to `Component Config → Bluetooth`, and make sure `Bluetooth Host` is set to `Bluedroid - Dual-mode`.  Go to the `Bluedroid Options` submenu, and make sure `Classic Bluetooth` is enabled.  Make sure to also enable any profiles that you want to use.


![sdkconfig.png](:/2806803e3a734e6ab78a3b6638e43601)

### includes

Next, you should include all of the includes that Bluetooth needs:
```c++
#include <esp_bt.h>         // functions for talking to the Bluetooth controller
#include <esp_bt_main.h>    // functions for handling the state of the Bluedroid stack
#include <esp_bt_device.h>  // functions for getting and setting device info
#include <esp_gap_bt_api.h> // GAP-related functions
```

### initalisation

If you aren't using BLE at the same time as Classic Bluetooth, you can free the memory that BLE would use by calling:
```c++
// release memory for BLE (which isn't used here)
esp_bt_controller_mem_release(ESP_BT_MODE_BLE);
```
This is a Bluetooth controller function, so it isn't a Bluedroid thing.  Now we need to actually initalise the controller, then we need to enable it.  These can be done using these two function calls:

```c++
// initalise the bt controller
esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
esp_bt_controller_init(&bt_cfg);

// enable the bt controller
esp_bt_controller_enable(ESP_BT_MODE_CLASSIC_BT);
```

It's probably a good idea to check if the function calls failed (and if they failed, print the reason why).  The code below is the same as the code above, except that it does some error checking:

```c++
esp_err_t ret;

// initalise the bt controller
esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
if ((ret = esp_bt_controller_init(&bt_cfg)) != ESP_OK) {
	ESP_LOGE(TAG, "%s initialize controller failed: %s\n", __func__, esp_err_to_name(ret));
	return;
}

// enable the bt controller
if ((ret = esp_bt_controller_enable(ESP_BT_MODE_CLASSIC_BT)) != ESP_OK) {
	ESP_LOGE(TAG, "%s enable controller failed: %s\n", __func__, esp_err_to_name(ret));
	return;
}
```

We also need to initalise and enable Bluedroid, and the process is pretty similar.  We can use these functions:

```c++
// initalise the bluedroid stack
esp_bluedroid_init();
	
// enable the bluedroid stack
esp_bluedroid_enable();
```

although it's a good idea to have error checking:

```c++
// initalise the bluedroid stack
if ((ret = esp_bluedroid_init()) != ESP_OK) {
	ESP_LOGE(TAG, "%s initialize bluedroid failed: %s\n", __func__, esp_err_to_name(ret));
	return;
}


// enable the bluedroid stack
if ((ret = esp_bluedroid_enable()) != ESP_OK) {
	ESP_LOGE(TAG, "%s enable bluedroid failed: %s\n", __func__, esp_err_to_name(ret));
	return;
}
```

### miscellaneous setup

Now both the controller and host are initalised and enabled :)  There are still some other things we should do, like setting the device's name, using a function called [`esp_bt_dev_set_device_name()`](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/bluetooth/esp_bt_device.html#_CPPv426esp_bt_dev_set_device_namePKc).  This function can be called at any point in the program, as long as the controller and stack have been initalised and enabled first

```c++
// set the device name
esp_bt_dev_set_device_name("Bluetooth!");
```

We can decide whether or not other Bluetooth devices can connect to the ESP32, and whether the ESP32 is discoverable (ie: can it be picked up when other devices are scanning for Bluetooth devices), using a function called [`esp_bt_gap_set_scan_mode()]`](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/bluetooth/esp_gap_bt.html#_CPPv424esp_bt_gap_set_scan_mode24esp_bt_connection_mode_t23esp_bt_discovery_mode_t).  You can call this at any point in your code after initalisation and enabling as needed.

This function has two parameters - the first is Connectable??? and the second is Discoverable???, but you can't just pass `true` or `false`, you need to pass a specific enum value.  

For the first parameter, you need to pass a member of [`esp_bt_connection_mode_t`](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/bluetooth/esp_gap_bt.html#_CPPv424esp_bt_connection_mode_t) which can be `ESP_BT_NON_CONNECTABLE` or `ESP_BT_CONNECTABLE`. 

For the second parameter, you need to pass an [`esp_bt_discovery_mode_t`](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/bluetooth/esp_gap_bt.html#_CPPv423esp_bt_discovery_mode_t), which can be `ESP_BT_NON_DISCOVERABLE`, `ESP_BT_LIMITED_DISCOVERABLE`, or `ESP_BT_GENERAL_DISCOVERABLE`.  What is the difference between Limited and General?  Limited Discoverability implies that the discoverability is temporary (like when you press "Make Discoverable" in the Bluetooth settings on your phone and it only lasts for 30 seconds).  Using this discoverability mode won't actually make it undiscoverable after 30 seconds, but it tells scanning devices that it won't be discoverable for long [1].

I think this usage is ok for most applications:

```c++
esp_bt_gap_set_scan_mode(ESP_BT_CONNECTABLE, ESP_BT_GENERAL_DISCOVERABLE);
```

Note that even if your device is discoverable, it won't show up on other devices' scans unless you enable advertising (which we'll cover a bit later).

## Sources

Most of the API reference comes from the official documentation: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/bluetooth/index.html

Information on the ESP32's Bluetooth architecture and implementation comes from this official document: https://www.espressif.com/sites/default/files/documentation/esp32_bluetooth_architecture_en.pdf

[1] https://www.bluetooth.com/blog/advertising-works-part-2/ (under the "Flags" section)