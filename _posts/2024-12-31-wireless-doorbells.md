---
layout: post
title:  "Reverse engineering wireless doorbells"
date:   2024-12-31
categories: posts
tags: [reverse engineering, rf]
author: "atctwo"
description: For my university's amateur radio society, I spent maybe a bit too much time figuring out how wireless RF doorbells work.
image: /assets/images/posts/wireless-doorbells/doorbells.jpg
toc: true
enable_comments: true
enable_related: true
custom_excerpt: true
excerpt_separator: <!-- excerpt-end -->
---

<style>
    .cool-figure {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: 100%;
    }
    .cool-figure.flipper-screenshot img, video {
        width: unset;
        height: 120px;
        border: 10px solid #FE892B;
        /* border-radius: 0px; */
    }
    .cool-figure figcaption {
        font-size: 0.875em;
        color: var(--bs-secondary-color);
        text-align: center;
    }
    @media (min-width: 767px) {
        .cool-figure img, video {
            width: 70%;
        }
    }
</style>

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/doorbells.jpg" alt="An image containing three wireless devices.  At the left there's a single transmitter with one button.  There are two receiver units which plug into a mains socket.  They are all labelled 'B' because we bought two units and didn't want to mix them up.">
    <figcaption>The wireless doorbell I <b>didn't</b> use because I didn't want to include a picture of the actual doorbell I have outside my front door.  This one will come up later however...</figcaption>
</figure>

<!-- excerpt-start --> 

This project began with the RF-based wireless doorbell I have at home.  Unlike Wifi-based doorbells, these use a much simpler one-way protocol to transmit data.  I had always wondered what data that protocol actually carried, given that two models of the same doorbell shouldn't ring each other.  So, back in September when my university's Amateur Radio and Electronics Society was looking for a project to undertake, so I suggested that we try to reverse engineer that protocol.  

<!-- excerpt-end -->

I spent a lot of time researching and experimenting with radio hardware, and I learned a lot about how these devices work.  It's not really useful information but it was still fun to learn!  So, I decided to write it all down in a blog post.  The info contained in this post is not new, it can all be found elsewhere on the internet.  I feel that it can be a bit scattered, so I decided to write this post to gather all the stuff I'd learned into one place.

As with my post on [reverse engineering a thermal printer](/posts/2024/07/16/thermal-printer.html), this post will read more like a story, detailing the steps I took when learning in (roughly) chronological order.  I learned about a lot of different things, so this post is *very* long.  If you just want a list of all the information I've gathered (or are interested in research artifacts), check out [the GitHub folder](https://github.com/atctwo/reverse-engineering/tree/main/wireless-doorbells).

As always, I hope you somehow find this post useful, or you at least enjoy reading!

Oh, and this post isn't just about doorbells.  The same protocol is used for wireless switches and temperature sensors and *garage door openers* and probably other concerning applications.  Throughout the post I'll just be referring to "doorbells" but the post will apply to other devices too.

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/switches.jpg" alt="Picture of the wireless mains switches I used when testing.  There's one remote with six buttons (on and off buttons for three channels), as well as two receiver units with UK mains sockets on the front and plugs on the back">
    <figcaption>The wireless mains switches I used when testing</figcaption>
</figure>


# Frequency Identification
The first step in hacking these radio devices was to figure out what frequency they operate on.  Most Short Range Devices like this tend to operate on or around **433.92 MHz**, but it's common for SRDs to operate on <abbr title="Industrial, Scientific, and Medical">ISM</abbr> bands like **315 MHz**, **915 MHz**, and a few others.

How do you know what frequency a given doorbell is operating on?  Usually the easiest method is to find the manual and see if it specifies the operating frequency as part of the regulatory information.  If that's not possible or it sounds too boring, there are a few other ways. making use of some off-the-shelf radio hardware.

## Flipper Zero
If you somehow haven't heard of the [Flipper Zero](https://flipperzero.one/), it's a little radio hacking pocket tool powered by a friendly dolphin.  It can be used to explore a few different protocols including NFC, RFID, and Infrared, and a few others.  The feature of interest to this post is its [**Sub-GHz**](https://docs.flipper.net/sub-ghz) abilities.

This post will make use of a few Sub-GHz tools, but the first is a really basic Frequency Analyzer.  When it detects a nearby transmission on a supported frequency, it simply tells you what that frequency was.  That's it!

<figure class="cool-figure flipper-screenshot">
    <img src="/assets/images/posts/wireless-doorbells/flipper-subghz-freq-analyser.png" alt="Screenshot of the Flipper's frequency analyser, showing it detected a transmission at 433.859 MHz">
    <figcaption>The Flipper's frequency analyser, showing my doorbell transmits at 433.859 MHz</figcaption>
</figure>

The main operational frequency isn't the only characteristic of radio transmitters, though.  The Flipper's Frequency Analyzer can tell you the single *main frequency*, and while this is typically enough there is more to the picture.

## Software Defined Radio
We can find out more about the transmission characteristics using a Software Defined Radio (SDR).  We can do **a lot** more with an SDR but we'll get to that later.  

{% include admonition.html type="tip" title="What's an SDR?" %}

Essentially, an SDR is a radio peripheral that can be tuned <em>and interfaced</em> with software.  For SDRs that can receive radio, the received signals can be processed on a computer!  Similarly, some SDRs can transmit radio, based on data sent from a computer.  SDRs are able to operate on huge ranges of the radio spectrum!

{% include admonition_end.html %}

The SDR I used in my research was a little DVB-T tuner I borrowed from my university's internal makerspace.  This device was only intended to receive digital TV signals, but because of it how it works it can be used as a cheap receive-only SDR!

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/sdr.jpg" alt="Image of a USB TV tuner dongle labelled 'DVB-T+DAB+FM'.  There's an RF connector adapter coming out of the top of it, with a long black cable going out of frame">
    <figcaption>The SDR I used.  The rubbery coating has started disintegrating</figcaption>
</figure>

For the purpose of frequency identification, I used my SDR with **waterfall** (aka **spectrogram**) software.  I usually use [gqrx](https://www.gqrx.dk/) but there are loads of other waterfall programs available; a really popular one is [SDR#](https://airspy.com/download/).  

{% include admonition.html type="tip" title="What to waterfall programs do?" %}

These programs "capture" the received signal strength of a range of frequencies, then plot them on a chart.  New readings are pushed to the top of the graph, pushing everything else down.

Frequency is represented on the X-axis, *time* is represented on the Y-axis, and signal strength is represented as a heatmap (where blue means a low signal, yellow and red mean high signal, and white means really high signal).

{% include admonition_end.html %}

Given that the operational frequency is probably one of 315, 433, or 915 MHz, one can change the selected frequency range and have a look around the spectrum to see which frequency the signal is strongest at.  You can see visually what the doorbell's transmissions look like in the frequency and time domains (as well as the level of background noise).

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/gqrx_doorbell_annotated.png" alt="gqrx showing a waterfall plot of my doorbell's transmission.  In the middle of the screenshot there's a big band of yellow covering the entire frequency range, with a small vertical bar of red in the middle.  There are annotations showing that the band covers the entire time my doorbell was transmitting.  Above and below it are still yellow, but a much weaker shade with areas of blue">
    <figcaption>gqrx showing a waterfall plot of my doorbell's transmission</figcaption>
</figure>

Waterfall plots are also effective at visualising the **bandwidth** of the emitted signal.  In the screenshot above, the entire frequency range turns yellow when the doorbell is transmitting.  That's actually pretty bad!  The transmitter should not be transmitting on such a wide frequency range.  For reference, here's a waterfall plot of a local FM radio station at the same X-axis scale:

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/can_you_figure_out_what_song_this_is.png" alt="Screenshot of gqrx showing a waterfall plot including a local FM broadcast radio station.  Most of the background is blue except for a thin yellow streak down the middle of the image, and another to the left of the image.  The streaks look kind of like audio waveforms">
    <figcaption>gqrx showing a waterfall plot of a local FM broadcast radio station</figcaption>
</figure>

In practice, this isn't that much of a problem.  SRDs like wireless doorbells only transmit for short periods infrequently, and they transmit at relatively very low power levels.  Even though the bandwidth is large, the *range* is not.

# Getting Data
Now that we know what frequency our doorbell transmits on, how do we actually "read" those transmissions?  What signals are actually being sent?  We could zoom in on a waterfall plot of the signal, but it would be difficult to make anything out due to how transmissions are processed into colour blocks.  The approach I took was to use my SDR with a different piece of software...

## Universal Radio Hacker
[Universal Radio Hacker](https://github.com/jopohl/urh) is a really cool tool for analysing radio protocols.  It can take in a sample of radio transmission data (usually directly from an SDR), demodulate it, and even analyse and decode it.  It can also *reconstruct new packets using the same protocol*, and retransmit it (although I haven't got an SDR that can transmit to test this).

To begin with, I opened URH and started recording using the `RTL-SDR` driver at 433.92 MHz[^4].  I held the doorbell about 30cm away from the SDR's antenna so the received signal wouldn't be too strong.

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/urh_capture.png" alt="">
    <figcaption>Screenshot of URH showing a recording of the doorbell signal</figcaption>
</figure>

After saving the capture and closing the window, the "Interpretation" tab opens up.

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/urh_interpretation.png" alt="">
    <figcaption>Screenshot of URH showing a the Interpretation tab with the recorded signal in view</figcaption>
</figure>

URH supports lots of different ways to interpret signals, but in this case the signal uses **Amplitude Shift Keying** (ASK) modulation.  This basically means that the amplitude of the signal changes over time to represent different data states.  In this case it switches from a ~60 kHz sine wave to a 0 Hz nothing wave; this specific usage of ASK is often called **On-Off Keying** (OOK)[^2].  We can ask URH to attempt to interpret the signal by *demodulating* it, by changing the "Signal View" option from "Analog" to "Demodulated".  This results in the output looking like this:

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/urh_signal_1.png" alt="Image of a signal in demodulated view, with time in the x-axis and amplitude in the y-axis.  0 is in the middle of the y-axis.  The top half of the background is purple and the bottom half is green.  There are three white 'bumps' of signal but they never go below 0">
    <figcaption>The signal demodulated from ASK</figcaption>
</figure>

This just looks like the bottom half of the signal has been removed, but if we zoom in we can see that it's actually processed the signal.

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/urh_signal_2a.png" alt="A zoomed-in version of the original modulated signal.  There's a single spike of data at the start, followed by a repeating series of blocks of signal, equally spaced.  This is the analog view, so the signal does go below 0">
    <img src="/assets/images/posts/wireless-doorbells/urh_signal_2b.png" alt="The same signal as above but this time it's demodulated, so the signal doesn't go below 0 and the top and bottom of the image are purple and green respectively.  Compared to the modulated view, the spikes of data are more clearly visible">
    <figcaption>The original signal and the demodulated version of the signal</figcaption>
</figure>

We can make a few observations here.  First, there's a single "spike" of data right at the start of the transmission.  Next follows equally spaced blocks of repeating data. If we zoom in further, we can see the structure of a one of these "frames".

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/urh_signal_3.png" alt="The same demodulated signal but zoomed in further.  The signal consists of a series of pulses of different lengths">
    <figcaption>The signal, zoomed in further</figcaption>
</figure>

It appears that these frames consist of "pulses" of varying lengths.  Effectively, these pulse lengths correspond to how long the 60 kHz sine wave is turned on for.  Critically, *there are only two distinct pulse lengths*, a short pulse and a long pulse.  Intuitively, the pulse length likely translates to some data state (eg: short pulses are 0, long pulses are 1).  While this is (thankfully) true for this protocol, many other encoding schemes use much more complicated means of differentiating between 0s and 1s.

We'll talk about how to actually parse this signal in the next section, but for now I want to discuss an alternative and more practical way to read this signal.

## 443 MHz modules
You can do a lot with Software Defined Radios but they're kind of overkill for a lot of applications.  They can receive signals from a huge range of frequency bands, but most applications only need to work with one (sometimes a few) bands.  Also, you would need a way to process all of the incoming data, typically using software.  In short, they're not very practical for most end-user radio systems.

So, how is it done normally?  Radio circuits typically have a **tuner** to pick out the relevant frequencies from the antenna, and a demodulator to recover the original signal that is being transmitted.  The tuner circuit usually exists entirely in the analog domain, and to be honest I don't how to actually design one :( [^5]

Thankfully my laziness is enabled by **transmitter and receiver modules**.  These boards have the tuning circuit, (de)modulator, and antenna built onto one tiny PCB, making them really easy to integrate into a digital circuit.  They take in 5V (up to 12V for the transmitter) and a ground connection, and have a single "data" pin.  On the receiver, demodulated signals will be output via this pin.  On the transmitter, data going into that pin will be modulated and transmitted.  They tend to only operate on a single frequency, so I'm using 433.92 MHz modules.  These modules are designed for ASK / OOK protocols, so they produce a digital output.

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/rf-modules.jpg" alt="Picture of two small circuit boards.  They each have a spring-shaped antenna coming out of the side of them.  The one on the left is longer.">
    <figcaption>Receiver (RX) module on the left, transmitter (TX) module on the right</figcaption>
</figure>

To demonstrate how they work, I attached my oscilloscope to the output of the receiver module[^3].  Below is a screenshot of the output *when no nearby transmissions were being made*.

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/scope1.png" alt="Screen capture of a digital oscilloscope showing a rapidly switching digital signal with no real structure to the timing">
    <figcaption>Oscilloscope showing the output of the 433 MHz module with no nearby signal</figcaption>
</figure>

It looks like there's data being received, right?  There shouldn't be, since I wasn't pressing anything.  The data the module was outputting is actually random background noise.  You might ask "surely the noise would be quiet enough that the module would just ignore it; any actual transmissions will be strong enough to be detected".

These modules have a "feature" called **automatic gain control** (AGC), where if there isn't any sufficiently strong signal for a defined length of time, it just amplifies the received signal until it can measure something.  So when there's no transmissions nearby, it just increases the gain until the background noise becomes signifiant.

This is probably useful in some cases (like if you have a far away transmitter that wouldn't normally be picked up), but it makes *parsing* the output of the module a lot more difficult; how do you tell what's noise and what's actual signal?  This is something we'll look at later...

For now, what happens when we do make a transmission?  Let's press the doorbell and see what it outputs:

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/scope2.png" alt="The output of the module.  Initially it's as noisy as before, but an annotation on the image shows when the doorbell is pressed.  Suddenly the signal becomes stronger, and instead of random noise we see uniformly spaced blocks of data.  Another notation marks the point where the doorbell is released, which is followed by a period where the module outputs nothing (0V).  After a while it jumps up to 5V, stays there for a while, and continues with the random noise we saw before.">
    <figcaption>The output of the module when the doorbell is pressed and released</figcaption>
</figure>

The image shows that for the entire time the doorbell is pressed, the random noise is suppressed by the signal from the doorbell.  The AGC turns the gain wayyy down, and the module starts outputting regularly-spaced blocks of data.  These blocks must be the data transmitted by the doorbell!  

After the doorbell is released, the output of the module actually just turns off for a bit.  It just stays at 0V for a while, before jumping up to around 5V, staying *there* for a while, then continuing the random output from before.  This wasn't generated by the doorbell, so where's it coming from?  Again, it's the automatic gain control.  When the doorbell turns off, the gain is set to expect a strong signal, so the background noise is basically unreadable.  After a while, the AGC realises the strong signal isn't coming back, so readjusts the gain back to where it was before.

Let's zoom in on those blocks of data.

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/scope3.png" alt="A zoomed-in view of the blocks of data seen when the doorbell was pressed.  They're equally spaced, and they each seem to contain some kind of data.  It looks like each block contains the same data.">
    <figcaption>Zooming in on the periodic data captured when the doorbell was pressed</figcaption>
</figure>

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/scope4.png" alt="A zoomed-in view of one of the blocks.  The data consists of pulses of two distinct lengths.">
    <figcaption>Zooming in further</figcaption>
</figure>

What do you know?  It's the same sort of signal we received with the SDR: repeating blocks consisting of short and long pulses.  In fact...

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/scope5.png" alt="The previous oscilloscope image, with the demodulated data view from URH overlaid on top.  The pulse widths from the two signals align perfectly">
    <figcaption>The previous oscilloscope image, with the demodulated data view from URH overlaid on top</figcaption>
</figure>

It's exactly the same signal as we read with the SDR, down to the individual pulse widths!  I suppose this probably isn't surprising, since URH and these modules do exactly the same demodulation after all, but I thought it was pretty cool to see some pure-electronics hardware produce the same result as software!

# Decoding Data
At this stage, we've received and demodulated the signal.  We can see that it consists of some type of binary data, but we don't know exactly how to decode it.  We also wouldn't know what that decoded data actually meant.  We could probably manually work it out, given enough time, but that might hurt a bit.  Thankfully we have tools that can help us out!  This section discusses each tool in detail.

## A Screwdriver
In my research, I learned the most about by simply taking it apart.  When looking at the doorbell's PCB, there is one big 8-pin IC in the middle.  I guessed that this IC probably does all the digital-domain processing (ie: *encoding*), and all the modulation and transmission is done by the passive components scattered around the board.

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/doorbell_inside.jpg" alt="Picture of a blue circuit board.  In the middle there's a large 8-pin chip and a push button.  Scattered around it are lots of really tiny passive components and a few surface-mount transistors.  At one end of the board there's a large spiral antenna, and at the other there are two metal clips to hold a 23A battery.">
    <figcaption>Picture of the inside of the doorbell</figcaption>
</figure>

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/doorbell_ev1527.jpg" alt="A close up of the IC in the middle of the board.  It has 'eV' engraved on to it in large lettering, and the codes '1527' and '1920P' in smaller lettering.">
    <figcaption>Close up of the IC</figcaption>
</figure>

Looking closer at the IC, we can see that it's an **EV1527**.  Looking this up, it seems that it's an "OTP Encoder".  The [datasheet](https://components101.com/sites/default/files/component_datasheet/EV1527-Datasheet.pdf) for this part doesn't make it immediately clear what that actually means, so I'll try my best to explain it!

This chip is the thing that's actually generating the signal we have been seeing.  The chip generates the signal and outputs it on its `TXD` pin; after leaving the chip the signal is then amplitude modulated on to a 433.92 (ish) MHz carrier wave and sent to the antenna.

The datasheet does give some information about the structure of the signal that it outputs (although it is a bit cryptic).  Basically, there are three parts to the signal:

{% include admonition.html type="info" %}

<div class="no_toc_section" markdown="1">

#### 1. a **preamble** at the start
The datasheet doesn't say what it's for but I think it's for synchronisation purposes.  This only appears once when the transmitter begins transmitting, after which the actual data repeats at regular intervals.

#### 2. a 20-bit **unique key**
This is probably the most important part.  If you and your neighbour have the same model of doorbell, how do they avoid ringing each other?  Each EV1527 has a **O**ne **T**ime **P**rogrammable (**OTP**) code burned into it, which is included in the transmission.  When a receiver receives a transmission, it checks that this code matches the one its paired to, and it will only react if it does. 

#### 3. a 4-bit **data** section
Most doorbells only have one button, so they don't make that much use of this section.  But consider the wireless mains switch shown at the start of this post.  It has six buttons.  You could have a unique OTP for each button but that would mean that receivers need to learn the codes for both "on" and "off".  Receivers for systems with more than two functions would need to learn a new code for each function.

The EV1527 has four input pins called `K0`, `K1`, `K2`, and `K3`.  These pins directly correspond to the four bits of this section.  This allows transmitters to include four bits of arbitrary data for each unique code, so receivers only have to learn one code.  Typically each bit corresponds to a button[^6].

#### 4. **secret fourth thing**
You might have spotted that the signals we received have 25 pulses.  The protocol actually only defines 24-bit messages.  I have no idea what this last pulse is, but I'm guessing it might be a checksum of some sort?  Either way, I've just been ignoring it when interpreting data.

</div>

{% include admonition_end.html %}

So, we finally know what data the signal is carrying!  Almost!  There's one last thing that's important to talk about: *what do the different pulse lengths mean*?  I mentioned earlier that the short ones mean 0 and the long ones mean 1, but there is a reason behind this that's important when it comes to reading the data.

The width of one pulse (or *period*) is defined by the value of a resistor connected to `OSC1` pin.  Short pulses consist of one "on" period followed by three "off" periods.  Long pulses consist of three "on" periods followed by one "off" period.  The preamble is one "on" period followed by *31 "off" periods*!

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/ev1527_timing.svg" alt="">
    <figcaption>Timing diagram for the three symbols defined by the EV1527 protocol (<a href="/assets/images/posts/wireless-doorbells/ev1527_timing.json">WaveDrom source</a>)</figcaption>
</figure>

That's it!  It's not a super complicated protocol although I would have had a hard time guessing it manually.  Now that we actually definitely know what data is being sent, we can read the transmissions from our doorbell

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/doorbell_decode.png" alt="The signal from the doorbell in the demodulated view of URH.  Each pulse is annotated with a 0 or a 1 depending on the pulse length">
    <figcaption>Manual decoding of the signal from the doorbell</figcaption>
</figure>

When you group the unique key and data (and *not* the last bit) together and convert it to a decimal number, you get `139187`!  This isn't actually all that useful yet, but it will be later.  Finally, we have decoded the doorbell!

## Universal Radio Hacker
As well as demodulating signals, URH can also analyse them!  It can't specifically decode EV1527 data out of the box, but you can create custom decoders to tell it how to interpret the demodulated data.

After demodulating a signal, when you go to the "Analysis" tab it just looks like a bunch of 1s and 0s in a big table.  URH is clever enough to split each "frame" or block of repeated data into it's own row, but it doesn't know how to turn the signal into a bitstream.  In my case, it was able to identify that each pulse consists of 4 periods, so each row ended up with around 100 columns.  The next step is to tell URH how to decode the data.

Decoders in URH essentially take the raw bits from the signal and parse them into a different bitstream, representing what was actually encoded in the first place.  URH comes with a couple of built-in decoders (variants of Non-Return-To-Zero and Manchester encoding), although they aren't specific to any protocol.  In the "Decoding" drop down, there's another option called `...`; this allows you to specify your own decoder.

Implementing an EV1527 decoder isn't actually that difficult, since there's only a single Substitution stage:

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/urh_ev1527_decoder.png" alt="Screenshot of URH's decoder creator.  There are a lot of decoding stages to pick from in the left pane, but the only used stage in the middle pane is Substitution.  The stage properties are in the right pane.  All along the bottom of the window is the Testing pane, showing the signal 1 1 1 0 1 0 0 0 being demodulated as 1 0">
    <figcaption>URH's decoder creator screen, showing the single stage for an EV1527 decoder</figcaption>
</figure>

This stage replaces all occurrences of `1110` with `1` and `1000` with `0`.

With this custom decoder selected, most rows in the table will get decoded as EV1527, and will now be 25 columns wide.  These of course represent the ~~24~~ 25 bits of the protocol.  In the very first row, you might see a single column with `1`; this is the preamble!

A cool feature of URH is the ability to set labels for sections of data.  For example, on any one row, if you select columns 1 to 20 (inclusive), you can right click and assign a label.  I used a custom label type to mark this as the `unique_code`.  This colour codes the section so you can visually see the composition of the data.  This also applies the label to each row!

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/urh_analysis2.png" alt="Screenshot of URH's protocol analyser.  In the middle there's a big table of 1s and 0s, colour coded to match the sections of the protocol">
    <figcaption>URH's Analyser tab, showing the decoded and labelled data being sent by my doorbell</figcaption>
</figure>

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/urh_analysis.png" alt="">
    <figcaption>Zoomed-in screenshot of the above image, showing a single row is highlighted</figcaption>
</figure>

When you select a series of cells in the table, URH will interpret the data as a value and display it under the table.  In the above screenshot, I have selected one row of data (excluding the last bit), which resolves to have a value of `139187`, the same value manually derived from the demodulated signal view!  Since you can re-use decoders, this can be used as a really quick way to decode EV1527 values!

## Flipper Zero
Once again, the Flipper Zero makes it a lot easier.  The Sub-GHz Read app will scan for codes on the selected frequency and if received signals are in a [supported protocol](https://docs.flipper.net/sub-ghz/add-new-remote#3iGlU), it will just tell you the value of each section, as well as the pulse length.  You don't have to define anything other than the operating frequency, which you would have to do anyway.

<figure class="cool-figure flipper-screenshot">
    <img src="/assets/images/posts/wireless-doorbells/flipper-subghz-read.png" alt="Screenshot of the Flipper's Sub-GHz Read mode, showing it listening for transmissions on 433.92 MHz">
    <img src="/assets/images/posts/wireless-doorbells/flipper-subghz-readed.png" alt="Screenshot showing that the app has received a signal in the 'Princeton' protocol">
    <img src="/assets/images/posts/wireless-doorbells/flipper-subghz-decoded.png" alt="Screenshot showing the details of each section within the received signal">
    <figcaption>Screenshots showing the process of reading and analysing signals using the Flipper's Sub-GHz Read mode</figcaption>
</figure>

You might notice that it can also "Send" signals.  This just retransmits the signal as it was received so you can spoof the transmitter.  You can also save signals to the SD card to retransmit later.  You can do this with SDRs, but only with ones which can transmit.

{% include admonition.html type="info" title="Princeton Protocol" %}

Interestingly, the Flipper identifies the protocol as "Princeton".  I think this might be because a manufacturer called Princeton has made protocol-compatible ICs, but most research on the protocol identifies it as "EV1527" or just "1527", so that's what I'll be calling it in this post.

{% include admonition_end.html %}

## An Aside on Other Protocols
<p>It's worth making the point that other protocols exist!  EV1527 is really common, and happens to be what my doorbell uses, so that's what this post is about.  But the reverse engineering procedure for other protocols shouldn't be too dissimilar from this posts.</p>

<p>There's a piece of software called <a href="https://github.com/merbanan/rtl_433">rtl_433</a> which uses an SDR to scan for protocols on 433 MHz.  It can decode hundreds of different RF protocols from different manufacturers.  Sadly I couldn't get it to detect my doorbell, but if you're thinking of hacking an RF device of your own, check if rtl_433 has support for it!</p>

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/rtl433.png" alt="Screenshot of a terminal window showing three sets of decoded transmissions.  Each entry has colour-coded details relating to the type of device making the transmission.">
    <figcaption>Screenshot of rtl_433, showing received transmissions from my neighbourhood, including a tyre pressure sensor, soil moisture sensor, and ambient weather sensor</figcaption>
</figure>

# Closing Thoughts

## ARES Doorbell
The image used at the very start of this post isn't actually the doorbell I have at home.  The doorbell pictured was actually purchased by the Amateur Radio and Electronics Society (ARES) for this project.  I initially did most of my research using my home doorbell (which *is* the one used in all the other screenshots) and the smart mains switch I also talked about.  When I went to read the OTP of this doorbell, I discovered it doesn't work quite the same way...

I started by trying to use an Arduino sketch[^8] to read the code from the doorbell, but it just wouldn't detect anything.  Well, nothing transmitted by this doorbell specifically.  I got out the SDR and recorded a transmission with Universal Radio Hacker, and what I saw was unexpected:

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/ares_doorbell_1.png" alt="">
    <img src="/assets/images/posts/wireless-doorbells/ares_doorbell_2.png" alt="">
    <figcaption>URH captures of the signal from the ARES doorbell</figcaption>
</figure>

Without a concrete source on what is going on here (or if this is even normal) I came to my own conclusions.  I think this is still OOK, since URH can still parse it as such.  When you try this, the resulting signal definitely looks like it's in EV1527 protocol.

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/ares_doorbell_3.png" alt="">
    <figcaption>URH demodulated view of captures from the ARES doorbell</figcaption>
</figure>

Where the ASK modulation produced by my own doorbell uses a ~60 kHz sine wave to mean "on", this doorbell uses a *~1.5 kHz* sine wave.  This still counts as ASK-modulated data, however **the "on" frequency is actually lower than the data rate**!  This generally isn't an issue (the receivers that came with the doorbell work after all), but it's too high of a data rate for my 433 MHz modules to keep up with[^7].  I tried to manually parse their output with my oscilloscope but the pulses it produces are too inconsistent to make sense of.

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/scope10.png" alt="">
    <figcaption>Oscilloscope view of a 433 MHz receiver module with the ARES doorbell being pressed.  Note how there are two different "long" pulse lengths</figcaption>
</figure>

<figure class="cool-figure">
    <img src="/assets/images/posts/wireless-doorbells/ares_doorbell_inside_1.jpg" alt="">
    <img src="/assets/images/posts/wireless-doorbells/ares_doorbell_inside_2.jpg" alt="">
    <figcaption>The inside of the ARES doorbell transmitter</figcaption>
</figure>

Having a look inside the doorbell we can see that it doesn't actually have an EV1527.  Instead it has a CMOSTek / HopeRF [**CMT2150L**](https://crossic.com/wp-content/uploads/2022/02/CMT2150LW-Datasheet-EN-V0-9-180831.pdf).  This is also an OOK Encoder, and it claims to be compatible with "527, 1527 packet format".  It's actually got more features than the original EV1527, including a built-in EEPROM.

This EEPROM is used for storing *configuration data*.  You can connect the chip to a computer using a special programmer, and configure different parameters of the IC.  One of these parameters is the *data rate*, supporting rates between 0.5 to 40 kbps.  Using URH we find out that each 4-period signal (ie: one bit) takes around 135 µs, leading to a data rate of **7.4 kbps**.  To compare with my home doorbell, it takes around 820 µs to send one symbol, a data rate of **1.2 kbps**.

## EV1527 Isn't Very Secure
Chips like the EV1527 are considered **fixed code**.  This means that the code that they transmit will typically never change over time (excluding any data like buttons).  This is pretty insecure, since anyone with an SDR or a Flipper can receive, store, and retransmit those codes.  This post even tells you how to do this!  This is a type of security attack called a **replay attack**.

For doorbells, the most harm you can do with this is to be really annoying.  However consider that this type of communication is used for access control, like garage door openers and your car keys.  Thankfully, these systems (usually...) use a more secure system called a **rolling code**.  In this system any given code is only sent once; that is, the code *changes* each time it is transmitted.  The transmitter and receiver can coordinate so the receiver knows what to expect next time the transmitter transmits.  This effectively prevents replay attacks; any code you could capture wouldn't do anything when replayed, making it useless.

There are a couple of different rolling code protocols, but they're beyond the scope of this post.  I will mention that one of the most popular is [KeeLoq](https://en.wikipedia.org/wiki/KeeLoq), commonly used in car keys.

Of course, rolling codes aren't completely secure.  In 2015, security researcher Samy Kamkar demonstrated an attack called RollJam, which can be used to "steal" codes from a key fob transmitter.  These codes *can* be used in replay attacks, providing a plausible way to gain access to someone's car.

## What Now?
If you managed to get to the end of this post, thank you!  There's a lot of information here but I hope you find it useful.  I've always wondered how these wireless doorbells communicate, and this ARES project was a great excuse to find out.  I've been studying this for a few months now, so this blog post is really a way for me to close this project off.  But I'll definitely return to this subject one day; I still have more questions about how wireless stuff works.

I actually had a lot more to write about, but I thought this post was pretty long and covered most of the important points.  But one question I didn't answer was "what can we actually do with this information?".  I don't really have a good answer for that but I can help you do *something*!  I'm working on a sequel to this post which discusses how to practically use this information for actual projects.  Please look forward to it!

Finally, I want to mention [QUB Amateur Radio and Electronics Society](https://www.instagram.com/qub_ares/).  They gave me the motivation to actually work on this research, and patiently listened to me talk about it for a few hours.  Thank you!

---

# Sources

<div class="no_toc_section" markdown="1">

### Frequency Identification
- Solidremote's articles on [RF Remote Control Frequency Selection](https://www.solidremote.com/blog/rf-remote-control-frequency-selection-315mhz-418mhz-433-92mhz-or-915mhz/) and [[Choosing the] Right Frequency for Remote Control Transmitter Project](https://www.solidremote.com/blog/choose-right-frequency-for-remote-control-transmitter-project-315mhz-vs-433mhz/)
- Ofcom's [frequency allocation table](http://static.ofcom.org.uk/static/spectrum/fat.html)

### 433 MHz Modules
- [Qiachip Product Page](https://qiachip.com/products/qiachip-433mhz-superheterodyne-rf-receiver-and-transmitter-module)
- [Video by Paweł Spychalski](https://www.youtube.com/watch?v=bmLJvkIA__I) on these modules, experimenting with different data rates

### EV1527 Information
- [EV1527 Datasheet](https://components101.com/sites/default/files/component_datasheet/EV1527-Datasheet.pdf)
- O. Mykhaylova, A. Stefankiv, T. Nakonechny, T. Fedynyshyn, and V. Sokolov, ‘Resistance to Replay Attacks of Remote Control Protocols using the 433 MHz Radio Channel’, Feb. 2024. [ResearchGate](https://www.researchgate.net/publication/379112500_Resistance_to_Replay_Attacks_of_Remote_Control_Protocols_using_the_433_MHz_Radio_Channel)
- [rc-switch](https://github.com/sui77/rc-switch), and it's documentation on [line coding](https://github.com/sui77/rc-switch/wiki/KnowHow_LineCoding)
- [CMT2150LW Datasheet](https://crossic.com/wp-content/uploads/2022/02/CMT2150LW-Datasheet-EN-V0-9-180831.pdf)

### Universal Radio Hacker usage
- [URH User Guide](https://github.com/jopohl/urh/releases/download/v2.0.0/userguide.pdf)

### Rolling Codes
- [Baeldung article](https://www.baeldung.com/cs/rolling-code-security) on rolling codes
- [StackExchange answer](https://electronics.stackexchange.com/a/85664) giving insight on how rolling codes often work
- [Microchip HSC301 Datasheet](http://ww1.microchip.com/downloads/en/devicedoc/21143b.pdf), an encoder IC which implements the KeeLoq rolling code scheme
- [Ars Technica article](https://arstechnica.com/information-technology/2015/08/meet-rolljam-the-30-device-that-jimmies-car-and-garage-doors/) on RollJam

### Further Reading
- [A twitter thread](https://x.com/Foone/status/1383515888645591041) by foone of a wireless doorbell teardown
- Blog post by Chaos-Sec-Lab about hacking RF keys ([archive](https://web.archive.org/web/20231031154849/https://chaos-lab.blogspot.com/2023/10/grand-theft-auto-rf-locks-hacking.html))
- [Video by Andreas Spiess](https://www.youtube.com/watch?v=stQPjNI7_DA) discussing the use of URH to decode transmissions from a Tyre Pressure Monitoring System (TPMS)

</div>

---

[^1]: It's been difficult trying to find the exact rules for this band in Europe.  A lot of people online are saying this band is reserved for military use.  Ofcom in the UK reserve the 312-315 MHz band for Earth-to-space communications (5.255).

[^2]: The term OOK is typically only used when working with digital data.  The same technique is used when sending Morse code, although in this case it's typically called **Continuous Wave** (CW).

[^3]: These screenshots were taken with my oscilloscope in "roll mode".  Conventionally, when a scope is drawing a signal and it gets to the end of the screen, it just goes back to the start and overwrites what was already there (like a EKG).  (It redraws the screen so quickly you don't notice)  In Roll Mode, when a new sample is available, the entire signal gets shifted to the left, and the new signal is inserted at the right of the screen.  This makes it look like data is "streaming" out of the right of the screen.

[^4]: I demonstrated that my doorbell actually uses 433.859 MHz, but it's bandwidth is so wide that it can be picked up on the much more standard 433.92 MHz.

[^5]: I *do* know that for amplitude modulated schemes, a design called a [superheterodyne](https://en.wikipedia.org/wiki/Superheterodyne_receiver) is used.  I won't explain how they work but they're super cool!  [This video](https://www.youtube.com/watch?v=Vf06HSR4LdY) by w2aew explains them pretty well

[^6]: With one button per `Kn` pin, this allows for 4 buttons.  But if you treat the section as binary and do some clever wiring you can have up to 16 (2⁴) unique inputs or signals.

[^7]: I've tried to find info on the maximum data rate supported by the 433 MHz *receiver* modules.  Qiachip suggest they are typically used at 2.5 kbit, and a couple of other sources (like [this StackExchange answer](https://electronics.stackexchange.com/a/648942)) suggest that the maximum rate is 10 kbit.

[^8]: The sketch used a library called [rc-switch](https://github.com/sui77/rc-switch).  I actually used this library a lot for my research and I wanted to talk about it more but this post is long enough.  So, I decided to split it off into it's own post, which is coming soon.