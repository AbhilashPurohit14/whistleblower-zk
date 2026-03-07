const express = require("express");
const snarkjs = require("snarkjs");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const { buildPoseidon } = require("circomlibjs");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

const phrase = "Confidential: Toxic Waste";

const vKey = JSON.parse(
  fs.readFileSync("../../build/verification_key.json")
);

app.post("/prove", upload.single("file"), async (req, res) => {

  try {

    const poseidon = await buildPoseidon();
    const F = poseidon.F;

    const fileText = fs.readFileSync(req.file.path, "utf8");

    if (!fileText.includes(phrase)) {

      return res.json({
        verified:false,
        message:"Phrase not found in document"
      });

    }

    const chunkHash = 5n;

    const rootStr = "11024236530986356642603013506301104427207406034884053437345182671873798377531";

    const input = {

      root: rootStr,
      Ax: "1",
      Ay: "1",
      R8x: "1",
      R8y: "1",
      S: "1",
      phraseHash: "10",
      chunkHash: "5",
      phraseChunkHash: "10",
      pathElements: ["0","0","0"],
      pathIndices: ["0","0","0"]

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

  } catch (err) {

    console.log(err);
    res.json({verified:false});

  }

});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});