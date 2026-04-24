# nina-tts-alert
A Node.js server that fetches official alert messages from the BBK (Bundesamt für 
Bevölkerungsschutz und Katastrophenhilfe) via the NINA API, converts them to speech, 
and saves the output as output.mp3. The generated audio can be played through an 
intercom or speaker system to broadcast warnings.
Due to this project featuring the BBK, all console output (including commands and errors) 
and therefore warnings are currently **in German**. Support for warnings, commands, and 
errors **in English is not planned but may come in the future**.

## Tech
- `Coqui TTS`
- `Node.js`
- `FFmpeg`

## Features
- Real-time warnings (output: audio; German TTS voice — interval check or manual fetch request)
- Configurable fetch request for warnings (for areas defined by the official ARS code; configurable via console commands)
- Console log & commands
- Sorting by warning severity
- Warning schematic

## Running the Project

- Install Node.js
- Install Python 3.10.13
- Install FFmpeg
- Install venv
- Create a virtual environment (with venv)
- Install TTS
- Open the console (in ./server)
- Run `node server.js`

→ The program should now be running.
> Note: Everything should be installed in the **same directory** (./server)

## Console Commands
- `exit`: Exits the program, so you don't have to close and re-open the console
- `napi: nop`: Switches the NINA API to the normal NINA API
- `napi: test`: Switches the NINA API to the test API
- `lw: r`: Resets the variable letzeWarnung (i.e. **resets the last warning**)
- `lw: p`: Prints the variable letzeWarnung (i.e. **prints the last warning**)
- `napi: p`: Prints which NINA API is currently in use
- `naaf: ak`: Activates the automatic fetch request for the NINA API (i.e. **activates the real-time warning system**)
- `naaf: dak`: Deactivates the automatic fetch request for the NINA API (i.e. **deactivates the real-time warning system**)
- `naaf: frq`: Starts a manual fetch request for the NINA API
- `ram: c`: Clears the RAM of the program
- `ram: p`: Prints the RAM usage of the program
- `msg: ct`: Tests the coloring of messages (i.e. tests whether errors are displayed in red, etc.)
- `ttsovr: true`: Manually activates the TTS Override
- `ttsovr: false`: Manually deactivates the TTS Override
- `tts: force`: Activates TTS Force
- `tts: dforce`: Deactivates TTS Force

## Meanings of Unclear Terms

### Gong
The gong is an attention sound that plays before the warning is read by the TTS system.
This gong is included in the repository.
- `gong_moderat.mp3`: Plays if the severity of the warning is moderate
- `gong_schwer_extreme.mp3`: Plays if the severity of the warning is severe or extreme
- `warnungunterbrochen.wav`: Plays if TTS Override is active

> Note: Inspired by C.A.S.S.I.E., a facility AI from a video game.

### RAM
The RAM of the program stores up to 9 warnings to prevent the TTS system from looping. 
This would occur if 2 warnings were present and the filtering system only checked against 
the last warning.

**Example with 2 warnings:**

TTS system outputs the first warning → program checks for another warning that isn't the 
last warning → TTS system outputs the second warning → program checks for another warning 
that isn't the last warning → TTS system outputs the first warning → **LOOP**

> Note: The RAM cache is temporary and will be cleared when the program exits
> (via the `exit` command or by closing the console). Previously processed warnings
> may be read out again after a restart (if they are still active).

### Normal and Test API
The *normal* API checks for warnings in the area selected by the ARS code. This API 
should not be changed once set up (it is the API that checks for warnings in, for example, 
your area. It should only be changed if you move to a different location.)

The *test* API also checks for warnings in an area selected by the ARS code. This API 
should be pointed to a location where a known warning has been issued, in order to test 
whether the system works correctly. (Check the NINA app to find a city with an active 
warning, then update the ARS code of the test API. Switch APIs using the console commands 
while the program is running, then perform a manual fetch request.)

### Naaf
The naaf (NINA Automatische Abfrage, i.e. NINA Automatic Fetch System) activates or
deactivates the *real-time warning system*. Once enabled, it checks every 10 seconds for
a warning from the selected API (see console commands on how to enable, disable, or
change the API).

The naaf can also perform a one-time fetch request (`naaf: frq` — see Console Commands
for more details).

> Note: The server must be running 24/7 for the real-time warning system to work.

### TTS Override
The TTS Override activates automatically when a new warning with a higher severity than 
the current one has been issued for the area. It can also be activated manually 
(see Console Commands → `ttsovr`).

### TTS Cooldown
After a warning has been processed, the TTS system will not process any other warnings 
for 5 minutes. This cooldown can only be bypassed by the TTS Override.

### TTS Force
The TTS Force skips all checks in the `playTTSQueue` function. **Use with caution** — 
this will bypass:
- Loop prevention
- Previously processed warning checks
- The TTS-already-running check

## How It All Works
The program checks for warnings in the selected area, either via a manual fetch request 
or automatically via the naaf if activated (see "Meanings of Unclear Terms" → "Naaf").

Once a warning has been fetched for the area (i.e. the BBK has issued a warning for the 
selected area), the program fetches the description and inserts it into the standard 
warning schematic. After the full text has been generated, the TTS program converts the 
text into a .wav file.

FFmpeg then merges this .wav file with the appropriate announcement gong. The final audio 
file is saved as output.mp3.

## Configuration

### ARS
[The Official Municipal Code (AGS), formerly also known as the Official Municipal 
Identification Number (GKZ), Municipal Identification Number, or Municipal Code Number, 
is a numerical sequence used to identify politically independent cities, municipalities, 
or unincorporated areas in Germany.](https://de.wikipedia.org/wiki/Amtlicher_Gemeindeschl%C3%BCssel#Regionalschl%C3%BCssel)
This system is used by the BBK (as stated on the website: [nina.api.bund.dev](https://nina.api.bund.dev/)). 
You can find the ARS code for your city [here](https://www.xrepository.de/api/xrepository/urn:de:bund:destatis:bevoelkerungsstatistik:schluessel:rs_2021-07-31/download/Regionalschl_ssel_2021-07-31.json).

> Note: The last 7 digits must be replaced with "0"

### Change of the API
If the ARS code is for the normal API, copy & paste it into the variable `ARSkeintest` 
in `server.js` (e.g. with WebStorm). If the ARS code is for the test API, copy & paste 
it into the variable `ARStest` in `server.js` (e.g. with WebStorm).

After saving, the ARS code should have updated for the selected API. You can verify this 
by switching to that API (while the program is running) using `napi` (see: Meanings of 
Unclear Terms → Normal and Test API | Console Commands → `napi`).

### Important Notes on Configuration
As of now (2026-04-24, format: YYYY-MM-DD), the program does not have many configuration 
options (e.g. for English warnings).

## Examples of Warnings

#### MP4
https://github.com/TeichArmband35/nina-tts-alert/blob/main/test/warnung.mp4

#### MP3 (output.mp3)
https://github.com/TeichArmband35/nina-tts-alert/blob/main/test/output.mp3

## Legal Notice
This project is intended for **private, non-commercial use only** (e.g. home intercom systems).
The author is not responsible for any misuse of this software.
By using this project, you agree to comply with all applicable local laws and regulations.
This project is not affiliated with, endorsed by, or connected to the BBK or any government agency.
