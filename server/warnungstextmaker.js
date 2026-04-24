function WarnungsNarchichtErstellen(
    headline,
    description,
    event,
    urgency,
    severity,
    data,
) {
    var descriptionStringFiltered = data.info[0].description
        .replace(/(<br\s*\/?>)+/gi, " ")
        .trim();

    const Anfang = "Warnung!";
    var Einleitung =
        "Das Bundesamt für Bevölkerungsschutz und Katastrophenhilfe warnt vor dem Ereignis. " +
        headline;
    var beschreibung1 = [];
    var beschreibung2 = [];
    const beschreibung3 = "Die Beschreibung von der Warnung wird nun vorgelesen:";
    const beschreibung4 =
        "Falls Se-reh-neen, Warnung der Bevölkerung heulen, welcher ein Auf- und Abschwellender heulton ist, befolgen sie folgende Schritte:";
    const beschreibung5 =
        "Suchen sie ein Gebäude auf. Schließen sie Fenster und Türen. Deaktivieren sie, falls möglich, alle Klimaanlagen und Lüftungen. Schalten sie Rundfunkgeräte ein. Beachten sie Meldungen von Warn-Apps. Befolgen sie Anweisungen der Behörden. Informieren sie ihre Nachbarn. Bitte benutzen sie nur Notrufleitungen für Notfälle.";
    const ende = ". Diese Angaben sind ohne Gewähr. Das verwendete T.T.S. Modell kann Telefonnummern, Uhrzeiten und Informationen falsch vorlesen. Bitte überprüfen Sie diese in der NINA App. Befolgen Sie ausschließlich offizielle Anweisungen der Behörden.";
    const beschreibung6 = "Falls Se-reh-nen, Entwarnung heulen, welcher ein 60 sekündiger Dauerton ist, ist diese oder eine andere Warnung aufgehoben.";

    if (severity == "Moderate") {
        beschreibung1 = "Die Warnung hat den Schweregrad moderat.";
        beschreibung2 =
            "Eine moderate Warnung bedeutet das die Gefahr: Mäßig, potenziell schädlich, aber nicht lebensbedrohlich ist.";
    } else if (severity == "Severe") {
        beschreibung1 = "Die Warnung hat den Schweregrad schwer.";
        beschreibung2 =
            "Eine schwere Warnung bedeutet das die Gefahr: Sehr ernst ist und das schwere Schäden oder Verletzungen möglich sind.";
    } else if (severity == "Extreme") {
        beschreibung1 = "Die Warnung hat den Schweregrad extrem.";
        beschreibung2 =
            "Eine extreme Warnung bedeutet das die Gefahr: Lebensbedrohlich oder katastrophal ist; dies ist die höchste Gefahrenstufe.";
    }
    return [
        Anfang,
        Einleitung,
        beschreibung1,
        beschreibung2,
        beschreibung4,
        beschreibung5,
        beschreibung6,
        beschreibung3,
        descriptionStringFiltered,
        ende,
    ].join("\n");
}

module.exports = {WarnungsNarchichtErstellen};
