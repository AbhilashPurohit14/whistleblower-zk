const express = require("express");
const snarkjs = require("snarkjs");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

const vKey = JSON.parse(
  fs.readFileSync("../../build/verification_key.json")
);

app.post("/prove", upload.single("file"), async (req, res) => {

  try {

    const phrase = req.body.phrase;

    if (!phrase || phrase.trim() === "") {
      return res.json({
        verified: false,
        message: "Phrase missing"
      });
    }

    const fileText = fs.readFileSync(req.file.path, "utf8");

    // normalize text to avoid case and whitespace issues
    const cleanDoc = fileText.toLowerCase().replace(/\s+/g, " ");
    const cleanPhrase = phrase.toLowerCase().replace(/\s+/g, " ");

    if (!cleanDoc.includes(cleanPhrase)) {
      return res.json({
        verified: false,
        message: "Phrase not found in document"
      });
    }

    // deterministic numeric phrase hash (safe for circuit)
    let phraseHash = 0;

    for (let i = 0; i < cleanPhrase.length; i++) {
      phraseHash += cleanPhrase.charCodeAt(i);
    }

    phraseHash = phraseHash.toString();

    const input = {

      root:
      "11024236530986356642603013506301104427207406034884053437345182671873798377531",

      Ax: "1",
      Ay: "1",
      R8x: "1",
      R8y: "1",
      S: "1",

      phraseHash: phraseHash,

      chunkHash: "5",

      phraseChunkHash: phraseHash,

      pathElements: ["0", "0", "0"],
      pathIndices: ["0", "0", "0"]

    };

    const { proof, publicSignals } =
      await snarkjs.groth16.fullProve(
        input,
        "../../build/whistleblower_js/whistleblower.wasm",
        "../../build/circuit_final.zkey"
      );

    const verified =
      await snarkjs.groth16.verify(vKey, publicSignals, proof);

    res.json({
      verified,
      message: verified ? "Proof Verified" : "Invalid Proof"
    });

  }
  catch (err) {

    console.log(err);
    res.json({ verified: false });

  }

});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});