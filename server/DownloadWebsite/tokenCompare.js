const bcrypt = require("bcrypt");

async function compToken(postToken, reqToken, index) {
  const logs = {
    errs: [],
    msg: [],
  };
  if (postToken.length === 0 || postToken === "[]") {
    return;
  }
  try {
    const result = await bcrypt.compare(postToken, reqToken);

    if (result) {
      //Passwort = Gleich
      console.log("reqToken === postToken");
      return true;
    } else {
      // Passwort !== Gleich
      console.log("reqToken !== postToken");
      return false;
    }
  } catch (error) {
    logs.errs.push(error);
    logs.msg.push("500 Unknown Internal Server error occured");
  }
}

module.exports = { compToken };
