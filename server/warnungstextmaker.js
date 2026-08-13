function WarnungsNarchichtErstellen(
    headline,
    description,
    event,
    urgency,
    severity,
    data,
    instruction,
    senderName,
) {
    var descriptionStringFiltered = data.info[0].description
        .replace(/(<br\s*\/?>)+/gi, " ")
        .trim();

    const Anfang = "Warnung!";
    var Einleitung =
        `Die zust�ndige Stelle ${senderName} warnt vor dem Ereignis. ` +
        headline;
    var beschreibung1 = [];
    var beschreibung2 = [];
    const beschreibung3 = "Die Beschreibung von der Warnung wird nun vorgelesen.";
    const beschreibung4 =
        ". Falls Seh-renen, Warnung der Bev�lkerung heulen, welcher ein Auf- und Abschwellender heulton ist, befolgen sie folgende Schritte:";
    const beschreibung5 =
        ". Suchen sie ein Geb�ude auf. Schlie�en sie Fenster und T�ren. Deaktivieren sie, falls m�glich, alle Klimaanlagen und L�ftungen. Schalten sie Rundfunkger�te ein. Beachten sie Meldungen von Warn-Apps. Befolgen sie Anweisungen der Beh�rden. Informieren sie ihre Nachbarn. Bitte benutzen sie nur Notrufleitungen f�r Notf�lle.";
    const ende = ". Diese Angaben sind ohne Gew�hr. Das verwendete Sprach-Modell kann Telefonnummern, Uhrzeiten und Informationen falsch vorlesen. Bitte �berpr�fen Sie diese in der NINA App. Befolgen Sie ausschlie�lich offizielle Anweisungen der Beh�rden.";
    const beschreibung6 = "Falls Seh-renen, Entwarnung heulen, welcher ein 60 sek�ndiger Dauerton ist, ist diese oder eine andere Warnung aufgehoben.";

    if (severity == "Moderate") {
        beschreibung1 = ". Die Warnung hat den Schweregrad moderat.";
        beschreibung2 =
            "Eine moderate Warnung bedeutet das die Gefahr M��ig, potenziell sch�dlich, aber nicht lebensbedrohlich ist.";
    } else if (severity == "Severe") {
        beschreibung1 = ". Die Warnung hat den Schweregrad schwer.";
        beschreibung2 =
            "Eine schwere Warnung bedeutet das die Gefahr sehr ernst ist und das schwere Sch�den oder Verletzungen m�glich sind.";
    } else if (severity == "Extreme") {
        beschreibung1 = ". Die Warnung hat den Schweregrad extrem.";
        beschreibung2 =
            "Eine extreme Warnung bedeutet das die Gefahr Lebensbedrohlich oder katastrophal ist. Dies ist die h�chste Gefahrenstufe.";
    }

    var beschreibung7 = `Falls es weitere zu ergreifende Ma�nahmen bez�glich der Warnung gibt, werden diese nun vorgelesen. ${instruction}.`;


     return [
         Anfang,
         Einleitung,
         beschreibung1,
         beschreibung2,
         beschreibung4,
         beschreibung5,
         beschreibung6,
         beschreibung7,
         beschreibung3,
         descriptionStringFiltered,
         ende,
    ].join("\n");
}

module.exports = {WarnungsNarchichtErstellen};
