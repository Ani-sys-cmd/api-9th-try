import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

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

  return (
    <ProjectContext.Provider value={{ projectState, setProjectState }}>
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
