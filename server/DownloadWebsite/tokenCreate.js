// Standard Variablen belegen
const bcrypt = require("bcrypt");
const saltRounds = 12;
var salt2 = [];

// Benutzer Input
const tokenInput =
  "Insert here your password you want to encrypt"; 

if (tokenInput.length === 0) {
  return;
}

GenSalt();

function GenSalt() {
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      return console.error(err);
    }

    // Wenn Salzkord kein Errors hat dann declare salt2
    salt2 = salt;
    hashPasswort();
  });
}

function hashPasswort() {
  bcrypt.hash(tokenInput, salt2, (err, hashPass) => {
    if (err) {
      return console.error(err);
    }
    console.log("Hashed passwort:", hashPass);
  });
}

