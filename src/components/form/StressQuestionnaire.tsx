/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function StressQuestionnaire({ onSaved, onCancel }: Props) {
  // Emotional Stress (0-4 scale each)
  const [emotionalStress, setEmotionalStress] = useState<number[]>([
    -1, -1, -1, -1
  ]);
  
  // Physical Stress (0-4 scale each)
  const [physicalStress, setPhysicalStress] = useState<number[]>([
    -1, -1, -1, -1
  ]);
  
  // Cognitive Stress (0-4 scale each)
  const [cognitiveStress, setCognitiveStress] = useState<number[]>([
    -1, -1, -1, -1
  ]);
  
  // Behavioral Stress (0-4 scale each)
  const [behavioralStress, setBehavioralStress] = useState<number[]>([
    -1, -1, -1
  ]);
  
  // Daily Stressors (multiple select)
  const [stressors, setStressors] = useState<string[]>([]);
  
  // Coping Mechanisms (multiple select)
  const [copingMechanisms, setCopingMechanisms] = useState<string[]>([]);
  
  // Daily Impact
  const [productivityImpact, setProductivityImpact] = useState<string>("");
  const [moodImpact, setMoodImpact] = useState<string>("");
  const [socialImpact, setSocialImpact] = useState<string>("");
  
  // Physical Symptoms
  const [headache, setHeadache] = useState<string>("");
  const [fatigue, setFatigue] = useState<string>("");
  const [appetiteChange, setAppetiteChange] = useState<string>("");
  
  // Recovery
  const [recoveryTime, setRecoveryTime] = useState<string>("");
  const [stressManagementToday, setStressManagementToday] = useState<string>("");
  
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const emotionalQuestions = [
    "I felt overwhelmed or unable to cope",
    "I felt anxious or worried",
    "I felt irritable or easily angered",
    "I felt sad or down"
  ];

  const physicalQuestions = [
    "I experienced muscle tension or body aches",
    "I had trouble relaxing my body",
    "I felt physically exhausted",
    "I experienced rapid heartbeat or palpitations"
  ];

  const cognitiveQuestions = [
    "I had racing or intrusive thoughts",
    "I had difficulty concentrating",
    "I experienced memory problems",
    "I had negative or pessimistic thinking"
  ];

  const behavioralQuestions = [
    "I procrastinated or avoided responsibilities",
    "I felt restless or fidgety",
    "I had changes in sleep patterns",
    "I was impatient with others"
  ];

  const stressorOptions = [
    "Work pressure",
    "Financial concerns",
    "Relationship issues",
    "Health concerns",
    "Family responsibilities",
    "Time pressure",
    "Uncertainty about future",
    "Social situations",
    "Personal expectations",
    "Other"
  ];

  const copingOptions = [
    "Exercise or physical activity",
    "Meditation or deep breathing",
    "Talking to someone",
    "Engaging in hobbies",
    "Taking breaks",
    "Time management",
    "Setting boundaries",
    "Positive self-talk",
    "Professional support",
    "No specific coping"
  ];

  const impactOptions = ["None", "Mild", "Moderate", "Severe", "Extreme"];
  const symptomOptions = ["Not at all", "Slightly", "Moderately", "Very", "Extremely"];
  const recoveryOptions = ["<1 hour", "1-3 hours", "3-6 hours", "6-12 hours", ">12 hours", "All day"];
  const managementOptions = ["Very effective", "Somewhat effective", "Neutral", "Ineffective", "Didn't manage"];

  // Calculation functions
  const calculateStressScores = () => {
    const calculateDimensionScore = (answers: number[]) => {
      const validAnswers = answers.filter(a => a >= 0);
      if (validAnswers.length === 0) return 0;
      const sum = validAnswers.reduce((total, val) => total + val, 0);
      return (sum / (validAnswers.length * 4)) * 100; // Convert to percentage
    };

    const emotionalScore = calculateDimensionScore(emotionalStress);
    const physicalScore = calculateDimensionScore(physicalStress);
    const cognitiveScore = calculateDimensionScore(cognitiveStress);
    const behavioralScore = calculateDimensionScore(behavioralStress);

    // Overall stress score (0-100, higher = more stress)
    const overallStress = (emotionalScore + physicalScore + cognitiveScore + behavioralScore) / 4;

    // Stress health score (0-100, higher = better)
    const stressHealth = Math.max(0, 100 - overallStress);

    // Stress intensity level
    let intensity = "Low";
    if (overallStress >= 75) intensity = "Very High";
    else if (overallStress >= 60) intensity = "High";
    else if (overallStress >= 40) intensity = "Moderate";
    else if (overallStress >= 25) intensity = "Mild";

    // Calculate recovery score (0-100, higher = faster recovery)
    const recoveryMap: Record<string, number> = {
      "<1 hour": 100,
      "1-3 hours": 80,
      "3-6 hours": 60,
      "6-12 hours": 40,
      ">12 hours": 20,
      "All day": 0
    };
    const recoveryScore = recoveryMap[recoveryTime] || 0;

    // Calculate management effectiveness
    const managementMap: Record<string, number> = {
      "Very effective": 100,
      "Somewhat effective": 75,
      "Neutral": 50,
      "Ineffective": 25,
      "Didn't manage": 0
    };
    const managementScore = managementMap[stressManagementToday] || 0;

    return {
      overallStress: Math.round(overallStress * 10) / 10,
      stressHealth: Math.round(stressHealth * 10) / 10,
      dimensionScores: {
        emotional: Math.round(emotionalScore * 10) / 10,
        physical: Math.round(physicalScore * 10) / 10,
        cognitive: Math.round(cognitiveScore * 10) / 10,
        behavioral: Math.round(behavioralScore * 10) / 10,
      },
      intensity,
      recoveryScore,
      managementScore,
      stressorsCount: stressors.length,
      copingCount: copingMechanisms.length,
      metadata: {
        emotionalAnswers: emotionalStress,
        physicalAnswers: physicalStress,
        cognitiveAnswers: cognitiveStress,
        behavioralAnswers: behavioralStress,
        stressors,
        copingMechanisms,
        productivityImpact,
        moodImpact,
        socialImpact,
        headache,
        fatigue,
        appetiteChange,
        recoveryTime,
        stressManagementToday
      }
    };
  };

  const setEmotionalAnswer = (index: number, value: number) => {
    const copy = [...emotionalStress];
    copy[index] = value;
    setEmotionalStress(copy);
  };

  const setPhysicalAnswer = (index: number, value: number) => {
    const copy = [...physicalStress];
    copy[index] = value;
    setPhysicalStress(copy);
  };

  const setCognitiveAnswer = (index: number, value: number) => {
    const copy = [...cognitiveStress];
    copy[index] = value;
    setCognitiveStress(copy);
  };

  const setBehavioralAnswer = (index: number, value: number) => {
    const copy = [...behavioralStress];
    copy[index] = value;
    setBehavioralStress(copy);
  };

  const toggleStressor = (stressor: string) => {
    setStressors(prev =>
      prev.includes(stressor)
        ? prev.filter(s => s !== stressor)
        : [...prev, stressor]
    );
  };

  const toggleCoping = (strategy: string) => {
    setCopingMechanisms(prev =>
      prev.includes(strategy)
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all questions answered
    const allAnswers = [
      ...emotionalStress,
      ...physicalStress,
      ...cognitiveStress,
      ...behavioralStress,
      productivityImpact,
      moodImpact,
      socialImpact,
      headache,
      fatigue,
      appetiteChange,
      recoveryTime,
      stressManagementToday
    ];
    
    if (allAnswers.some(answer => answer === -1 || answer === "")) {
      toast.error("Please answer all required questions");
      return;
    }

    const metrics = calculateStressScores();
    
    setLoading(true);
    try {
      // Primary measure: stress_score (for ML and goals)
      const res1 = await fetch("/api/measures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stress_score",
          value: metrics.overallStress,
          unit: "score",
          timestamp: new Date().toISOString(),
          metadata: metrics.metadata,
          notes,
        }),
      });
      
      if (!res1.ok) {
        const data = await res1.json();
        throw new Error(data.error || "Failed to save stress score");
      }

      // Secondary measure: stress_health (inverse, for progress tracking)
      const res2 = await fetch("/api/measures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stress_health",
          value: metrics.stressHealth,
          unit: "score",
          timestamp: new Date().toISOString(),
          metadata: { isCalculated: true },
          notes: `Intensity: ${metrics.intensity}`,
        }),
      });

      // Save stress_level (categorical)
      const intensityMap: Record<string, number> = {
        "Low": 1,
        "Mild": 2,
        "Moderate": 3,
        "High": 4,
        "Very High": 5
      };
      const res3 = await fetch("/api/measures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stress_level",
          value: intensityMap[metrics.intensity] || 0,
          unit: "level",
          timestamp: new Date().toISOString(),
          metadata: { intensity: metrics.intensity },
          notes: `Stress intensity: ${metrics.intensity}`,
        }),
      });

      toast.success("Stress questionnaire saved successfully!", { icon: "✅" });
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error("StressQuestionnaire error:", err);
      toast.error(err?.message || "Error saving stress questionnaire");
    } finally {
      setLoading(false);
    }
  };

  const renderDimensionSection = (
    title: string,
    questions: string[],
    answers: number[],
    setter: (index: number, value: number) => void
  ) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
      {questions.map((question, idx) => (
        <div key={idx} className="bg-white p-3 rounded border">
          <p className="font-medium text-gray-700 mb-2">{question}</p>
          <div className="flex flex-wrap gap-3">
            {[0, 1, 2, 3, 4].map((value) => (
              <label key={value} className="flex items-center gap-1">
                <input
                  type="radio"
                  name={`${title.toLowerCase()}_q${idx}`}
                  checked={answers[idx] === value}
                  onChange={() => setter(idx, value)}
                  className="text-blue-600"
                />
                <span className="text-sm">
                  {value === 0 ? "Not at all" :
                   value === 1 ? "Rarely" :
                   value === 2 ? "Sometimes" :
                   value === 3 ? "Often" : "Very often"}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSection = (
    title: string,
    description: string,
    children: React.ReactNode
  ) => (
    <div className="p-4 mb-4 bg-gray-50 rounded-lg border">
      <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      {children}
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Emotional Stress */}
      {renderSection(
        "Emotional Stress",
        "How you felt emotionally today",
        renderDimensionSection("Emotional", emotionalQuestions, emotionalStress, setEmotionalAnswer)
      )}

      {/* Physical Stress */}
      {renderSection(
        "Physical Stress",
        "Physical symptoms of stress",
        renderDimensionSection("Physical", physicalQuestions, physicalStress, setPhysicalAnswer)
      )}

      {/* Cognitive Stress */}
      {renderSection(
        "Cognitive Stress",
        "Thought patterns and mental state",
        renderDimensionSection("Cognitive", cognitiveQuestions, cognitiveStress, setCognitiveAnswer)
      )}

      {/* Behavioral Stress */}
      {renderSection(
        "Behavioral Stress",
        "Changes in behavior and actions",
        renderDimensionSection("Behavioral", behavioralQuestions, behavioralStress, setBehavioralAnswer)
      )}

      {/* Stressors */}
      {renderSection(
        "Stressors",
        "What contributed to your stress today",
        <div className="space-y-3">
          <p className="text-sm text-gray-700 mb-2">Select all that apply:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stressorOptions.map((stressor) => (
              <label key={stressor} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={stressors.includes(stressor)}
                  onChange={() => toggleStressor(stressor)}
                  className="rounded"
                />
                <span className="text-sm">{stressor}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Coping Mechanisms */}
      {renderSection(
        "Coping Mechanisms",
        "How you managed stress today",
        <div className="space-y-3">
          <p className="text-sm text-gray-700 mb-2">Select all that apply:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {copingOptions.map((strategy) => (
              <label key={strategy} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={copingMechanisms.includes(strategy)}
                  onChange={() => toggleCoping(strategy)}
                  className="rounded"
                />
                <span className="text-sm">{strategy}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Daily Impact */}
      {renderSection(
        "Daily Impact",
        "How stress affected your day",
        <>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impact on productivity *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {impactOptions.map((impact) => (
                  <label key={impact} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="productivityImpact"
                      value={impact.toLowerCase()}
                      checked={productivityImpact === impact.toLowerCase()}
                      onChange={() => setProductivityImpact(impact.toLowerCase())}
                      required
                    />
                    <span className="text-sm">{impact}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impact on mood *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {impactOptions.map((impact) => (
                  <label key={impact} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="moodImpact"
                      value={impact.toLowerCase()}
                      checked={moodImpact === impact.toLowerCase()}
                      onChange={() => setMoodImpact(impact.toLowerCase())}
                      required
                    />
                    <span className="text-sm">{impact}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impact on social interactions *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {impactOptions.map((impact) => (
                  <label key={impact} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="socialImpact"
                      value={impact.toLowerCase()}
                      checked={socialImpact === impact.toLowerCase()}
                      onChange={() => setSocialImpact(impact.toLowerCase())}
                      required
                    />
                    <span className="text-sm">{impact}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Physical Symptoms */}
      {renderSection(
        "Physical Symptoms",
        "Physical manifestations of stress",
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headache intensity *
              </label>
              <div className="space-y-1">
                {symptomOptions.map((level) => (
                  <label key={level} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="headache"
                      value={level.toLowerCase()}
                      checked={headache === level.toLowerCase()}
                      onChange={() => setHeadache(level.toLowerCase())}
                      required
                    />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fatigue level *
              </label>
              <div className="space-y-1">
                {symptomOptions.map((level) => (
                  <label key={level} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="fatigue"
                      value={level.toLowerCase()}
                      checked={fatigue === level.toLowerCase()}
                      onChange={() => setFatigue(level.toLowerCase())}
                      required
                    />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appetite changes *
              </label>
              <div className="space-y-1">
                {["Decreased", "Normal", "Increased", "Binge eating"].map((change) => (
                  <label key={change} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="appetiteChange"
                      value={change.toLowerCase()}
                      checked={appetiteChange === change.toLowerCase()}
                      onChange={() => setAppetiteChange(change.toLowerCase())}
                      required
                    />
                    <span className="text-sm">{change}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recovery & Management */}
      {renderSection(
        "Recovery & Management",
        "How you recovered and managed stress",
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time to recover from stress peaks *
              </label>
              <div className="space-y-1">
                {recoveryOptions.map((time) => (
                  <label key={time} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="recoveryTime"
                      value={time}
                      checked={recoveryTime === time}
                      onChange={() => setRecoveryTime(time)}
                      required
                    />
                    <span className="text-sm">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effectiveness of stress management today *
              </label>
              <div className="space-y-1">
                {managementOptions.map((effectiveness) => (
                  <label key={effectiveness} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="stressManagementToday"
                      value={effectiveness}
                      checked={stressManagementToday === effectiveness}
                      onChange={() => setStressManagementToday(effectiveness)}
                      required
                    />
                    <span className="text-sm">{effectiveness}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional notes (optional)
        </label>
        <textarea
          className="w-full rounded border p-3"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any other observations about your stress..."
        />
      </div>

      {/* Summary Preview */}
      {emotionalStress.some(a => a >= 0) && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">Stress Summary Preview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Overall Stress:</p>
              <p className="font-semibold">{calculateStressScores().overallStress}/100</p>
            </div>
            <div>
              <p className="text-gray-600">Stress Health:</p>
              <p className="font-semibold">{calculateStressScores().stressHealth}/100</p>
            </div>
            <div>
              <p className="text-gray-600">Intensity:</p>
              <p className="font-semibold">{calculateStressScores().intensity}</p>
            </div>
            <div>
              <p className="text-gray-600">Stressors:</p>
              <p className="font-semibold">{stressors.length} identified</p>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--mint-500)] hover:bg-[var(--mint-400)] text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Submit Stress Data"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}