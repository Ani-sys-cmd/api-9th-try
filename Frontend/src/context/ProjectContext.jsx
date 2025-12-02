import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api';

const ProjectContext = createContext(null);

const DEFAULT_STATE = {
  projectName: null,
  endpoints: [],
  uploadStatus: 'idle',
  uploadPath: null,
  githubUrl: '',
  generatorLogs: [],
  generatorStatus: 'idle',
  generatorBaseUrl: 'http://localhost:5000'
};

export const ProjectProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [projectState, setProjectState] = useState(() => {
    try {
      const raw = window.localStorage.getItem('projectState');
      if (!raw) return DEFAULT_STATE;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    } catch (e) {
      console.warn('Failed to restore project state from localStorage', e);
      return DEFAULT_STATE;
    }
  });

  // Reset state when user logs out
  useEffect(() => {
    if (!currentUser) {
      setProjectState(DEFAULT_STATE);
      window.localStorage.removeItem('projectState');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      try {
        window.localStorage.setItem('projectState', JSON.stringify(projectState));
      } catch (e) {
        console.warn('Failed to persist project state', e);
      }
    }
  }, [projectState, currentUser]);

  const uploadProject = async (file) => {
    setProjectState(prev => ({ ...prev, uploadStatus: 'uploading' }));
    try {
      const response = await api.uploadProject(file);
      setProjectState(prev => ({
        ...prev,
        uploadStatus: 'success',
        projectName: response.data.project_name,
        endpoints: response.data.endpoints_data,
        uploadPath: response.data.upload_path,
        autoGenerateTests: true // Flag to trigger generation on next page
      }));
      return response.data;
    } catch (error) {
      setProjectState(prev => ({ ...prev, uploadStatus: 'error' }));
      throw error;
    }
  };

  const uploadGithubRepo = async (url, token) => {
    setProjectState(prev => ({ ...prev, uploadStatus: 'uploading' }));
    try {
      const response = await api.uploadGithubRepo(url, token);
      setProjectState(prev => ({
        ...prev,
        uploadStatus: 'success',
        projectName: response.data.project_name,
        endpoints: response.data.endpoints_data,
        uploadPath: response.data.upload_path,
        githubUrl: url,
        autoGenerateTests: true
      }));
      return response.data;
    } catch (error) {
      setProjectState(prev => ({ ...prev, uploadStatus: 'error' }));
      throw error;
    }
  };

  return (
    <ProjectContext.Provider value={{ projectState, setProjectState, uploadProject, uploadGithubRepo }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return ctx;
};
