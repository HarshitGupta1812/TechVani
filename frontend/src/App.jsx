import React, { useState } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ResultView from './pages/ResultView';
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
  const [reviewData, setReviewData] = useState(null); // For history review mode

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
    setCurrentView('result');
  };

  const handleBackToDashboard = () => {
    setProcessConfig(null);
    setReviewData(null);
    setCurrentView('dashboard');
  };

  // Handler for reviewing a past history item
  const handleReviewHistory = (historyItem) => {
    setReviewData(historyItem);
    setSelectedFileType(historyItem.type);
    // Build a minimal config for ResultView header display
    setProcessConfig({
      url: historyItem.title,
      subject: historyItem.subject || '',
      sourceLang: '',
      outputLang: historyItem.outputLang || '',
      outputFormat: historyItem.outputFormat || 'text',
    });
    setCurrentView('result');
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
          onReviewHistory={handleReviewHistory}
        />
      )}

      {currentView === 'result' && processConfig && (
        <ResultView 
          config={processConfig} 
          fileType={selectedFileType} 
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
          reviewData={reviewData}
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