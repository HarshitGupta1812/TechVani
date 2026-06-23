import React, { useState } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import AuthModal from './components/AuthModal';
import PreProcessModal from './components/PreProcessModal';
import './App.css';

export default function App() {
  // Controls which main view is shown
  const [currentView, setCurrentView] = useState('landing'); 
  const [user, setUser] = useState(null);
  
  // Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const [isPreProcessOpen, setIsPreProcessOpen] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [processConfig, setProcessConfig] = useState(null);

  // Handlers for Auth Flow
  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  // Handlers for Processing Flow
  const handleOpenPreProcess = (fileType) => {
    setSelectedFileType(fileType);
    setIsPreProcessOpen(true);
  };

  const handleStartProcessing = (config) => {
    setProcessConfig(config);
    setIsPreProcessOpen(false);
    setCurrentView('workspace');
  };

  return (
    <>
      {/* Conditional Rendering based on currentView state */}
      {currentView === 'landing' && (
        <Landing onOpenAuth={handleOpenAuth} />
      )}

      {currentView === 'dashboard' && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onOpenPreProcess={handleOpenPreProcess} 
        />
      )}

      {currentView === 'workspace' && processConfig && (
        <Workspace 
          config={processConfig} 
          fileType={selectedFileType} 
          onLogout={handleLogout} 
        />
      )}

      {/* Global Modals */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode}
        onSuccess={(userData) => {
          setUser(userData);
          setIsAuthOpen(false);
          setCurrentView('dashboard');
        }}
      />
      
      <PreProcessModal 
        isOpen={isPreProcessOpen} 
        onClose={() => setIsPreProcessOpen(false)} 
        fileType={selectedFileType}
        onStartProcessing={handleStartProcessing}
      />
    </>
  );
}