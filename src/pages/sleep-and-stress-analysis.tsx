// app/dashboard/analysis/page.tsx
"use client";

import { Suspense } from "react";
import SleepStressAnalysis from "@/components/analysis/SleepStressAnalysis";
import { useSearchParams } from "next/navigation";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const timeframe = searchParams.get('timeframe') || '30';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Health Analysis</h1>
        <p className="text-gray-600 mt-2">
          Detailed analysis of your sleep and stress patterns based on questionnaire data
        </p>
      </div>
      
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">How this works</h3>
          <p className="text-sm text-blue-700">
            This analysis uses data from your sleep and stress questionnaires to identify patterns,
            trends, and correlations. It works independently from your main health ML pipeline.
          </p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mint-500)]"></div>
        </div>
      }>
        <SleepStressAnalysis 
          userId="current" 
          timeframe={parseInt(timeframe as string)} 
        />
      </Suspense>
      
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">Understanding Your Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Sleep Score</h4>
            <p className="text-gray-600">
              0-100 scale. 80+ = Excellent, 60-79 = Good, below 60 = Needs improvement
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Stress Score</h4>
            <p className="text-gray-600">
              0-100 scale. Below 30 = Low, 30-59 = Moderate, 60+ = High stress
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Correlation</h4>
            <p className="text-gray-600">
              Negative correlation = Better sleep with lower stress. Values near 0 = No relationship
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mint-500)]"></div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}