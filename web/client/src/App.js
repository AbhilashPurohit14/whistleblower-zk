import React, { useState } from "react";
import "./App.css";

function App() {

  const [status,setStatus] = useState("Waiting for document...");
  const [result,setResult] = useState("");
  const [phrase,setPhrase] = useState("");

  const sendFile = async (event) => {

    const file = event.target.files[0];

    if(!file){
      alert("Please upload a file");
      return;
    }

    if(!phrase || phrase.trim()===""){
      alert("Please enter a phrase");
      return;
    }

    const formData = new FormData();
    formData.append("file",file);
    formData.append("phrase",phrase);

    try{

      setStatus("Uploading document...");

      const res = await fetch("http://localhost:4000/prove",{
        method:"POST",
        body:formData
      });

      setStatus("Generating witness...");
      await new Promise(r => setTimeout(r,800));

      setStatus("Generating ZK proof...");
      await new Promise(r => setTimeout(r,800));

      setStatus("Verifying proof...");
      await new Promise(r => setTimeout(r,800));

      const data = await res.json();

      setResult(data.verified ? "Proof Verified ✅" : "Invalid Proof ❌");

      setStatus("Verification complete");

    }
    catch(err){

      console.log(err);
      setStatus("Error during verification");

    }

  };

  return(

    <div className="container">

      <div className="card">

        <h1 className="title">Anonymous Document Authenticator</h1>

        <p className="subtitle">
          Verify that a confidential document contains sensitive information
          without revealing the document itself.
        </p>

        <input
          type="text"
          placeholder="Enter phrase to verify"
          value={phrase}
          onChange={(e)=>setPhrase(e.target.value)}
        />

        <div className="upload">
          <input type="file" onChange={sendFile}/>
        </div>

        <div className="status">
          <p>{status}</p>
        </div>

        <div className="result">
          {result && <h2>{result}</h2>}
        </div>

        <div className="crypto">

          <h3>Cryptography Details</h3>

          <ul>
            <li><b>ZK System:</b> Groth16 zk-SNARK</li>
            <li><b>Hash Function:</b> Poseidon</li>
            <li><b>Merkle Tree Depth:</b> 3</li>
            <li><b>Proof Size:</b> ~200 bytes</li>
            <li><b>Verification Time:</b> &lt; 100 ms</li>
          </ul>

        </div>

        <div className="team">
          <p>Developed by</p>
          <p><b>Abhilash Purohit</b></p>
          <p><b>Suchet Kumbar</b></p>
          <p><b>Pratik Anand</b></p>
        </div>

      </div>

    </div>

  );

}

export default App;