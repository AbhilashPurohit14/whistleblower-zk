# Privacy-Preserving Whistleblower System using zk-SNARKs

A web-based cryptographic system that allows a whistleblower to prove that a confidential document contains sensitive information **without revealing the document itself**.

The system uses **zero-knowledge proofs (zk-SNARKs)** to verify the presence of a confidential phrase inside a document while preserving complete privacy.

---

## Project Overview

In many real-world situations, whistleblowers need to prove that sensitive information exists without exposing the entire document.

This project demonstrates how **zero-knowledge cryptography** can solve this problem.

The system allows a user to upload a document and generate a cryptographic proof that the document contains a confidential phrase such as:

```
Confidential: Toxic Waste
```

The verifier can confirm that the statement is true **without seeing the document**.

---

## System Architecture

```
User Uploads Document
        ↓
Phrase Detection
        ↓
Poseidon Hashing
        ↓
Merkle Tree Verification
        ↓
zk-SNARK Proof Generation
        ↓
Proof Verification (Groth16)
```

---

## Technologies Used

### Cryptography

- **Circom** – zk-SNARK circuit design
- **snarkjs** – proof generation and verification
- **Groth16** – zk-SNARK proving system
- **Poseidon Hash Function**
- **Merkle Tree Authentication**

### Web Stack

- **React.js** – Frontend interface
- **Node.js + Express** – Backend server
- **Multer** – File upload handling

---

## Features

- Upload confidential documents
- Detect presence of sensitive phrases
- Generate **zero-knowledge proofs**
- Verify proofs without revealing document contents
- Web-based whistleblower portal
- Privacy-preserving authentication

---

## Project Structure

```
whistleblower-zk
│
├── circuits
│   └── whistleblower.circom
│
├── build
│   ├── whistleblower.r1cs
│   ├── circuit_final.zkey
│   └── verification_key.json
│
├── scripts
│   └── computeRoot.js
│
├── web
│   ├── client (React frontend)
│   └── server (Node backend)
│
└── README.md
```

---

## How It Works

1. User uploads a document through the web interface.
2. The system checks whether the document contains a confidential phrase.
3. The document is processed using cryptographic hashing.
4. A zk-SNARK proof is generated using the Circom circuit.
5. The server verifies the proof without accessing the document contents.

---

## Cryptographic Details

| Component | Description |
|--------|-------------|
| zk-SNARK Protocol | Groth16 |
| Hash Function | Poseidon |
| Merkle Tree Depth | 3 |
| Proof Size | ~200 bytes |
| Verification Time | < 100 ms |

---

## Example Use Case

```
Whistleblower possesses internal company document
        ↓
Document contains evidence of environmental violation
        ↓
System generates zero-knowledge proof
        ↓
Verifier confirms existence of evidence without seeing document
```

---

## Running the Project Locally

### Install Dependencies

```
npm install
```

### Start Backend Server

```
cd web/server
node server.js
```

### Start Frontend

```
cd web/client
npm start
```

Open:

```
http://localhost:3000

```
---

## License

This project is developed for educational and research purposes.
