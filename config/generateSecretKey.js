import crypto from "crypto";

// generate key and update manually

const key1 = crypto.randomBytes(35).toString("hex");
const key2 = crypto.randomBytes(35).toString("hex");

console.table({ key1, key2 });
