const path = require("path");

function speak(text, schweregrad, done, TTSoverride, testaktv) {

    function dateNew() {
        return date = new Date().toISOString();
    }

    const path = require("path");
    const {spawn, exec} = require("child_process");
    const fs = require("fs");

    console.log(dateNew(), "[DEBUG]: TTS Initialisierung");

    let gongFile;
    if (testaktv) {
        gongFile = path.join(__dirname, "GongSounds/probealarmwarnung.wav");
    }
    else if (TTSoverride) {
        gongFile = path.join(__dirname, "GongSounds/warnungunterbrochen.wav");
    } else if (schweregrad === "Moderate" || schweregrad === "Minor") {
        gongFile = path.join(__dirname, "GongSounds/gong_moderat.wav");
    } else if (schweregrad === "Severe" || schweregrad === "Extreme") {
        gongFile = path.join(__dirname, "GongSounds/gong_schwer_extrem.wav");
    } else {
        gongFile = null;
    }

    const ttsFile = path.join(__dirname, "tts.wav");

    const safeText = text
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, " ");

    const ttsBin = ".../.pyenv/shims/tts"; // Replace this with your path of the installation of tts

    const cmd = `"${ttsBin}" --text "${safeText}" \
--model_name "tts_models/de/thorsten/tacotron2-DDC" \
--out_path "${ttsFile}"`;

    exec(cmd, (err) => {
        if (err) {
            console.error("TTS Error:", err);
            if (done) done(err);
            return;
        }

        console.log(dateNew(), "[DEBUG]: TTS fertig");

        const wavBuffer = fs.readFileSync(ttsFile);
        let delayMs = (testaktv ? 57000 : TTSoverride ? 17000 : ((schweregrad === "Extreme" || schweregrad === "Severe") ? 11200 : 2500));

        let ffmpegArgs;

        console.log("[DEBUG]: GONG FILE:", gongFile);
        console.log("[DEBUG] EXISTS:", fs.existsSync(gongFile));
        console.log("CWD:", process.cwd());
        console.log("GONG FILE:", gongFile);
        console.log("EXISTS:", fs.existsSync(gongFile));

        if (gongFile && fs.existsSync(gongFile)) {
            const filterComplex =
                `[0:a]aresample=22050,adelay=${delayMs}|${delayMs}[voice];` +
                `[1:a]aresample=22050,volume=1.5[gong];` +
                `[voice][gong]amix=inputs=2:duration=longest:dropout_transition=2[mixed];` +
                `[mixed]highpass=f=400,highpass=f=400,lowpass=f=7000,lowpass=f=7000[out]`;
            ffmpegArgs = [
                "-f", "wav", "-i", "pipe:0",
                "-i", gongFile,
                "-filter_complex", filterComplex,
                "-map", "[out]",
                "-ar", "44100",
                "-f", "mp3",
                "-b:a", "64k",
                "pipe:1"
            ];
        } else {
            ffmpegArgs = [
                "-f", "wav", "-i", "pipe:0",
                "-af", "highpass=f=400,highpass=f=400,lowpass=f=7000,lowpass=f=7000",
                "-ar", "44100",
                "-f", "mp3",
                "-b:a", "64k",
                "pipe:1"
            ];
        }

        console.log("FFMPEG ARGS:", ffmpegArgs);
        console.log("GONG:", gongFile);
        const ffmpeg = spawn("ffmpeg", ffmpegArgs);

        const outFile = fs.createWriteStream(__dirname + "/DownloadWebsite/Warnungen/output.mp3");
        ffmpeg.stdout.pipe(outFile);

        ffmpeg.stdin.write(wavBuffer);
        ffmpeg.stdin.end();

        ffmpeg.stderr.on("data", (d) => {
            console.log(dateNew(), "[DEBUG ffmpeg]:", d.toString().trim());
        });

        ffmpeg.on("close", (code) => {
            console.log(dateNew(), "[DEBUG]: fertig", code);
            if (done) done(code !== 0 ? new Error("ffmpeg error") : null);
        });
    });
}

module.exports = {speak}
