import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = {
    uploadProject: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    processGitHub: async (githubUrl, token = null) => {
        return axios.post(`${API_URL}/process-github`, {
            github_url: githubUrl,
            token: token
        });
    },

    generateTests: async (config = {}) => {
        return axios.post(`${API_URL}/generate-tests`, {
            base_url: config.base_url || "http://localhost:5000"
        });
    },

    runTests: async () => {
        return axios.post(`${API_URL}/run-tests`, {});
    },

    healTest: async (testFile, logs) => {
        return axios.post(`${API_URL}/heal-test`, {
            test_file: testFile,
            failure_logs: logs
        });
    },

    diagnoseCode: async (sourceFile, logs) => {
        return axios.post(`${API_URL}/diagnose-code`, {
            source_file: sourceFile,
            error_logs: logs
        });
    },

    getDashboardStats: async () => {
        return axios.get(`${API_URL}/dashboard-stats`);
    },

    getHistory: async () => {
        return axios.get(`${API_URL}/history`);
    }
};