# nina-tts-alert
A Node.js "Server" that fetches official alert messages (from the BKK, api: NINA <- The German Civil Warning Oraganisation), converts them into speech, and saves the output as output.mp3. The generated audio can be played through an intercom or speaker system to broadcast warnings.
Due to this project featuring the BBK, all CMDs (+Errors) and therefore Warnings are currently **in German**. A Support for Warnings, CMDs (+Errors) in **English is not planned but may come in the future**.
## Tech
- `Coqui TTS`
- `Node.js`
- `FFmpeg`
## Features
- Real Time Warnings (output: Audio; german TTS voice || Interval Check or force request)
- Changable Fetch Request for Warnings (For Areas after the Official ARS; in Console: changable with Commands )
- Console Log + Commands
## Running the Project
Note: Everything should be installed in the **same Directory** (./server)
- Install Node.js
- Install python3 (python3.10.13)
- Install FFmpeg
- Install venv
- Create a Virtual Enviroment (with venv)
- Install TTS
- Open the Console (in ./server)
- Run node server.js
-> The Programm should be running
## Console Commands
  - `exit`: Exits the Program, so you dont have to close the Console and Re-open it
  - `napi: nop`: Changes the NINA API to the normal NINA API
  - `napi: test`: Changes the NINA API to the test API
  - `lw: r`: Resets the Variable letzeWarnung (i.e. it **Resets the Last Warning**)
  - `lw: p`: Prints the Variable letzeWarnung (i.e. it **Prints the Last Warning**)
  - `napi: p`: Prints which NINA API is in use
  - `naaf: ak`: Activates the Automatic Fetch Request for the NINA API (i.e. **Activates the Real Time Warning System**)
  - `naaf: dak`: De-Activates the Automatic Fetch Request for the NINA API (i.e. **Deactivates the Real Time Warning System**)
  - ´naaf: frq´: Starts a manual Fetch Request for the NINA API
  - `ram: c`: Clears the RAM of the Program 
  - `ram: p`: Prints the RAM of the Program
  - `msg: ct`: Tests the Coloring of Messages (i.e. Tests if Errors are displayed red...)
## Meanings of unclear Stuff
### RAM 
The RAM of the Programm saves up to 9 Warnings to prevent looping of the TTS System. This would happen if 2 Warnings where present and the Filtering System Checks only for the Last Warning.

**Example with 2 Warnings:**

TTS System outputs the first warning --> Programm Checks for another Warning that isnt the Last Warning --> TTS System outputs second Warning --> Programm Checks for another Warning that isnt the Last Warning --> TTS System outputs the first warning --> **LOOP**

### Normal and Test API
The *normal* API is checking for Warnings in the Area selected by the ARS Code. This API shouldnt be changed once SetUp (you can always change it; this is the API that checks for Warnings for example where you live. It shouldnt be changed only if you move to another Place as in an example).
The *test* API is also checking for Warnings in the Area selected by the ARS Code.. This API should be changed to a place where a known Warning has been stated to test the System if it works (Check with the NINA App where a Warning for a City is. Then change the ARS
Code of the test API. Change the API by using the Commands in the Console when the programm is running and do a manual fetch Request).
### Naaf
The naaf (NINA Automatische Abfrage, i.e. NINA Automatic Fetch System) activates or deactivates the *Real Time Warning System*. This Setting once enabled, checks every 10sec for a Warning for the selected API (Check the Console Commands on how to enable / disable / change the API).
## How it all Works
The program will check for Warnings in the Area, either by a manual fetch request or by the naaf if activated (Learn more about the Naaf in the Chapter "Meanings of unclear Stuff", chapter "Naaf")
Once a Warning has been fetched for the Area (i.e. the BBK made a Warning for the selected Area), the Programm will fetch the Description and insert it in the Standard Warning Schemetic. After the full text has been generated, the TTS Programm will convert the Text into an .wav File.
FFmpeg will now merge this .wav file with the right Annoucement Gong. Then the ready to play Audio file will be saved as output.mp3.
