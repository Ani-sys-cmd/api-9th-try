import React, { useState } from 'react';
import { api } from './api';
import HealingModal from './components/HealingModal';

function App() {
  const [status, setStatus] = useState("idle"); // idle, uploading, scanning, generating, running
  const [projectData, setProjectData] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFailure, setSelectedFailure] = useState(null);

  const addLog = (msg) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus("uploading");
    addLog("Uploading project zip...");

    try {
      const res = await api.uploadProject(file);
      setProjectData(res.data);
      setEndpoints(res.data.endpoints_data);
      setStatus("ready_to_gen");
      addLog(`Upload complete. Found ${res.data.endpoints_found} API endpoints.`);
    } catch (err) {
      addLog(`Error: ${err.message}`);
      setStatus("error");
    }
  };

  const handleGenerate = async () => {
    setStatus("generating");
    addLog("Agent is generating test cases using LLM...");
    try {
      const res = await api.generateTests();
      addLog("Test generation complete.");
      setStatus("ready_to_run");
    } catch (err) {
      addLog(`Generation Error: ${err.message}`);
    }
  };

  const handleRun = async () => {
    setStatus("running");
    addLog("Executing tests via Pytest & RL Engine...");
    try {
      const res = await api.runTests();
      setTestResults(res.data.results);
      addLog(`Execution finished. Reward: ${res.data.results.reward}`);
      setStatus("done");
    } catch (err) {
      addLog(`Execution Error: ${err.message}`);
    }
  };

  const openHealing = (type) => {
    // Determines if we are fixing a test (type='test') or code (type='code')
    setSelectedFailure({ type, logs: testResults?.logs, testFile: testResults?.test_file });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-blue-400">Agentic AI Tester</h1>
        <p className="text-gray-400">Hybrid RL Framework for Self-Healing API Testing</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT PANEL: Controls */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
          <h2 className="text-xl font-semibold mb-4">1. Project Ingestion</h2>

          <input
            type="file"
            onChange={handleUpload}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 mb-4"
          />

          {endpoints.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-gray-400 mb-2">Detected Endpoints:</h3>
              <ul className="bg-gray-900 p-2 rounded max-h-40 overflow-y-auto text-xs">
                {endpoints.map((ep, i) => (
                  <li key={i} className="mb-1 text-green-400">{ep.method} {ep.path}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGenerate}
              disabled={status !== "ready_to_gen"}
              className={`w-full py-2 rounded font-bold ${status === "ready_to_gen" ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-600 cursor-not-allowed"}`}
            >
              2. Generate Tests (LLM)
            </button>

            <button
              onClick={handleRun}
              disabled={status !== "ready_to_run"}
              className={`w-full py-2 rounded font-bold ${status === "ready_to_run" ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 cursor-not-allowed"}`}
            >
              3. Run Tests (RL Loop)
            </button>
          </div>
        </div>

        {/* MIDDLE PANEL: Terminal / Logs */}
        <div className="bg-black p-6 rounded-lg shadow-lg font-mono text-sm lg:col-span-2 border border-gray-700 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
            <span className="text-gray-400">System Logs</span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">{status.toUpperCase()}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-gray-300">
            {logs.map((log, i) => <div key={i}>{log}</div>)}
            {status === "running" && <div className="animate-pulse text-blue-400">... executing policies ...</div>}
          </div>
        </div>

        {/* BOTTOM PANEL: Results & Healing */}
        {testResults && (
          <div className="col-span-full bg-gray-800 p-6 rounded-lg border-t-4 border-blue-500">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              Execution Results
              <span className="ml-4 text-sm bg-blue-900 text-blue-200 px-3 py-1 rounded-full">
                RL Reward: {testResults.reward}
              </span>
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-900 p-4 rounded text-center">
                <div className="text-3xl font-bold">{testResults.summary.passed}</div>
                <div className="text-sm text-green-200">Passed</div>
              </div>
              <div className="bg-red-900 p-4 rounded text-center">
                <div className="text-3xl font-bold">{testResults.summary.failed}</div>
                <div className="text-sm text-red-200">Failed</div>
              </div>
              <div className="bg-yellow-900 p-4 rounded text-center">
                <div className="text-3xl font-bold">{testResults.summary.error}</div>
                <div className="text-sm text-yellow-200">Errors</div>
              </div>
            </div>

            {testResults.summary.failed > 0 && (
              <div className="bg-red-900/20 border border-red-500 p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-red-400">Failures Detected</h3>
                  <p className="text-sm text-gray-300">The agent identified issues in the test run.</p>
                </div>
                <div className="space-x-3">
                  <button
                    onClick={() => openHealing('test')}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-bold transition"
                  >
                    🤖 Heal Test Case
                  </button>
                  <button
                    onClick={() => openHealing('code')}
                    className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm font-bold transition"
                  >
                    🩺 Diagnose Backend Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <HealingModal
          failure={selectedFailure}
          onClose={() => setShowModal(false)}
          onRetest={() => {
            setShowModal(false);
            handleRun();
          }}
        />
      )}
    </div>
  );
}

export default App;