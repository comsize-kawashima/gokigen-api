const Identicon = require("identicon.js");
const crypto = require("crypto");

function generateIdenticon(email) {
  const hash = crypto.createHash("md5").update(email).digest("hex");
  const identicon = new Identicon(hash, 200).toString();
  return `data:image/png;base64,${identicon}`;
}

module.exports = generateIdenticon;
