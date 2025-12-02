import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Github, FileCode, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';

const UploadProject = () => {
    const [githubUrl, setGithubUrl] = useState('');
    const [githubToken, setGithubToken] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const { projectState, uploadProject, uploadGithubRepo } = useProject();
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setIsUploading(true);
        setUploadError(null);

        try {
            await uploadProject(file);
            // navigate('/generate'); // Removed auto-navigation
        } catch (error) {
            setUploadError(error.message || 'Failed to upload project');
        } finally {
            setIsUploading(false);
        }
    }, [uploadProject]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/zip': ['.zip'],
            'application/x-zip-compressed': ['.zip']
        },
        multiple: false
    });

    const handleGithubUpload = async (e) => {
        e.preventDefault();
        if (!githubUrl) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            await uploadGithubRepo(githubUrl, githubToken);
            // navigate('/generate'); // Removed auto-navigation
        } catch (error) {
            setUploadError(error.message || 'Failed to clone repository');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Upload Project</h1>
                <p className="text-muted-foreground mt-1">Upload your API project as a ZIP file or attach a GitHub repository link. We'll scan it and detect all available endpoints.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="p-8">
                    <form onSubmit={handleGithubUpload} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">GitHub Repository URL (optional)</label>
                            <div className="relative">
                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    placeholder="https://github.com/username/repository"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">GitHub Token (Optional - for private repos)</label>
                            <div className="relative">
                                <FileCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="password"
                                    value={githubToken}
                                    onChange={(e) => setGithubToken(e.target.value)}
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-500">This is stored with your session so it won't disappear when you move between steps.</p>
                        </div>

                        {githubUrl && (
                            <div className="flex justify-end">
                                <Button type="submit" isLoading={isUploading}>
                                    Clone & Scan
                                </Button>
                            </div>
                        )}
                    </form>
                </Card>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${isDragActive
                        ? 'border-blue-500 bg-blue-500/5'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-500/20 text-blue-500' : 'bg-white/5 text-gray-400'}`}>
                            <Upload className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">
                                {isDragActive ? 'Drop your project zip here' : 'Drop your project zip here'}
                            </h3>
                            <p className="text-gray-500 mt-1">or click to browse files</p>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center gap-3 text-blue-400"
                    >
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                        <p className="font-medium">Uploading and scanning project files...</p>
                        <p className="text-sm text-blue-400/70">This might take a moment depending on the project size.</p>
                    </motion.div>
                )}

                {uploadError && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
                    >
                        <AlertCircle className="h-5 w-5" />
                        <p>{uploadError}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {projectState.endpoints && projectState.endpoints.length > 0 && !isUploading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Detected Endpoints</h2>
                            <p className="text-muted-foreground">Found {projectState.endpoints.length} endpoints in {projectState.projectName}</p>
                        </div>
                        <Button onClick={() => navigate('/generate')} variant="primary">
                            Go to Test Generation
                        </Button>
                    </div>

                    <Card className="overflow-hidden">
                        <div className="divide-y divide-white/10">
                            {projectState.endpoints.map((endpoint, index) => (
                                <div key={index} className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4">
                                    <span className={`
                                        px-2 py-1 rounded text-xs font-bold uppercase w-16 text-center
                                        ${endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : ''}
                                        ${endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' : ''}
                                        ${endpoint.method === 'PUT' ? 'bg-orange-500/20 text-orange-400' : ''}
                                        ${endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-400' : ''}
                                        ${!['GET', 'POST', 'PUT', 'DELETE'].includes(endpoint.method) ? 'bg-gray-500/20 text-gray-400' : ''}
                                    `}>
                                        {endpoint.method}
                                    </span>
                                    <code className="text-sm text-gray-300 font-mono">{endpoint.path}</code>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default UploadProject;
