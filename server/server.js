
// Config, ARS für Landkreis hier eingeben:
const ARStest = []; // ARS hier einfügen für test; Das ist nicht der normale Bereich, hier kann man den ARS reinmachen wo es gerade eine Warnung gibt (nina app nachschauen) um zu testen ob das system funktioniert
const ARSkeintest = []; // ARS hier einfügen; Hier sollte Standard mäßig der Ort sein wo man lebt bzw. wo man warnungen erhalten möchte falls was oassuert.


const RED = "\x1b[31m"; // Rot
const YELLOW = "\u001b[38;2;253;182;0m" // Gelb für Warnungen
const RESET = "\x1b[0m"; // Zurücksetzen der Farbe

const ErrorWarnung = RED + "[ERROR]:";
const WarnungWarnung = YELLOW + "[WARNUNG]:";
const Info = RESET + "[INFO]:";
const Debug = RESET + "[DEBUG]:";

async function log(msg, type) {
  var time = new Date().toISOString();
  if (type == 1) {
    console.log(`\x1b[35m${time}\x1b[0m ${ErrorWarnung} ${msg} ${RESET}`);
  }
  if (type == 2) {
    console.log(`\x1b[35m${time}\x1b[0m ${WarnungWarnung} ${msg} ${RESET}`);
  }
  if (type == 3) {
    console.log(`\x1b[35m${time}\x1b[0m ${Info} ${msg} ${RESET}`);
  }
  if (type == 4) {
    console.log(`\x1b[35m${time}\x1b[0m ${Debug} $n{msg} ${RESET}`);
  }
}

async function testColors() {
  for (let index = 1; index <= 4; index++) {
    await log("Test", index);
    console.log("[DEBUG]: Test Colors ak, index =", index);
  }
}

function newDate2() {
  return (date = new Date());
}

const tts = require("./warnungtts");
const { WarnungsNarchichtErstellen: buildTTS } = require("./warnungstextmaker");

const BASE_URL = "https://warnung.bund.de/api31";

const VHHnina = `${BASE_URL}/dashboard/096790000000.json`;
const TestNINA = `${BASE_URL}/dashboard/064110000000.json`;
const InfoNINA = `${BASE_URL}/warnings/`;

var highAlerts = [];
var letzeWarnung = [];
var NINAAbfrage = [];
const useofNINAa = [VHHnina, TestNINA];
var ttsQueue = [];
var ttsRunning = false;
var useOfNINA = 1;

function ramP() {
  date = new Date();
  log(`RAM-Print ak, output = ${JSON.stringify(ram)}`, 3);
}

function letzeWarnungReset() {
  letzeWarnung = [];
  log(
    `Letze Warnung gelöscht, letzeWarnung: ${JSON.stringify(letzeWarnung)}`,
    3,
  );
}

const ram = {
  RamSpeicher1: [],
  RamSpeicher2: [],
  RamSpeicher3: [],
  RamSpeicher4: [],
  RamSpeicher5: [],
  RamSpeicher6: [],
  RamSpeicher7: [],
  RamSpeicher8: [],
  RamSpeicher9: [],
};

async function ramClearen() {
  for (let i = 1; i <= 9; i++) {
    ram[`RamSpeicher${i}`] = [];

    if (JSON.stringify(ram[`RamSpeicher${i}`]) == "") {
      return await log("Fehler - RAM ist LEER");
    }

    await log(
      `RamSpeicher${i} wird gecleart, RamSpeicher${i} = ${JSON.stringify(ram[`RamSpeicher${i}`])}`,
      3,
    );
  }
}

function warnRAMEntCheck(text) {
  for (let i = 1; i <= 9; i++) {
    if (text == ram[`RamSpeicher${i}`]) {
      return true;
    } else if (i == 9 && text !== ram[`RamSpeicher${i}`]) {
    } else {
      continue;
    }
  }
}

async function letzeWarnungPrint() {
  await log(`Letze Warnung = ${JSON.stringify(letzeWarnung)}`, 3);
}

const ServerCMDs = [
  "exit",
  "napi: nop",
  "napi: test",
  "lw: r",
  "lw: p",
  "napi: p",
  "naaf: ak",
  "naaf: dak",
  "naaf: frq",
  "ram: c",
  "ram: p",
  "msg: ct",
];
console.log(
  (date = new Date()),
  "[INFO]: Verfügbare Server-Befehle sind:",
  ServerCMDs,
);
const readline = require("readline");
const { Server } = require("http");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  if (input === ServerCMDs[0]) {
    log("Server wird Heruntergefahren", 3);
    process.exit();
  } else if (input === ServerCMDs[1]) {
    useOfNINA = 0;
    log(`NINA Check API wird geändert zu: ${useofNINAa[useOfNINA]}`, 3);
  } else if (input === ServerCMDs[2]) {
    useOfNINA = 1;
    log(`NINA Check API wird geändert zu: ${useofNINAa[useOfNINA]}`, 3);
  } else if (input == ServerCMDs[3]) {
    letzeWarnungReset();
  } else if (input == ServerCMDs[4]) {
    letzeWarnungPrint();
  } else if (input == ServerCMDs[5]) {
    log(`NINA Check API in benutzung: ${useofNINAa[useOfNINA]}`, 3);
  } else if (input == ServerCMDs[6]) {
    log("Auto NINA Abfrage gestartet", 3);
    NINAautoAbfrageStarten();
  } else if (input == ServerCMDs[7]) {
    log("Auto NINA Abfrage gestoppt", 3);
    NINAautoAbfrageStop();
  } else if (input == ServerCMDs[8]) {
    log("NINA Abfrage - Force Request", 3);
    ninaAbfrageFetch();
  } else if (input == ServerCMDs[9]) {
    log("RAMClearer START", 4);
    ramClearen();
  } else if (input == ServerCMDs[10]) {
    log("RAMPrinter CALL", 4);
    ramP();
  } else if (input == ServerCMDs[11]) {
    testColors();
  } else {
    log(`SyntaxError, befehl nicht erkannt - Input(${input})${RESET}`, 1);
  }
});

const severityRank = {
  Extreme: 5,
  Severe: 4,
  Moderate: 3,
  Minor: 2,
  Unknown: 1,
};

const warnungsGruppen = {
  Extreme: [],
  Severe: [],
  Moderate: [],
  Minor: [],
};

async function ninaAbfrageFetch() {
  console.log(new Date(), "[DEBUG]: NINA Abfrage fetch rq call");
  console.log("[DNS CHECK BEFORE FETCH]", require("dns").getServers());

  const data = await safeFetch(useofNINAa[useOfNINA]);
  if (!data) return;

  highAlerts = data
      .filter((alert) => {
        const severity = alert.payload.data.severity;
        const urgency = alert.payload.data.urgency;

        return (
            ["Extreme", "Severe", "Moderate", "Minor", "Unknown"].includes(severity) &&
            urgency === "Immediate"
        );
      })
      .map((alert) => ({
        id: alert.id,
        headline: alert.payload.data.headline,
        severity: alert.payload.data.severity,
        urgency: alert.payload.data.urgency,
        area: alert.payload.data.area.data,
        sent: alert.sent,
      }));

  if (highAlerts.length === 0) {
    log("Keine Aktiven Alarmmeldungen", 2);
  }

  highAlerts.sort((a, b) => {
    return severityRank[b.severity] - severityRank[a.severity];
  });

  for (const alert of highAlerts) {
    if (alert.severity === "Extreme") warnungsGruppen.Extreme.push(alert);
    else if (alert.severity === "Severe") warnungsGruppen.Severe.push(alert);
    else if (alert.severity === "Moderate") warnungsGruppen.Moderate.push(alert);
    else if (alert.severity === "Minor") {
      warnungsGruppen.Moderate.push(alert);
      // log("Alert severity zu low", 2);
    }
  }

  await processAlerts();
}

async function safeFetch(url) {
  try {
    console.log("[FETCH TRY]:", url);

    const response = await fetch(url);

    console.log("[FETCH STATUS]:", response.status);

    const data = await response.json();
    return data;

  } catch (error) {
    console.log("[FETCH ERROR RAW]:", error);
    return null;
  }
}

async function processAlerts() {
  const reihenfolge = ["Extreme", "Severe", "Moderate", "Minor"];

  for (const severity of reihenfolge) {
    var gruppe = warnungsGruppen[severity];

    function dateNew() {
      var date = new Date();
      return date;
    }

    console.log(dateNew(), "[DEBUG]: Inhaltsprüfung von Gruppe", severity);
    if (gruppe == "") {
      console.log(dateNew(), "[DEBUG]: Gruppe leer");
      continue;
    } else {
      console.log(dateNew(), "[DEBUG]: Gruppe nicht leer");
    }

    for (const alert of gruppe) {
      await InfoZurWarnung(alert.id);
    }
  }
}

async function InfoZurWarnung(AlertID) {
  function dateNew() {
    var date = new Date();
    return date;
  }

  var headline = [];
  var description = [];
  var event = [];
  var urgency = [];
  var severity = [];
  var InfoNINAreq = InfoNINA + AlertID + ".json";
  console.log(
    dateNew(),
    "[DEBUG]: FetchRQ startet - Get: Genaue Informationen zur Warnung",
  );
  await fetch(InfoNINAreq)
    .then((response) => {
      if (!response.ok) {
        return console.error(
          `${RED}${newDate2()} [ERROR]: HTTP-Fehler bein InfoNINAreq: ${response.status}${RESET}`,
        );
      }
      return response.json(); // Antwort als JSON parsen
    })
    .then((data) => {
      headline = data.info[0].headline;
      description = data.info[0].description;
      event = data.info[0].event;
      urgency = data.info[0].urgency;
      severity = data.info[0].severity;
      ttsWarnung = buildTTS(
        headline,
        description,
        event,
        urgency,
        severity,
        data,
      );
      console.log(dateNew(), "[DEBUG]: TTS Call");
      ttsQueue.push({ text: ttsWarnung.normalize("NFC"), schweregrad: severity });
      playTTSQueue();
    })

    .catch((error) => log(error, 1));
}

function NINAautoAbfrageStarten() {
  NINAAbfrage = setInterval(() => ninaAbfrageFetch(), 10000);
}

function NINAautoAbfrageStop() {
  clearInterval(NINAAbfrage);
}

async function playTTSQueue() {
  if (ttsRunning) {
    log(`[DEBUG]: TTS Call abgelehnt da TTS Running = ${ttsRunning}`, 4);
    return;
  }
  ttsRunning = true;

  while (ttsQueue.length > 0) {
    const { text, schweregrad } = ttsQueue.shift(); // <-- destructuring

    if (warnRAMEntCheck(text)) {
      log("[DEBUG]: TTS Call abgelehnt da letzeWarnung = InputTTS text", 2);
      continue;
    }

    console.log((date = new Date()), "[DEBUG]: Transcript =", { text });
    console.log((date = new Date()), "[DEBUG]: Schweregrad =", schweregrad);

    await new Promise((resolve) => {
      tts.speak(text, schweregrad, resolve);
      letzeWarnung = text;
      ramPush(letzeWarnung);
    });
  }

  ttsRunning = false;
}

function ramPush(letzeWarnung) {
  if (ram.RamSpeicher1.length == 0) {
    console.log((date = new Date()), "[DEBUG]: RAM SpeicherSlot1 InputPUSH");
    ram.RamSpeicher1.push(letzeWarnung);
  } else if (ram.RamSpeicher1.length !== 0) {
    if (ram.RamSpeicher8.length !== 0) {
      ram.RamSpeicher8 = ram.RamSpeicher9;
      log(
        "[DEBUG]: RAM SpeicherSlot8 PUSH -> SpeicherSlot9", 4
      );
    }
    if (ram.RamSpeicher7.length !== 0) {
      ram.RamSpeicher7 = ram.RamSpeicher8;
      log(
        "[DEBUG]: RAM SpeicherSlot7 PUSH -> SpeicherSlot8", 4
      );
    }
    if (ram.RamSpeicher6.length !== 0) {
      ram.RamSpeicher6 = ram.RamSpeicher7;
        log(
        "[DEBUG]: RAM SpeicherSlot6 PUSH -> SpeicherSlot7", 4
      );
    }
    if (ram.RamSpeicher5.length !== 0) {
      ram.RamSpeicher5 = ram.RamSpeicher6;
      log(
        "[DEBUG]: RAM SpeicherSlot5 PUSH -> SpeicherSlot6", 4
      );
    }
    if (ram.RamSpeicher4.length !== 0) {
      ram.RamSpeicher4 = ram.RamSpeicher5;
      log(
        "[DEBUG]: RAM SpeicherSlot4 PUSH -> SpeicherSlot5", 4
      );
    }
    if (ram.RamSpeicher3.length !== 0) {
      ram.RamSpeicher3 = ram.RamSpeicher4;
      log(
        "[DEBUG]: RAM SpeicherSlot3 PUSH -> SpeicherSlot4", 4
      );
    }
    if (ram.RamSpeicher2.length !== 0) {
      ram.RamSpeicher2 = ram.RamSpeicher3;
      log(
        "[DEBUG]: RAM SpeicherSlot2 PUSH -> SpeicherSlot3", 4
      );
    }
    ram.RamSpeicher1 = ram.RamSpeicher2;
    log(
      "[DEBUG]: RAM SpeicherSlot1 PUSH -> SpeicherSlot2", 4
    );
    ram.RamSpeicher1.push(letzeWarnung);
    log("[DEBUG]: RAM SpeicherSlot1 InputPUSH", 4);
  } else {
    console.log(
      `${RED} ${newDate2()} [ERROR]: RamSpeicher-Error: (RamSpeicher1.length == 0) = false, (RamSpeicher1.length !== 0) = false; Loggen von RAM SpeicherSlots:${RESET}`,
      ram,
      `\n${RESET}[INFO]: Run ram: c, um RAM zu clearen${RESET}`,
    );
  }
}
