const express = require("express");
const snarkjs = require("snarkjs");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

const vKey = JSON.parse(
  fs.readFileSync("../../build/verification_key.json")
);

app.post("/verify", async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;

    if (!proof || !publicSignals) {
      return res.status(400).json({
        verified: false,
        message: "Missing proof or public signals"
      });
    }

    const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    res.json({
      verified,
      message: verified ? "Zero-Knowledge Proof Verified" : "Invalid Cryptographic Proof"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ verified: false, message: "Server error during verification" });
  }
});

app.listen(4000, () => {
  console.log("Verifier Node running on port 4000");
});