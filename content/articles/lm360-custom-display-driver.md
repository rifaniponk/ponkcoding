---
title: 'Replacing the DeepCool LM360 App with a Custom Windows Display Driver'
slug: 'lm360-custom-display-driver'
description: 'How I replaced the official DeepCool software with a small Python driver for live CPU, GPU, RAM, and SSD telemetry on the LM360 pump-cap LCD.'
date: '2026-09-29'
category: 'Hardware Projects'
tags:
  - deepcool
  - lm360
  - python
  - windows
  - hardware-monitoring
  - usb
status: 'published'
author: 'Rifan Fauzi'
cover: '/images/articles/lm360-custom-display-driver/cover.jpg'
---

The LCD on an AIO pump is useful when it shows information I actually need. Instead of another vendor dashboard running in the background, I wanted a compact status screen for CPU, GPU, memory, and storage.

That led to `rifaniponk/LM360-custom-driver`, a small Windows driver for the DeepCool LM360 pump-cap display. After confirming that it works with the hardware, I uninstalled the official DeepCool software and let the custom driver take over the display.

![Live result from the custom LM360 display driver](/images/articles/lm360-custom-display-driver/lm360-display.jpg)

_The live result: the LM360 pump-cap LCD renders system telemetry without the official DeepCool application running in the background._

## What the display shows

The pump-cap LCD is a 320 × 240 RGB565 panel. The custom layout uses the small screen as a focused status surface:

- CPU temperature and load in a radial gauge
- GPU temperature and load in a second radial gauge
- RAM used, total capacity, and percentage in a progress bar
- SSD temperature and used capacity in a second progress bar

The color system is intentionally metric-aware. CPU and GPU load tolerate short spikes, so their warning colors start at higher utilization. RAM and storage capacity warn earlier because losing headroom there can create a more persistent problem.

## The important discovery: the LCD is a USB device

The project communicates with the pump-cap LCD directly over USB. The device is identified with:

```text
Vendor ID: 0x3633
Product ID: 0x0026
Resolution: 320 × 240
Pixel format: RGB565
Transport: USB bulk transfer
```

The transport code is deliberately isolated in `lm360_display.py`. It connects to the device, claims the USB interface, sends the initialization command, then sends a frame header followed by the RGB565 framebuffer.

The protocol was cross-checked against [daedlock/deepcool-lm](https://github.com/daedlock/deepcool-lm), an MIT-licensed reverse-engineering project. That reference documents the same initialization, frame, and brightness command bytes for the LM-series pump-cap display.

## A clean separation between sensors, rendering, and transport

The repository is small, but it has a useful architecture:

```text
Windows sensors ──> plain stats dict ──> Pillow renderer ──> RGB565 framebuffer ──> USB LCD
```

### `sensors_windows.py`

This module reads telemetry through LibreHardwareMonitorLib using Python.NET. It enables CPU, GPU, memory, and storage hardware categories, then selects sensors by type and fuzzy name matching instead of hardcoding a specific CPU or GPU vendor.

It also includes two practical fallbacks:

- storage capacity comes from `shutil.disk_usage("C:\\")`
- integrated GPU load can come from the Windows Performance Data Helper GPU Engine counters when LibreHardwareMonitor does not enumerate a GPU device

CPU temperature and clock access may require the PawnIO kernel driver and an elevated process. If those readings are unavailable, the rest of the display can still continue with the values that Windows exposes.

### `render.py`

The renderer knows nothing about USB or Windows. It accepts a normal Python dictionary, draws the screen with Pillow, and returns an RGB image.

The image is rendered at three times the target resolution and downscaled with Lanczos resampling. That supersampling makes circles, arcs, and small text look smoother on a low-resolution 320 × 240 panel. The final conversion packs each pixel into little-endian RGB565 bytes.

The separation makes the renderer easy to test independently. A future developer can feed it fake sensor values, inspect the generated image, and never need the physical pump connected.

### `pc_display.py`

The main loop runs at roughly one frame per second:

1. Read all available sensors.
2. Render a new Pillow image.
3. Send the frame to the LM360.
4. Sleep for the remainder of the one-second interval.

USB failures are handled as a reconnect event. The display is closed, the program waits for the device, and then it tries again. That matters for an internal USB device because a reboot, cable change, or transient error should not require manually restarting the whole driver.

The process also writes rotating logs under `%LOCALAPPDATA%\\LM360Driver\\logs`, which is important because the driver normally runs headless through Task Scheduler.

## Installation and startup

The project targets Windows 10 and 11 with Python 3.10 or newer. The installer script performs the setup from an elevated PowerShell session:

1. Install the Python dependencies from `requirements.txt`.
2. Install PawnIO unless explicitly skipped.
3. Disable DeepCool autostart entries and scheduled tasks when found.
4. Register a hidden `LM360CustomDisplay` Task Scheduler task.
5. Start the task immediately.

The scheduled task runs with the highest privilege at user logon and is configured to restart after failures. The repository also includes `Uninstall.cmd` and `uninstall.ps1` to remove the scheduled task and stop a running instance.

I chose this approach instead of building a native Windows service because the project is primarily a personal hardware utility. Python keeps the sensor and rendering code easy to iterate on, while Task Scheduler provides enough lifecycle management for a desktop machine.

## Why remove the official software?

The official DeepCool application is bloated and frustrating for this use case. It takes up far more space and complexity than a simple telemetry screen should need, while still being less configurable than what I actually want. I do not need a bigger dashboard. I need a small driver that puts the exact metrics and layout I care about on the display. A custom driver gives me control over:

- exactly which metrics are visible
- how the information is prioritized on the small panel
- the refresh interval
- reconnect behavior
- the logging location
- whether the vendor software needs to remain installed and active

This is not a universal replacement for every DeepCool feature. It focuses on the display path and system telemetry. Features owned by the official application should be treated as out of scope unless they are explicitly implemented and tested in the custom project.

## Things to keep in mind

This kind of hardware project has a few sharp edges:

- USB protocol details are hardware-specific. Do not assume every DeepCool model uses the same identifiers or command bytes.
- A display driver should fail gracefully when a sensor is unavailable. Blank values are better than crashing the entire frame loop.
- Elevated access and kernel drivers deserve extra scrutiny. Install only dependencies you understand and review scripts before running them as administrator.
- Vendor software can change device state or compete for the USB interface. Disable or remove it carefully, and keep the official recovery path available if you need to troubleshoot.
- The project currently targets the C: drive for capacity reporting. Multi-drive support would be a natural future improvement.

## The payoff

The result is a focused status screen that starts with Windows, updates once per second, reconnects after transient USB failures, and does not need the official DeepCool application running in the background.

More importantly, the project turns an opaque hardware accessory into a small, understandable system: sensors become data, Pillow turns that data into pixels, and a short USB transport layer moves those pixels to the pump cap.
