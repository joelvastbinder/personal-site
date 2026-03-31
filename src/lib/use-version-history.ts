import { useState, useEffect } from 'react';

const STORAGE_KEY_CURRENT = 'resume-current';
const STORAGE_KEY_PREVIOUS = 'resume-previous';
const STORAGE_KEY_VIEWING = 'resume-viewing-previous';

export function useVersionHistory() {
  const [currentHTML, setCurrentHTML] = useState<string | null>(null);
  const [previousHTML, setPreviousHTML] = useState<string | null>(null);
  const [isViewingPrevious, setIsViewingPrevious] = useState(false);
  
  useEffect(() => {
    try {
      const current = localStorage.getItem(STORAGE_KEY_CURRENT);
      const previous = localStorage.getItem(STORAGE_KEY_PREVIOUS);
      const viewing = localStorage.getItem(STORAGE_KEY_VIEWING);
      
      if (current) setCurrentHTML(current);
      if (previous) setPreviousHTML(previous);
      if (viewing === 'true') setIsViewingPrevious(true);
    } catch (err) {
      console.error('Failed to load version history from localStorage:', err);
    }
  }, []);
  
  useEffect(() => {
    try {
      if (currentHTML !== null) {
        localStorage.setItem(STORAGE_KEY_CURRENT, currentHTML);
      }
      if (previousHTML !== null) {
        localStorage.setItem(STORAGE_KEY_PREVIOUS, previousHTML);
      }
      localStorage.setItem(STORAGE_KEY_VIEWING, isViewingPrevious.toString());
    } catch (err) {
      console.error('Failed to save version history to localStorage:', err);
    }
  }, [currentHTML, previousHTML, isViewingPrevious]);
  
  const addVersion = (newHTML: string) => {
    setPreviousHTML(currentHTML);
    setCurrentHTML(newHTML);
    setIsViewingPrevious(false);
  };
  
  const toggleVersion = () => {
    setIsViewingPrevious(!isViewingPrevious);
  };
  
  const displayedHTML = isViewingPrevious ? previousHTML : currentHTML;
  const canUndo = previousHTML !== null && !isViewingPrevious;
  const canRedo = previousHTML !== null && isViewingPrevious;
  
  return {
    displayedHTML,
    addVersion,
    toggleVersion,
    canUndo,
    canRedo,
    isViewingPrevious,
  };
}
