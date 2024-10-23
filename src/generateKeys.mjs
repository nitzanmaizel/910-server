import crypto from "crypto";
// Generate ENC_KEY (32 bytes)
const encKey = crypto.randomBytes(32).toString("base64");
console.log("ENC_KEY:", encKey);

// Generate SIG_KEY (64 bytes)
const sigKey = crypto.randomBytes(64).toString("base64");
console.log("SIG_KEY:", sigKey);
