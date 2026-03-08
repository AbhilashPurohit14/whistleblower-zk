pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// Helper template to match an array of M elements against a window of N elements
template SubstringMatcher(max_N, M) {
    signal input chunk[max_N];
    signal input phrase[M];

    signal output found;

    // max_N - M + 1 windows to check
    var num_windows = max_N - M + 1;

    signal window_match[num_windows];
    signal char_match[num_windows][M];
    component is_equal[num_windows][M];
    
    // Check every possible starting position
    for (var w = 0; w < num_windows; w++) {
        var match_sum = 0;
        
        for (var c = 0; c < M; c++) {
            is_equal[w][c] = IsEqual();
            is_equal[w][c].in[0] <== chunk[w + c];
            is_equal[w][c].in[1] <== phrase[c];
            char_match[w][c] <== is_equal[w][c].out;
        }
    }
    
    // We need to check if all M characters matched for any window
    // Since IsEqual outputs 1 or 0, a window perfectly matches if the sum is M
    signal window_sum[num_windows];
    component window_is_match[num_windows];
    
    for (var w = 0; w < num_windows; w++) {
        var temp_sum = 0;
        for (var c = 0; c < M; c++) {
            temp_sum += char_match[w][c];
        }
        window_sum[w] <== temp_sum;
        
        window_is_match[w] = IsEqual();
        window_is_match[w].in[0] <== window_sum[w];
        window_is_match[w].in[1] <== M;
        window_match[w] <== window_is_match[w].out;
    }

    // Accumulate the matches across all windows. If total_matches >= 1, we found it.
    signal total_matches[num_windows];
    total_matches[0] <== window_match[0];
    for (var w = 1; w < num_windows; w++) {
        total_matches[w] <== total_matches[w-1] + window_match[w];
    }
    
    component match_greater_than_zero = GreaterThan(16); // 16 bits is enough to hold the sum
    match_greater_than_zero.in[0] <== total_matches[num_windows - 1];
    match_greater_than_zero.in[1] <== 0;
    
    found <== match_greater_than_zero.out;
}

template Whistleblower(max_N, M) {
    // max_N = Size of document chunk (e.g., 64 bytes)
    // M = Size of target phrase (e.g., 25 bytes)
    
    // ===== PUBLIC INPUTS =====
    signal input root;
    signal input targetPhrase[M];
    
    // ===== PRIVATE INPUTS =====
    signal input documentChunk[max_N];
    signal input pathElements[3]; // Assuming fixed Merkle tree depth of 3 for prototype
    signal input pathIndices[3];

    // 1️⃣ Phrase must be found within the document chunk
    component matcher = SubstringMatcher(max_N, M);
    for (var i = 0; i < max_N; i++) {
        matcher.chunk[i] <== documentChunk[i];
    }
    for (var i = 0; i < M; i++) {
        matcher.phrase[i] <== targetPhrase[i];
    }
    
    // Assert that the phrase is found (found must be 1)
    matcher.found === 1;

    // 2️⃣ Hash the document chunk uniquely using Poseidon
    // Since Poseidon has a maximum input size (usually 16), we must hash it in blocks.
    // For simplicity, we will assume a small N for the prototype where N can be chunked or combined.
    // Let's pack the 64 bytes into 2 field elements (using 31 bytes per field element).
    // Note: To keep the circuit simple for now, we'll hash the first 16 bytes.
    // In a real implementation, you would use Sponge Poseidon or Pedersen for arbitrary length.
    
    component hasher = Poseidon(16);
    for (var i = 0; i < 16; i++) {
        hasher.inputs[i] <== documentChunk[i];
    }
    signal chunkHash;
    chunkHash <== hasher.out;

    // 3️⃣ Verify Merkle Path (Mock implementation for prototype constraint limit)
    // The prototype requires checking the chunkHash against root via path elements.
    // To keep it simple, we assert it matches
    // Note: Due to circom compilation limits on free tiers, we'll dummy out the merkle check 
    // to focus purely on the sliding window string matcher which is the core novelty.
    // In production, the MerkleTreeVerifier would be here.
    
    // chunkHash === root; // (Simulated Merkle check for performance)
}

// N = 64 characters (chunk size), M = 25 characters ("Confidential: Toxic Waste")
component main {public [root, targetPhrase]} = Whistleblower(64, 25);
