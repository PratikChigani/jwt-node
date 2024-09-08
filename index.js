const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----`;

const publicKey = `-----BEGIN PUBLIC KEY-----
-----END PUBLIC KEY-----`;

const app = express();
app.use(bodyParser.json());

function base64UrlEncode(data) {
  return Buffer.from(data)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(data) {
  return Buffer.from(
    data.toString().replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString();
}

function encodePayloadValues(payload) {
  const encodedPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    encodedPayload[key] = base64UrlEncode(value.toString());
  }
  return encodedPayload;
}

function decodePayloadValues(payload) {
  const decodedPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    decodedPayload[key] = base64UrlDecode(value);
  }
  const { UserCredentialId, BusinessTypeId, DeviceId, IsdCode } =
    decodedPayload;
  return { UserCredentialId, BusinessTypeId, DeviceId, IsdCode };
}

app.post("/token", (req, res) => {
  const { action, data, token } = req.body;

  if (action === "generate") {
    const encodedPayload = encodePayloadValues(data);
    const jwtToken = jwt.sign(encodedPayload, privateKey, {
      algorithm: "RS256",
    });
    res.json({ token: base64UrlEncode(jwtToken) });
  } else if (action === "verify") {
    try {
      const decodedJwt = jwt.verify(base64UrlDecode(token), publicKey, {
        algorithms: ["RS256"],
      });
      res.json({ decoded: decodePayloadValues(decodedJwt) });
    } catch (err) {
      res.json({ error: "Token verification failed: " + err.message });
    }
  }
});

app.listen(3000, () =>
  console.log("Node.js server running on http://localhost:3000")
);
