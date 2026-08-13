// CONFIG
const ARStest =     "066350000000";
// const ARStest =         "051620000000";
const ARSkeintest = "096790000000";

var port = "3000";

const url = `http://localhost:${port}/server/nina/status/push`;
const url2 = `http://localhost:${port}/server/nina/status/online/push`;
const url3 = `http://localhost:${port}/server/nina/tts/push`;

var serverStatusonline = true;
var offtts = true;

const hash = "0402PW11!n1naS3rverT0kenF0rPush";
const hash2 = "0402PW11!n1naS3rverT0kenF0r0nl1neP3sh";
const hash3 = "0402PW11!n1naS3rverT0kenF0rT3nscr111iptAn432424dT52652646326TSpush";

// no config after this point, keine config nach diesem punkt lol

var cmdInputErlaubt = true;
var testaktv = false;

const logs = {
    fatalerrs: [],
    errs: [],
    warnings: [],
    token: hash,
}

async function serverStatusUpdate() {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(logs)
        });

        if (!response.ok) {
            return console.log("[ERROR]: Netzwerk FEHLER!")
        }

        const data = await response.json()
        await log(data, 3, false);

    } catch (err) {
        console.error("ExpressServer nicht erreichbar:", err);
    }
}

async function serverStatus() {

    const online = {
        online: serverStatusonline,
        token: hash2,
    }

    try {
        const response = await fetch(url2, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(online)
        });
        if (!response.ok) {return console.log("[ERROR]: Netzwerk FEHLER!")}
        const data = await response.json()
        await log(data, 3, false);

    } catch (err) {
        console.error("ExpressServer nicht erreichbar:", err);
    }
}

async function ttsStatus(transcript, severity, date, title) {

    const tts = {
       transcript: transcript,
        severity: severity,
        date: date,
        title: title,
        off: offtts,
        token: hash3,
    }

    try {
        const response = await fetch(url3, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tts)
        });
        if (!response.ok) {return console.log("[ERROR]: Netzwerk FEHLER!")}
        const data = await response.json()
        await log(data, 3, false);

    } catch (err) {
        console.error("ExpressServer nicht erreichbar:", err);
    }
}


async function pushLogInLogs(msg, type, override) {
    const safeMsg = (msg instanceof Error) ? (msg.stack || msg.message)
        : (typeof msg === 'object') ? JSON.stringify(msg)
            : String(msg);

    if (type === "error") {
        logs.errs.push(safeMsg);
    } else if (type === "warnung") {
        logs.warnings.push(safeMsg);
    } else if (type === "fatalerror") {
        logs.fatalerrs.push(safeMsg);
        if (!override) {
            await serverStatusUpdate();
            await serverStatus();
            process.exit(5);
        }
    }
    await serverStatusUpdate();
    await serverStatus();
}


const RED = "\x1b[31m"; // Rot
const YELLOW = "\u001b[38;2;253;182;0m" // Gelb f�r Warnungen
const RESET = "\x1b[0m"; // Zur�cksetzen der Farbe

const ErrorWarnung = RED + "[ERROR]:";
const WarnungWarnung = YELLOW + "[WARNUNG]:";
const Info = RESET + "[INFO]:";
const Debug = RESET + "[DEBUG]:";
var WarnungIssued = false;

async function log(msg, type, fatal) {
    var time = new Date().toISOString();
    if (type == 1) {
        console.log(`\x1b[35m${time}\x1b[0m ${ErrorWarnung} ${msg} ${RESET}`);
        if (!fatal) {
            await pushLogInLogs(msg, "error");
        } else {
            await pushLogInLogs(msg, "fatalerror");
        }
    }
    if (type == 2) {
        console.log(`\x1b[35m${time}\x1b[0m ${WarnungWarnung} ${msg} ${RESET}`);
        await pushLogInLogs(msg, "warnung");
    }
    if (type == 3) {
        console.log(`\x1b[35m${time}\x1b[0m ${Info} ${msg} ${RESET}`);
    }
    if (type == 4) {
        console.log(`\x1b[35m${time}\x1b[0m ${Debug} ${msg} ${RESET}`);
    }
}

async function testColors() {
    for (let index = 1; index <= 4; index++) {
        await log("Test", index);
        console.log("[DEBUG]: Test Colors ak, index =", index);
    }
}

function newDate2() {
    return (date = new Date().toISOString());
}

const tts = require("./warnungtts");
const {WarnungsNarchichtErstellen: buildTTS} = require("./warnungstextmaker");

const BASE_URL = "https://warnung.bund.de/api31";

const VHHnina = `${BASE_URL}/dashboard/${ARSkeintest}.json`;
const TestNINA = `${BASE_URL}/dashboard/${ARStest}.json`;
const InfoNINA = `${BASE_URL}/warnings/`;

var highAlerts = [];
var letzeWarnung = [];
var NINAAbfrage = [];
const useofNINAa = [VHHnina, TestNINA];
var ttsQueue = [];
var ttsRunning = false;
var useOfNINA = 1;
var TTSoverride = false;
var ttsForce = false;

var timer2 = 0; // 1 min: timer2 = 1

function ramP() {
    date = new Date();
    log(`RAM-Print ak, output = ${JSON.stringify(ram)}`, 3);
}

function letzeWarnungReset() {
    letzeWarnung = [];
    log(
        `Letzte Warnung gel�scht, letzteWarnung: ${JSON.stringify(letzeWarnung)}`,
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

        if (ram[`RamSpeicher${i}`].length !== 0) {
            await log(`Fehler; RAM ist nicht leer nach clear`, 1, true);
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
    await log(`Letzte Warnung = ${JSON.stringify(letzeWarnung)}`, 3);
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
    "ttsovr: true",
    "ttsovr: false",
    "tts: force",
    "tts: dforce",
    "wart: force",
    "testsys",
];
console.log(
    (date = new Date()),
    "[INFO]: Verf�gbare Server-Befehle sind:",
    ServerCMDs,
);
const readline = require("readline");
const {Server} = require("http");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

var conformation = false;

rl.on("line", async (input)  => {
    if (!cmdInputErlaubt && input === "nf") {
        cmdInputErlaubt = true;
        log(`Notfall override aktiviert, cmdInputErlaubt == ${cmdInputErlaubt} `, 1, false);
        return;
    }
    if (!cmdInputErlaubt) {
        log("Input vom System blockiet, override: nf", 1 , false);
        return;
    }
    if (input === ServerCMDs[0]) {
        await log("Server wird Heruntergefahren", 3, false);
        serverStatusonline = false;
        await serverStatus();
        process.exit();
    } else if (input === ServerCMDs[1]) {
        useOfNINA = 0;
        await log(`NINA Check API wird ge�ndert zu: ${useofNINAa[useOfNINA]}`, 3, false);
    } else if (input === ServerCMDs[2]) {
        useOfNINA = 1;
        await log(`NINA Check API wird ge�ndert zu: ${useofNINAa[useOfNINA]}`, 3, false);
    } else if (input === ServerCMDs[3]) {
        await letzeWarnungReset();
    } else if (input === ServerCMDs[4]) {
        await letzeWarnungPrint();serverStatusonline = true;
    } else if (input === ServerCMDs[5]) {
        await log(`NINA Check API in benutzung: ${useofNINAa[useOfNINA]}`, 3, false);
    } else if (input === ServerCMDs[6]) {
        await log("Auto NINA Abfrage gestartet", 3, false);
        NINAautoAbfrageStarten();
    } else if (input === ServerCMDs[7]) {
        await log("Auto NINA Abfrage gestoppt", 3, false);
        NINAautoAbfrageStop();
    } else if (input === ServerCMDs[8]) {
        await log("NINA Abfrage - Force Request", 3, false);
        await ninaAbfrageFetch();
    } else if (input === ServerCMDs[9]) {
        await log("RAMClearer START", 4, false);
        await ramClearen();
    } else if (input === ServerCMDs[10]) {
        await log("RAMPrinter CALL", 4, false);
        ramP();
    } else if (input === ServerCMDs[11]) {
        await testColors();
    } else if (input === ServerCMDs[12]) {
        TTSoverride = true;
        await log(`TTS Override = ${TTSoverride}`, 4, false);
    } else if (input === ServerCMDs[13]) {
        TTSoverride = false;
        await log(`TTS Override = ${TTSoverride}`, 4, false);
    } else if (input === ServerCMDs[14]) {
        if (ttsForce) {
            return log(`ttsForce bereits AKTIV; ZUM DEAKTIVIEREN: ${ServerCMDs[15]}`, 2, false);
        }
        await log(`Achtung! ttsForce �BERSPRINGT TTS CHECKS. DIES KANN ZU LOOPS UND ZU ANDEREN FEHLERN F�HREN. BENUTZUNG AUF EIGENE GEFAHR! ttsForce aktivieren? [J/n]`, 2, false);
        conformation = true;
    } else if (input === ServerCMDs[15]) {
        ttsForce = false;
        await log(`ttsForce = ${ttsForce}`, 4, false)
    } else if (input === ServerCMDs[16]) {
        await log("Wartung wird geforced", 2, false);
        await wartung();
    }
    else if (input === ServerCMDs[17]) {
        await log("Test Warnungen werden ausgef�hrt", 2, false)
        await testsys();
    }
    else if (input === "J" && conformation) {
        ttsForce = true;
        conformation = false;
        await log(`ttsForce = ${ttsForce} || Achtung! ttsForce ist AKTIV!, ZUM DEAKTIVIEREN: ${ServerCMDs[15]}`, 2, false)
    } else if (input === "n" && conformation) {
        ttsForce = false;
        conformation = false;
        await log(`ttsForce = ${ttsForce} || Achtung! NEIN ERKANNT! ttsForce Befehl ABGEBROCHEN! Falls ttsForce aktiv war, wurde dies nun auf FALSE gestellt!`, 2, false)
    } else if (conformation) {
        conformation = false;
        ttsForce = false;
        await log(`ttsForce = ${ttsForce} || Achtung! KEIN JA ODER NEIN ERKANNT! ttsForce Befehl ABGEBROCHEN! Falls ttsForce aktiv war, wurde dies nun auf FALSE gestellt!`, 2, false)
    } else if (!conformation) {
        await log(`SyntaxError, befehl nicht erkannt - Input(${input})`, 1, false);
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
    await log("ninaAbfrageFetch called", 4, false);

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
        await log("Keine Aktiven Alarmmeldungen", 2, false);
    }

    highAlerts.sort((a, b) => {
        return severityRank[b.severity] - severityRank[a.severity];
    });

    for (const alert of highAlerts) {
        if (alert.severity === "Extreme") warnungsGruppen.Extreme.push(alert);
        else if (alert.severity === "Severe") warnungsGruppen.Severe.push(alert);
        else if (alert.severity === "Moderate") warnungsGruppen.Moderate.push(alert);
        else if (alert.severity === "Minor") {
            warnungsGruppen.Minor.push(alert);
            // log("Alert severity zu low", 2);
        }
        await log(JSON.stringify(warnungsGruppen), 4, false);
    }

    await processAlerts();
}

async function safeFetch(url) {
    try {
        await log(`FETCH TRY: ${url}`, 4, false);

        const response = await fetch(url);

        await log(`FETCH STATUS: ${response.status}`, 4, false);

        const data = await response.json();
        return data;

    } catch (error) {
        await log(`Fetch-Request Error bei safeFetch(); Error: ${JSON.stringify(error)}`, 1, false);
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

        console.log(dateNew(), "[DEBUG]: Inhaltspr�fung von Gruppe", severity);
        if (gruppe.length === 0) {
            await log(`Gruppe ${severity} leer`, 3, false);
            continue;
        } else {
            await log(`Gruppe ${severity} nicht leer; InfoZurWarnung Called`, 3, false);
        }

        for (const alert of gruppe) {
            await InfoZurWarnung(alert.id);
        }
    }
}

async function InfoZurWarnung(AlertID) {

    var headline = [];
    var description = [];
    var event = [];
    var urgency = [];
    var severity = [];
    var InfoNINAreq = InfoNINA + AlertID + ".json";
    var instruction = [];
    var senderName = [];

    await log("FetchRequest called; Get-Request: Genaue Informationen zur Warnung", 4, false);

    await fetch(InfoNINAreq)
        .then((response) => {
            if (!response.ok) {
                return log(`Fetch-Request Error; HTTP-Fehler bei InfoNINAreq: ${response.status}`, 1, false);
            }
            return response.json(); // Antwort als JSON parsen
        })
        .then((data) => {
            headline = data.info[0].headline ?? "";
            description = data.info[0].description ?? "";
            event = data.info[0].event ?? "";
            urgency = data.info[0].urgency ?? "";
            severity = data.info[0].severity ?? "";
            instruction = data.info[0].instruction ?? "";
            senderName = data.info[0].senderName ?? "";


            if (senderName.length <= 0) {
                senderName = "Bundesamt f�r Bev�lkerungsschutz und Katastrophenhilfe";
            }
            if (instruction.length <= 0) {
                instruction = "Warnung. Keine weitere Ma�nahmen verf�gbar.";
            }

            ttsWarnung = buildTTS(
                headline,
                description,
                event,
                urgency,
                severity,
                data,
                instruction,
                senderName,
            );

            const normalized = ttsWarnung.normalize("NFC");

            if (ttsQueue.some(q => q.text === normalized)) {
                log("TTS bereits in Queue, �bersprungen", 2, false);
                return;
            }
            if (warnRAMEntCheck(normalized)) {
                log("TTS bereits im RAM, �bersprungen", 2, false);
                return;
            }

            log("TTS Call", 4, false);
            ttsQueue.push({text: normalized, schweregrad: severity, title: headline});
            playTTSQueue();
        })

        .catch((error) => {
            log(`Unbekannter Fetch Request Error, error: ${JSON.stringify(error) + " " + error} `, 1, false)
        })
}


/* Intervalle
* ------------------------------------------------------------------------*/
var intervalRunning = false;

function NINAautoAbfrageStarten() {
    NINAAbfrage = setInterval(() => ninaAbfrageFetch(), 30000);
    intervalRunning = true;
    log("naaf wurde aktiviert", 4, false);
}

setInterval(() => wartung(), 900000)
setInterval(() => WarnungIssuedTimer(), 60000);
setInterval(() => clearErrors(), 600000);
setInterval(() => serverStatus(), 15000);

function clearErrors() {
    logs.errs = [];
    logs.warnings = [];
    logs.fatalerrs = [];
}

function NINAautoAbfrageStop() {
    clearInterval(NINAAbfrage);
    intervalRunning = false;
    log("naaf wurde deaktiviert", 4, false);
}

/* Keine Intervalle
* ------------------------------------------------------------------------*/

var lastSeverity = [];

async function playTTSQueue() {
    if (!ttsForce) {
        if (ttsRunning) {
            await log(`TTS Call abgelehnt da TTS Running = ${ttsRunning}`, 2, false);
            return;
        }
    } else {
        await log("Achtung! ttsForce AKTIV! ttsRunning check �BERSPRUNGEN", 2, false);
    }
    ttsRunning = true;

    while (ttsQueue.length > 0) {
        if (WarnungIssued && !ttsForce) {
            await log(`kein shift in queue da WarnungIssued === ${WarnungIssued}`, 2, false);
            continue;
        }
        const {text, schweregrad, title} = ttsQueue.shift();
        await log(`ttsQueue.length ${ttsQueue.length}`, 4, false);

        if (!ttsForce) {
            if (warnRAMEntCheck(text)) {
                await log("TTS Call abgelehnt da letzeWarnung = InputTTS text", 3, false);
                continue;
            }
        } else if (ttsForce) {
            await log("Achtung! ttsForce AKTIV! warnRamEntCheck �BERSPRUNGEN!", 2, false);
        }

        if (WarnungIssued && !ttsForce) {
            if (await severityToNumber(schweregrad) > await severityToNumber(lastSeverity)) {
                await log(`TTS Override aktiviert`, 2, false);
                TTSoverride = true;
                timer2 = 0;
            } else {
                await log(`TTS Call abgelehnt da WarningIssued == ${WarnungIssued}`, 2, false);
                await log(`Severity lower oder gleich, kein TTS Override`, 3, false);
                continue;
            }
        } else if (ttsForce) await log(`Achtung! ttsForce AKTIV! WarningIssued check �BERSPRUNGEN!`, 2, false);

        console.log(newDate2(), "[DEBUG]: Schweregrad:", schweregrad);
        console.log(newDate2(), "[DEBUG]: Transcript:", {text});
        offtts = false;

        await new Promise((resolve) => {
            tts.speak(text, schweregrad, resolve, TTSoverride, testaktv);
            letzeWarnung = text;
            WarnungIssued = true;
            lastSeverity = schweregrad
            TTSoverride = false;
            log(`newPromise; letzeWarnung = ${text}, Warning Issued = ${WarnungIssued}, lastSeverityy = ${lastSeverity}, TTSOverride = ${TTSoverride}`, 4, false);
            ramPush(letzeWarnung)
        });

        await ttsStatus(text, schweregrad, newDate2(), title);
    }

    ttsRunning = false;
    ttsQueue = [];
    await log(`ttsRunning == ${ttsRunning}`);
}

async function ramPush(letzeWarnung) {
    try {
        for (var i = 9; i >= 2; i--) {
            if (ram[`RamSpeicher${i}`].length !== 0) {
                (ram[`RamSpeicher${i}`]) = ((ram[`RamSpeicher${i - 1}`]))
            } else {
                (ram[`RamSpeicher${i}`] = ({text: `RamSpeicher${i}`}));
            }
        }

        ram.RamSpeicher1 = letzeWarnung;
    } catch (e) {
        return await log(`RamSpeicher-Error: Unbekannter Interner Server Fehler bei ramPush; Loggen von RAM SpeicherSlots: ${JSON.stringify(ram)} || Error Ausgabe: ${e}`, 1, true);
    }
}

async function WarnungIssuedTimer() {
    if (!WarnungIssued) return;
    if (timer2 >= 5) {
        WarnungIssued = false
        timer2 = 0;
        offtts = true;
        await ttsStatus(null, null, null, null);
        return;
    }
    timer2++;
    await log(`timer2=${timer2}`, 3, false);
}

async function severityToNumber(severity) {
    await log(`Severity to Number, Severity: ${severity}`, 4);
    if (severity === "Extreme") {
        return 4;
    } else if (severity === "Severe") {
        return 3;
    } else if (severity === "Moderate") {
        return 2;
    } else {
        return 1;
    }
}

process.on('uncaughtException', async (err) => {
    await pushLogInLogs(err.stack || err.toString(), "fatalerror", true);
    serverStatusonline = false;
    await serverStatus();
    process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
    await pushLogInLogs(reason?.stack || String(reason), "fatalerror", true);
    serverStatusonline = false;
    await serverStatus();
    process.exit(1);
});

async function wartung() {
    await log(`Warnung! Wartung gestartet...`, 2, false);
    await log("naaf wird deaktiviert", 2, false);
    var naafStartenAmEnde = false;

    if (intervalRunning) {
        NINAautoAbfrageStop();
        await log("naaf wurde deaktiviert", 2, false);
        naafStartenAmEnde = true;
    } else {
        await log("naaf ist bereits deaktiviert", 2, false);
    }

    await log("ttsQueue wurde zur�ckgesetzt", 2, false);
    await log("warnungsGruppen werden zur�ckgesetzt", 2, false);
    warnungsGruppen.Extreme = [];
    await log("warnungsGruppe Extreme wurde zur�ckgesetzt", 2, false);
    warnungsGruppen.Severe = [];
    await log("warnungsGruppe Severe wurde zur�ckgesetzt", 2, false);
    warnungsGruppen.Moderate = [];
    await log("warnungsGruppe Moderate wurde zur�ckgesetzt", 2, false);
    warnungsGruppen.Minor = [];
    await log("warnungsGruppe Minor wurde zur�ckgesetzt", 2, false);
    await log(`Alle zur�ckgesetzten Variablen werden nun ausgegeben: ttsQueue ${JSON.stringify({ttsQueue})}; warnungsGruppen ${JSON.stringify(warnungsGruppen)}`, 2, false);
    naafStartenAmEnde ? await log("naaf wird wieder gestartet", 2, false) : await log("naaf wird nicht gestartet, da es vorher nicht aktiviert wurde", 2, false);
    naafStartenAmEnde ? NINAautoAbfrageStarten() : log("naaf wurde nicht aktiviert", 2, false);
    await log("Wartung abgeschlossen! cmdInputErlaubt wird auf true gesetzt", 2, false);
    cmdInputErlaubt = true;
    await log(`Wartung abgeschlossen! cmdInputErlaubt wurde auf ${cmdInputErlaubt} gesetzt`, 2, false);
}

async function testsys() {
    testaktv = true
    await log("testsys called", 4, false)
    var naafStartenAmEnde = false;

    if (intervalRunning) {
        NINAautoAbfrageStop();
        await log("naaf wurde deaktiviert", 2, false);
        naafStartenAmEnde = true;
    } else {
        await log("naaf ist bereits deaktiviert", 2, false);
    }

    var theadline = "Test des Notfall-Informations und Alarmsystems";
    var tdescription1;
    var tevent1;
    var turgency;
    var tdata = {
        info: [
            {
                description: "Dies ist ein test des Notfall-Informations und Alarmsystems. Es besteht keine Gefahr. Dies ist nur ein test."
            }
        ]
    }
    var tseverity1 = "Minor";
    var tseverity2 = "Moderate";
    var tseverity3 = "Severe";
    var tseverity4 = "Extreme";
    var tinstruction = "Es besteht keine Gefahr. Dies ist nur ein Test. Es besteht keine Gefahr. Dies ist nur ein Test.";
    var tsenderName = "Private Leitstelle";

    const ttsWarnung1 = buildTTS(
        theadline,
        tdescription1,
        tevent1,
        turgency,
        tseverity1,
        tdata,
        tinstruction,
        tsenderName,
    );

    const ttsWarnung2 = buildTTS(
        theadline,
        tdescription1,
        tevent1,
        turgency,
        tseverity2,
        tdata,
        tinstruction,
        tsenderName,
    );

    const ttsWarnung3 = buildTTS(
        theadline,
        tdescription1,
        tevent1,
        turgency,
        tseverity3,
        tdata,
        tinstruction,
        tsenderName,
    );

    const ttsWarnung4 = buildTTS(
        theadline,
        tdescription1,
        tevent1,
        turgency,
        tseverity4,
        tdata,
        tinstruction,
        tsenderName,
    );

    const normalized1 = ttsWarnung1.normalize("NFC");
    const normalized2 = ttsWarnung2.normalize("NFC");
    const normalized3 = ttsWarnung3.normalize("NFC");
    const normalized4 = ttsWarnung4.normalize("NFC");

    await log("ttsQueue.push", 4, false);
    ttsQueue.push({text: normalized4, schweregrad: tseverity4});
    ttsQueue.push({text: normalized3, schweregrad: tseverity3});
    ttsQueue.push({text: normalized2, schweregrad: tseverity2});
    ttsQueue.push({text: normalized1, schweregrad: tseverity1});

    await log("TTS Call; Durch testsys()", 4, false);
    await playTTSQueue(theadline)
    if (naafStartenAmEnde) {
        NINAautoAbfrageStarten();
        await log("NINAautoAbfrageStarten() call", 4, false);
    } else {
        await log(`kein NINAautoAbfrageStarten() call da: naafStartenAmEnde = ${naafStartenAmEnde}`, 4, false);
    }
    testaktv = false;
}








