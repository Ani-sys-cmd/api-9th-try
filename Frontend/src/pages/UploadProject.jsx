import React, { useState, useEffect } from 'react';
import { Upload, FileArchive, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useProject } from '../context/ProjectContext';

const UploadProject = () => {
    const { projectState, setProjectState } = useProject();
    const navigate = useNavigate();

    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(projectState.uploadStatus || 'idle'); // idle, uploading, success, error
    const [endpoints, setEndpoints] = useState(projectState.endpoints || []);
    const [githubUrl, setGithubUrl] = useState(projectState.githubUrl || '');
    const [error, setError] = useState(null);

    // When user navigates away and comes back, hydrate from global state
    useEffect(() => {
        setStatus(projectState.uploadStatus || 'idle');
        setEndpoints(projectState.endpoints || []);
        setGithubUrl(projectState.githubUrl || '');
    }, [projectState.uploadStatus, projectState.endpoints, projectState.githubUrl]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (selectedFile) => {
        setFile(selectedFile);
        setStatus('uploading');
        setError(null);

        try {
            const res = await api.uploadProject(selectedFile);
            const discoveredEndpoints = res.data.endpoints_data || [];

            setEndpoints(discoveredEndpoints);
            setStatus('success');

            // Persist across the whole app (and refreshes)
            setProjectState((prev) => ({
                ...prev,
                projectName: selectedFile.name,
                uploadStatus: 'success',
                endpoints: discoveredEndpoints,
                githubUrl: githubUrl
            }));
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.detail || err.message || 'Upload failed';
            setError(message);
            setStatus('error');
        }
    };

    const handleGithubBlur = () => {
        // Light-weight validation + persist URL without forcing upload
        setProjectState((prev) => ({
            ...prev,
            githubUrl: githubUrl
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30">
                            <FileArchive className="w-5 h-5 text-blue-400" />
                        </span>
                        Upload Project
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Upload your API project as a ZIP file or attach a GitHub repository link. We&apos;ll scan it
                        and detect all available endpoints.
                    </p>
                </div>
            </div>

            {/* GitHub URL input (optional) */}
            <div className="glass-panel rounded-2xl border border-white/5 bg-white/5 p-5 space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                        GitHub Repository URL (optional)
                    </label>
                    <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        onBlur={handleGithubBlur}
                        placeholder="https://github.com/username/repository"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                        GitHub Token (Optional - for private repos)
                    </label>
                    <input
                        type="password"
                        value={projectState.githubToken || ''}
                        onChange={(e) => setProjectState(prev => ({ ...prev, githubToken: e.target.value }))}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <p className="text-xs text-gray-400">
                    This is stored with your session so it won&apos;t disappear when you move between steps.
                </p>

                {/* Process GitHub Button */}
                {githubUrl && (
                    <button
                        onClick={async () => {
                            setStatus('uploading');
                            setError(null);
                            try {
                                const res = await api.processGitHub(githubUrl, projectState.githubToken);
                                const discoveredEndpoints = res.data.endpoints_data || [];
                                setEndpoints(discoveredEndpoints);
                                setStatus('success');
                                setProjectState((prev) => ({
                                    ...prev,
                                    projectName: res.data.project_name,
                                    uploadStatus: 'success',
                                    endpoints: discoveredEndpoints,
                                    githubUrl: githubUrl
                                }));
                            } catch (err) {
                                console.error(err);
                                const message = err?.response?.data?.detail || err.message || 'GitHub processing failed';
                                setError(message);
                                setStatus('error');
                            }
                        }}
                        disabled={status === 'uploading'}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${status === 'uploading'
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 text-white'
                            }`}
                    >
                        <FileArchive className="w-5 h-5" />
                        {status === 'uploading' ? 'Processing Repository...' : 'Process GitHub Repo'}
                    </button>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <label
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${dragActive
                        ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                        : 'border-gray-700 bg-gray-900/50 hover:border-blue-400 hover:bg-gray-800'
                        }`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div
                            className={`w-16 h-16 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-4 ${status === 'uploading' ? 'animate-pulse' : ''
                                }`}
                        >
                            {status === 'success' ? (
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            ) : status === 'error' ? (
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            ) : (
                                <Upload className="w-8 h-8 text-blue-400" />
                            )}
                        </div>
                        <p className="mb-2 text-lg text-gray-300 font-medium">
                            {file ? file.name : projectState.projectName || 'Drop your project zip here'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {status === 'uploading'
                                ? 'Scanning project structure...'
                                : 'or click to browse files'}
                        </p>
                    </div>
                    <input type="file" className="hidden" onChange={handleChange} accept=".zip" />
                </label>
            </motion.div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {endpoints.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-panel rounded-2xl border border-white/5 bg-white/5 overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Discovered Endpoints</h3>
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                            {endpoints.length} Total
                        </span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {endpoints.map((ep, i) => (
                            <div
                                key={i}
                                className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                            >
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold tracking-wide inline-flex items-center justify-center ${ep.method === 'GET'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : ep.method === 'POST'
                                            ? 'bg-green-500/20 text-green-300'
                                            : 'bg-orange-500/20 text-orange-300'
                                        }`}
                                >
                                    {ep.method}
                                </span>
                                <code className="text-sm text-gray-300 font-mono flex-1">{ep.path}</code>
                            </div>
                        ))}
                    </div>

                    {/* Generate Test Cases Button */}
                    <div className="p-6 border-t border-white/10">
                        <button
                            onClick={() => {
                                // Set a flag to auto-trigger generation
                                setProjectState(prev => ({ ...prev, autoGenerateTests: true }));
                                navigate('/generate');
                            }}
                            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 text-white transition-all"
                        >
                            <Zap className="w-5 h-5" />
                            Generate Test Cases
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default UploadProject;
