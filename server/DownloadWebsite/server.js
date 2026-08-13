// Standard Vars festlegen + Sachen importieren
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const readline = require("readline");
const app = express();
const ServerCMDs = ["exit"];
const path = require("path");
const fs = require("fs");
const port = process.env.PORT || 3000;
const { compToken } = require("./tokenCompare.js");

const Errors = {
  fatalerror: [],
  error: [],
  warnungen: [],
};

var newWarningExist = false;
var dateOfWarning = [];
var SeverityOfWarning = [];

// CONFIG
const tokens = [
  "$2b$12$yIrEmqdgCr7QQZeCEb8j5O0pC38AWMBJsoSZdzAgpeYbwTijooz92", // Token for ninaPush
  "$2b$12$WCNcVEZlU9YHCWvpfa.YeehMtL8bt5iEp88Nz2SBBtxKmKVSS1.rO", // Token for ninaPush online server status
  "$2b$12$PyeMJ1x7XJLZgyD/5w7qxe5Pg/jyGUkv7Q9ZuADsf6JtNn6jYDWgW", // Token for ninaPush Transcritpt etc.
];
// No config behind this point, keine config nach diesem punkt leeel


// Outputs
const Error500 = "[ERROR]: Unbekannter Interner Serverfehler";

// Apps Usen:
app.use(express.json());
app.use(cors());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  if (input === ServerCMDs[0]) {
    console.log("Server wird heruntergefahren");
    process.exit();
  }
});

function getFilePath() {
  var filePath = path.join(__dirname, "Warnungen", "output.mp3");
  return fs.existsSync(filePath) ? filePath : "N/A";
}

function severityToNumber(severity) {
  if (severity === "Minor") {
    return 1;
  }
  else if (severity === "Moderate") {
    return 2;
  } else if (severity === "Severe") {
    return 3;
  } else if (severity === "Extreme") {
    return 4;
  }
}

var serverRunningBoolean = false;
var ninattsRunningBoolean = false;
var ninattsRunningDate = "N/A";
var ninattsSeverity = "N/A";
var ninattsTitle = "N/A";
var ninattsTranscript = "N/A";
var ninattsserverStatusText = "Unknown Internal Server Error";


app.get("/server/nina/audio/Warnungen", (req, res) => {
  console.log("[INFO]: Get-Request: /server/nina/audio/Warnungen")
  var file = getFilePath();
  if (ninattsRunningBoolean) {
    SeverityOfWarning = severityToNumber(ninattsSeverity);
  } else {
    SeverityOfWarning = [];
  }

  const warnungDownloadJSON = {
    neueWarnung: newWarningExist,
    datum: dateOfWarning,
    schweregrad: SeverityOfWarning, // 1 = Minor, 2 = Moderate, 3 = Severe, 4 = Extreme
    downloadPath: file !== "N/A" ? "/server/nina/audio/Warnungen/Download" : [],
  }
  res.status(200).send(warnungDownloadJSON);
});

app.get("/server/nina/audio/Warnungen/Download", (req, res) => {
  var file = getFilePath();

  if (file === "N/A") {
    res.status(404).json("Keine Warnung gefunden");
    return;
  }

  res.download(file, (err) => {
    if (err) {
      res.status(500).send(Error500);
      Errors.error.push(`${Error500} bei /downloadSeverExtrem`);
    }
  });
});

var data = [];
app.post("/server/nina/status/push", async (req, res) => {
  const { fatalerrs, errs, warnings, token } = req.body;
  if (!(await compToken(token, tokens[0]))) {
    res.status(403).send("403 Forbidden");
    console.log("[WARNING]: 403 Forbidden, Invalid Token");
  } else {
    data = { fatalerrs, errs, warnings };
    res.status(200).json("Successfully Pushed Data");
    console.log("[INFO]: 200 Successfully Pushed Data: NINA Errors");
  }
});

app.post("/server/nina/status/online/push", async (req, res) => {
  const { online, token } = req.body;
  if (!(await compToken(token, tokens[1]))) {
    res.status(403).send("403 Forbidden");
    console.log("[WARNING]: 403 Forbidden, Invalid Token");
  } else {
    res.status(200).json("Successfully Pushed Data");
    serverRunningBoolean = false;
    if (online) {
      console.log("[INFO]: 200 Successfully Pushed Data: NINA Server ONLINE");
      serverRunningBoolean = true;
    } else {
      console.log("[INFO]: 200 Successfully Pushed Data: NINA Server OFFLINE");
      ninattsserverStatusText = "Unknown Internal Server Error";
      ninattsTitle = "ERROR";
      ninattsTranscript =
        "ERROR! Da die TTS Engine OFFLINE ist, ist es unbekannt ob gerade eine Warnung am laufen ist. Bitte kontaktieren sie ihren Administrator oder starten sie die TTS Engine. " +
        "Sobald die TTS Engine ONLINE ist, wird automatisch die NINA TTS Anzeige zur�ckgesetzt. DIE TTS MUSS EINMAL STARTEN WERDEN UND DANN PER EXIT GESCHLOSSEN WERDEN. DANACH MUSS DIESE NOCHMAL GESTARTET WERDEN! FALLS EINE WARNUNG IM MOMENT VORGELESEN WIRD JEDOCH DIE ENGINE NEUGESTARTET WIRD, WIRD DIE VORHERIGE MELDUNG NICHT MEHR ANGEZEIGT!";
    }
  }
});

app.post("/server/nina/tts/push", async (req, res) => {
  const { transcript, severity, date, title, off, token } = req.body;
  if (!(await compToken(token, tokens[2]))) {
    res.status(403).send("403 Forbidden");
    console.log("[WARNING]: 403 Forbidden, Invalid Token2");
  } else {
    res.status(200).json("Successfully Pushed Data");
    if (off) {
      console.log("[INFO]: 200 Successfully Pushed Data: TTS OFFLINE");
      ninattsRunningBoolean = false;
      ninattsRunningDate = "N/A";
      ninattsSeverity = "N/A";
      ninattsTitle = "N/A";
      ninattsTranscript = "N/A";
      newWarningExist = false;
      dateOfWarning = [];
    } else {
      console.log("[INFO]: 200 Successfully Pushed Data: TTS ONLINE");
      ninattsRunningBoolean = true;
      ninattsRunningDate = date;
      ninattsSeverity = severity;
      ninattsTitle = title;
      ninattsTranscript = transcript;
      newWarningExist = true;
      dateOfWarning = date;
    }
  }
});


app.get("/server/status", (req, res) => {
  const errorEntries = [
    ...Errors.fatalerror.map((m) => ({
      ts: new Date().toISOString(),
      level: "error",
      msg: "[FATAL] " + m,
    })),
    ...Errors.error.map((m) => ({
      ts: new Date().toISOString(),
      level: "error",
      msg: m,
    })),
    ...Errors.warnungen.map((m) => ({
      ts: new Date().toISOString(),
      level: "warn",
      msg: m,
    })),
    ...(data.fatalerrs || []).map((m) => ({
      ts: new Date().toISOString(),
      level: "error",
      msg: "[NINA FATAL] " + m,
    })),
    ...(data.errs || []).map((m) => ({
      ts: new Date().toISOString(),
      level: "error",
      msg: "[NINA] " + m,
    })),
    ...(data.warnings || []).map((m) => ({
      ts: new Date().toISOString(),
      level: "warn",
      msg: "[NINA] " + m,
    })),
  ];

  console.log("[DEBUG]: /server/status request called");

  var body = {
    nina: {
      active: serverRunningBoolean,
      speaking: ninattsRunningBoolean,
      severity: ninattsSeverity,
      title: ninattsTitle,
      message: ninattsTranscript,
      sent: ninattsRunningDate,
      audioDownloadPath: "/server/nina/audio/Warnungen/Download",
    },
    errors: errorEntries,
  };
  res.status(200).send(body);
});


// PORT
app.listen(port, '0.0.0.0', () => console.log(`SERVER: Belauscht Port ${port}`));
console.log("CMDs f�r Server:", ServerCMDs);
