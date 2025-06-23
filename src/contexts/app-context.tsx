"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, TrackedApplication, JobPosting, ApplicationStatus } from '@/types';

interface AppContextType {
  userProfile: UserProfile | null;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  trackedApplications: TrackedApplication[];
  addTrackedApplication: (job: JobPosting, status?: ApplicationStatus) => TrackedApplication;
  updateTrackedApplication: (id: string, updates: Partial<TrackedApplication>) => void;
  removeTrackedApplication: (id: string) => void;
  isInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PROFILE = 'autoapply_userProfile';
const LOCAL_STORAGE_KEY_APPLICATIONS = 'autoapply_trackedApplications';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trackedApplications, setTrackedApplications] = useState<TrackedApplication[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        setUserProfile({
          name: '',
          email: '',
          resumeFileName: null,
          resumeContent: null,
          preferences: { location: '', jobTitles: '' },
          coverLetterTemplate: null,
        });
      }

      const storedApplications = localStorage.getItem(LOCAL_STORAGE_KEY_APPLICATIONS);
      if (storedApplications) {
        setTrackedApplications(JSON.parse(storedApplications));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      // Initialize with defaults if localStorage fails
       setUserProfile({
          name: '',
          email: '',
          resumeFileName: null,
          resumeContent: null,
          preferences: { location: '', jobTitles: '' },
          coverLetterTemplate: null,
        });
      setTrackedApplications([]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && userProfile) {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    }
  }, [userProfile, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(LOCAL_STORAGE_KEY_APPLICATIONS, JSON.stringify(trackedApplications));
    }
  }, [trackedApplications, isInitialized]);

  const updateUserProfile = (profileUpdate: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...profileUpdate } : (profileUpdate as UserProfile));
  };

  const addTrackedApplication = (job: JobPosting, status: ApplicationStatus = 'Bookmarked'): TrackedApplication => {
    const newApplication: TrackedApplication = {
      id: crypto.randomUUID(),
      job,
      appliedDate: status === 'Applied' ? new Date().toISOString() : null,
      status: status,
    };
    setTrackedApplications(prev => [newApplication, ...prev.filter(app => app.job.url !== job.url)]); // Prevent duplicates by URL
    return newApplication;
  };

  const updateTrackedApplication = (id: string, updates: Partial<TrackedApplication>) => {
    setTrackedApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, ...updates } : app))
    );
  };

  const removeTrackedApplication = (id: string) => {
    setTrackedApplications(prev => prev.filter(app => app.id !== id));
  };
  
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <AppContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        trackedApplications,
        addTrackedApplication,
        updateTrackedApplication,
        removeTrackedApplication,
        isInitialized,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
