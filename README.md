# Privacy-Preserving Whistleblower System (Anonymous Document Authenticator)

A cryptography-based web application that allows a whistleblower to prove that a confidential document contains sensitive information **without revealing the document itself**.

This system uses **zk-SNARKs (Groth16)** to generate a **zero-knowledge proof** verifying the presence of a phrase inside a document while keeping the document private.

---

## Team

Developed by:

- Abhilash Purohit
- Suchet Kumbar
- Pratik Anand

---

## Problem Statement

Whistleblowers often possess sensitive documents that expose wrongdoing, but revealing the full document may expose their identity.

This project demonstrates how **Zero-Knowledge Proofs** can be used to verify information **without revealing the underlying data**.

---

## How It Works

1. The user uploads a document.
2. The user enters a phrase they want to prove exists in the document.
3. The system checks the phrase locally.
4. A **zk-SNARK proof (Groth16)** is generated.
5. The verifier confirms the proof **without seeing the document**.

This preserves the whistleblower's anonymity while still proving authenticity.

---

## Cryptographic Components

| Component | Description |
|-----------|-------------|
| zk-SNARK System | Groth16 |
| Hash Function | Poseidon |
| Circuit Language | Circom |
| Proof System | snarkjs |
| Merkle Tree Depth | 3 |
| Frontend | React |
| Backend | Node.js |

---

## Project Architecture


User (Browser)
│
├── React Frontend
│
├── Node.js Server
│
├── zk Circuit (Circom)
│
├── Witness Generation
│
├── Proof Generation (Groth16)
│
└── Verification


---

## Project Structure


whistleblower-zk/
│
├── circuits/
│ └── whistleblower.circom
│
├── web/
│ ├── client/ # React frontend
│ └── server/ # Node backend
│
├── build/ # zk artifacts
│
├── scripts/ # utility scripts
│
└── README.md


---

## Installation

Clone the repository:


git clone https://github.com/AbhilashPurohit14/whistleblower-zk.git

cd whistleblower-zk


Install dependencies:


npm install


---

## Running the Project

Start the backend:


cd web/server
node server.js


Start the frontend:


cd web/client
npm start


Open the application in your browser:


http://localhost:3000


---

## Demo Usage

1. Upload a `.txt` document.
2. Enter a phrase that exists in the document.
3. Generate the proof.

If the phrase exists, the system will return:


Proof Verified ✅


Otherwise:


Invalid Proof ❌


---

## Example

Document:


This report confirms illegal dumping occurred.


Phrase:


illegal dumping


Result:


Proof Verified ✅


---

## Applications

This concept can be applied to:

- Whistleblower protection systems
- Secure document verification
- Privacy-preserving compliance reporting
- Confidential auditing

---

## Future Improvements

- Real Merkle tree construction from documents
- On-chain proof verification
- Support for PDF and structured documents
- More advanced zk circuits

---

## License

This project is for educational purposes.
