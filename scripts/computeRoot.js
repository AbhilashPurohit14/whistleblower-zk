const circomlib = require("circomlibjs");

async function main() {

    const poseidon = await circomlib.buildPoseidon();
    const F = poseidon.F;

    let chunkHash = 5n;

    let h1 = poseidon([chunkHash, 0n]);
    let h2 = poseidon([h1, 0n]);
    let h3 = poseidon([h2, 0n]);

    console.log("ROOT =", F.toString(h3));

}

main();
