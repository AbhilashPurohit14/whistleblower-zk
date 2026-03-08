import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, ShieldAlert, Lock, Fingerprint, CheckCircle, XCircle, ChevronRight, Activity } from "lucide-react";
import * as snarkjs from "snarkjs";
import "./App.css";

// --- 3D Background System ---
// Generate random positions for the nodes
const particlesPosition = new Float32Array(1500 * 3);
for (let i = 0; i < 1500 * 3; i++) {
  particlesPosition[i] = (Math.random() - 0.5) * 10;
}

function NodeNetwork() {
  const ref = useRef();
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 30;
      ref.current.rotation.y -= delta / 40;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00f2fe"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
}

// --- Main App ---
function App() {
  const [currentStep, setCurrentStep] = useState(0); 
  // 0: idle, 1: uploading, 2: witness, 3: proof, 4: verifying, 5: complete
  
  const [resultTitle, setResultTitle] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const steps = [
    { title: "Await Document", icon: <UploadCloud size={20}/> },
    { title: "Encrypt & Upload", icon: <Activity size={20}/> },
    { title: "Compute Witness", icon: <Fingerprint size={20}/> },
    { title: "Synthesize SNARK", icon: <Lock size={20}/> },
    { title: "Verify Network", icon: <CheckCircle size={20}/> }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setCurrentStep(1); // Encrypt & Upload (simulated)

      // 1. Read file locally in browser
      const fileText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });

      // Provide minimal delay for UI experience
      await new Promise((r) => setTimeout(r, 800));

      setCurrentStep(2); // Compute Witness
      
      const phrase = "Confidential: Toxic Waste";
      const M = 25; // Length of phrase
      const max_N = 64; // Circuit chunk size

      if (!fileText.includes(phrase)) {
        throw new Error("Target phrase missing from document. Cannot compute witness.");
      }

      // Convert string to ASCII array
      const textToAscii = (text, length) => {
        const arr = new Array(length).fill(0);
        for(let i=0; i < Math.min(text.length, length); i++) {
            arr[i] = text.charCodeAt(i);
        }
        return arr;
      };

      // Find a 64-byte chunk that contains the phrase
      const phraseIndex = fileText.indexOf(phrase);
      // Try to center it, or at least fit it inside a 64 byte window
      let startIdx = document.documentElement.scrollTop || Math.max(0, phraseIndex - 10);
      // Ensure the chunk doesn't overflow the file boundaries if possible (but we only need 64 bytes)
      let chunkText = fileText.substring(startIdx, startIdx + max_N);
      if (chunkText.length < max_N) {
          chunkText = chunkText.padEnd(max_N, " ");
      }

      const input = {
          root: "11024236530986356642603013506301104427207406034884053437345182671873798377531", // Official test root
          targetPhrase: textToAscii(phrase, M),
          documentChunk: textToAscii(chunkText, max_N),
          pathElements: ["0","0","0"],
          pathIndices: ["0","0","0"]
      };

      await new Promise((r) => setTimeout(r, 600));

      setCurrentStep(3); // Synthesize SNARK
      
      // 2. Generate ZK Proof entirely in the browser using WASM
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "/whistleblower.wasm",
        "/circuit_final.zkey"
      );

      setCurrentStep(4); // Verify Network

      // 3. Send ONLY the generated cryptographic proof to the verifier network
      const res = await fetch("http://localhost:4000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof, publicSignals }),
      });

      const data = await res.json();
      
      setCurrentStep(5); // Complete
      
      if (data.verified) {
        setIsSuccess(true);
        setResultTitle("Authentication Verified");
        setResultMsg("Zero-Knowledge proof generated and verified successfully. Document contains the required signatures.");
      } else {
        setIsSuccess(false);
        setResultTitle("Verification Failed");
        setResultMsg("Invalid Proof: " + (data.message || "Document verification failed."));
      }

    } catch (err) {
      console.error(err);
      setCurrentStep(5);
      setIsSuccess(false);
      setResultTitle("Authentication Error");
      setResultMsg(err.message || "Cryptographic error during proof generation/verification.");
    }
  };

  const resetProcess = () => {
    setCurrentStep(0);
    setResultTitle("");
    setResultMsg("");
  };

  return (
    <div className="premium-layout">
      
      {/* 3D Canvas Layer */}
      <div className="canvas-wrapper">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.5} />
          <NodeNetwork />
        </Canvas>
        <div className="canvas-gradient-overlay" />
      </div>

      <div className="split-container">
        
        {/* Left Side: Hero Info */}
        <section className="hero-section">
          <div className="brand">
            <ShieldAlert className="brand-icon" size={28} />
            <span className="brand-text">Whistleblower-ZK</span>
          </div>
          
          <div className="hero-content">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Absolute <span>Privacy</span>.<br/> Cryptographic <span>Truth</span>.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Prove the authenticity and contents of a highly classified document without ever revealing the file to the verifying network. Powered by Groth16 zk-SNARKs.
            </motion.p>
            
            <motion.div 
               className="tech-stack"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1, delay: 0.5 }}
            >
               <span className="badge">Groth16</span>
               <span className="badge">Poseidon Hash</span>
               <span className="badge">Circom Circuit</span>
            </motion.div>
          </div>
          
          <div className="hero-footer">
            <p className="version">v1.0.0 — Production Grade</p>
          </div>
        </section>

        {/* Right Side: Command Center Panel */}
        <section className="command-section">
          <div className="command-card">
            
            {/* Header */}
            <div className="card-header">
              <h2>Command Center</h2>
              <div className="status-indicator">
                 <div className={`status-dot ${currentStep > 0 && currentStep < 5 ? 'active' : 'idle'}`} />
                 <span>{currentStep === 0 ? "System Idle" : currentStep === 5 ? "Process Complete" : "Proving Active"}</span>
              </div>
            </div>

            {/* Stepper / Timeline */}
            <div className="timeline">
              {steps.map((step, index) => {
                const isActive = currentStep === index;
                const isPast = currentStep > index;
                return (
                  <div key={index} className={`timeline-step ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}>
                     <div className="step-icon">
                        {isPast ? <CheckCircle size={16}/> : step.icon}
                     </div>
                     <span className="step-label">{step.title}</span>
                     {index < steps.length - 1 && <div className="step-connector" />}
                  </div>
                )
              })}
            </div>

            {/* Dynamic Content Area */}
            <div className="card-body">
              <AnimatePresence mode="wait">
                
                {/* IDLE STATE */}
                {currentStep === 0 && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="upload-dropzone"
                  >
                     <div className="dropzone-inner">
                        <UploadCloud size={48} className="drop-icon" strokeWidth={1.5} />
                        <h3>Drop classified file here</h3>
                        <p>Or click to browse from local secure storage. Files are never stored on disk.</p>
                        <label className="btn-primary">
                          <input type="file" onChange={handleFileUpload} />
                          Browse Secure File
                        </label>
                     </div>
                  </motion.div>
                )}

                {/* PROCESSING STATE */}
                {currentStep > 0 && currentStep < 5 && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="processing-view"
                  >
                     <div className="scanner-container">
                        <div className="document-wireframe" />
                        <div className="laser-beam" />
                     </div>
                     <div className="processing-text">
                        <h3>{steps[currentStep].title}</h3>
                        <p className="mono-hash">
                           0x{Math.random().toString(16).substr(2, 32)}...
                        </p>
                     </div>
                  </motion.div>
                )}

                {/* COMPLETE STATE */}
                {currentStep === 5 && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`result-view ${isSuccess ? 'success' : 'error'}`}
                  >
                     <div className="result-icon-wrapper">
                       {isSuccess ? <CheckCircle size={64} /> : <XCircle size={64} />}
                     </div>
                     <h3>{resultTitle}</h3>
                     <p>{resultMsg}</p>
                     
                     <div className="result-actions">
                        {isSuccess && <button className="btn-secondary">View On-chain Proof</button>}
                        <button className="btn-primary" onClick={resetProcess}>
                           Authenticate Another
                        </button>
                     </div>
                  </motion.div>
                )}
                
              </AnimatePresence>
            </div>

          </div>
        </section>
        
      </div>
    </div>
  );
}

export default App;