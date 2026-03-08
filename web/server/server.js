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

    if (!proof || !publicSignals || publicSignals.length < 1) {
      return res.status(400).json({
        verified: false,
        message: "Missing proof or public signals"
      });
    }

    // Phase 4: Document Commitment Registry Check
    // publicSignals[0] is the `root` public input mapped from whistleblower.circom
    const submittedRoot = publicSignals[0];
    
    let registry;
    try {
      registry = JSON.parse(fs.readFileSync("./registry.json", "utf8"));
    } catch (e) {
      registry = []; // Fallback if file doesn't exist
    }

    if (!registry.includes(submittedRoot)) {
       return res.json({
         verified: false,
         message: "Unauthorized Document: The document's Merkle root is not registered as an authentic source."
       });
    }

    const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    res.json({
      verified,
      message: verified ? "Zero-Knowledge Proof Verified & Document Authorized" : "Invalid Cryptographic Proof"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ verified: false, message: "Server error during verification" });
  }
});

app.listen(4000, () => {
  console.log("Verifier Node running on port 4000");
});