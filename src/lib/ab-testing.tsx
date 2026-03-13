'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface Experiment {
  id: string;
  variants: string[];
  weights?: number[];
}

interface ExperimentContextType {
  variant: (experimentId: string) => string;
  trackConversion: (experimentId: string, variant: string, goal: string) => void;
}

const ExperimentContext = createContext<ExperimentContextType | null>(null);

const STORAGE_KEY = 'ai_mixer_ab_experiments';

interface StoredExperiment {
  id: string;
  variant: string;
  assignedAt: number;
}

function getStoredAssignments(): Map<string, StoredExperiment> {
  if (typeof window === 'undefined') return new Map();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();
    
    const parsed = JSON.parse(stored);
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function storeAssignment(experimentId: string, variant: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const assignments = getStoredAssignments();
    assignments.set(experimentId, {
      id: experimentId,
      variant,
      assignedAt: Date.now()
    });
    
    const obj = Object.fromEntries(assignments);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // LocalStorage not available
  }
}

function selectVariant(variants: string[], weights?: number[]): string {
  if (!weights || weights.length !== variants.length) {
    return variants[Math.floor(Math.random() * variants.length)];
  }
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < variants.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return variants[i];
    }
  }
  
  return variants[variants.length - 1];
}

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const variant = (experimentId: string): string => {
    const assignments = getStoredAssignments();
    const existing = assignments.get(experimentId);
    
    if (existing) {
      return existing.variant;
    }
    
    const experiments: Record<string, { variants: string[]; weights?: number[] }> = {
      'hero_cta_style': {
        variants: ['control', 'variant_a'],
        weights: [50, 50]
      },
      'pricing_display': {
        variants: ['control', 'variant_a'],
        weights: [50, 50]
      },
      'testimonial_order': {
        variants: ['control', 'variant_a'],
        weights: [50, 50]
      }
    };
    
    const experiment = experiments[experimentId];
    if (!experiment) {
      return 'control';
    }
    
    const selectedVariant = selectVariant(experiment.variants, experiment.weights);
    storeAssignment(experimentId, selectedVariant);
    
    return selectedVariant;
  };
  
  const trackConversion = (experimentId: string, variant: string, goal: string): void => {
    if (typeof window === 'undefined') return;
    
    const event = {
      experimentId,
      variant,
      goal,
      timestamp: Date.now(),
      sessionId: sessionStorage.getItem('session_id') || crypto.randomUUID()
    };
    
    sessionStorage.setItem('session_id', event.sessionId);
    
    // In production, send to analytics service
    console.log('[A/B Test] Conversion:', event);
  };
  
  return (
    <ExperimentContext.Provider value={{ variant, trackConversion }}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiment must be used within ExperimentProvider');
  }
  return context;
}

interface ABTestProps {
  experimentId: string;
  control: React.ReactNode;
  variantA: React.ReactNode;
}

export function ABTest({ experimentId, control, variantA }: ABTestProps) {
  const { variant } = useExperiment();
  const assignedVariant = variant(experimentId);
  
  return assignedVariant === 'variant_a' ? variantA : control;
}

interface VariantTrackerProps {
  experimentId: string;
  variant: string;
  goal: string;
  children: React.ReactNode;
}

export function VariantTracker({ experimentId, variant, goal, children }: VariantTrackerProps) {
  const { trackConversion } = useExperiment();
  
  return (
    <span data-exp-id={experimentId} data-exp-variant={variant} data-exp-goal={goal}>
      {children}
    </span>
  );
}
