pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/eddsaposeidon.circom";
include "../node_modules/circomlib/circuits/switcher.circom";

template MerkleTreeVerifier(nLevels) {

    signal input leaf;
    signal input pathElements[nLevels];
    signal input pathIndices[nLevels];
    signal output root;

    signal hashes[nLevels+1];

    component hashers[nLevels];
    component switches[nLevels];

    hashes[0] <== leaf;

    for (var i = 0; i < nLevels; i++) {

        switches[i] = Switcher();
        switches[i].sel <== pathIndices[i];

        switches[i].L <== hashes[i];
        switches[i].R <== pathElements[i];

        hashers[i] = Poseidon(2);

        hashers[i].inputs[0] <== switches[i].outL;
        hashers[i].inputs[1] <== switches[i].outR;

        hashes[i+1] <== hashers[i].out;
    }

    root <== hashes[nLevels];
}

template Whistleblower(nLevels) {

    // ===== PUBLIC INPUTS =====
    signal input root;
    signal input Ax;
    signal input Ay;
    signal input R8x;
    signal input R8y;
    signal input S;
    signal input phraseHash;

    // ===== PRIVATE INPUTS =====
    signal input chunkHash;
    signal input phraseChunkHash;
    signal input pathElements[nLevels];
    signal input pathIndices[nLevels];

    // 1️⃣ Phrase must match (hash equality proof)
    phraseChunkHash === phraseHash;

    // 2️⃣ Merkle verification
    component merkle = MerkleTreeVerifier(nLevels);
    merkle.leaf <== chunkHash;

    for (var i = 0; i < nLevels; i++) {
        merkle.pathElements[i] <== pathElements[i];
        merkle.pathIndices[i] <== pathIndices[i];
    }

    merkle.root === root;
/*

    // 3️⃣ Verify EdDSA signature on root
    component eddsa = EdDSAPoseidonVerifier();
    eddsa.enabled <== 1;
    eddsa.Ax <== Ax;
    eddsa.Ay <== Ay;
    eddsa.R8x <== R8x;
    eddsa.R8y <== R8y;
    eddsa.S <== S;
    eddsa.M <== root;
*/
}

component main = Whistleblower(3);
