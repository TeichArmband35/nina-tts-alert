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
