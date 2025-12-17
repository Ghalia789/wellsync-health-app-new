/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function SleepQuestionnaire({ onSaved, onCancel }: Props) {
  // Section 1: Sleep Timing
  const [bedtime, setBedtime] = useState<string>("");
  const [wakeTime, setWakeTime] = useState<string>("");
  const [timeToFallAsleep, setTimeToFallAsleep] = useState<string>("");
  const [wakeUpCount, setWakeUpCount] = useState<string>("");
  
  // Section 2: Sleep Quality
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [morningFeeling, setMorningFeeling] = useState<string>("");
  const [dreamVividness, setDreamVividness] = useState<string>("");
  
  // Section 3: Sleep Environment
  const [roomDarkness, setRoomDarkness] = useState<string>("");
  const [noiseLevel, setNoiseLevel] = useState<string>("");
  const [temperature, setTemperature] = useState<string>("");
  
  // Section 4: Daily Factors
  const [caffeineAfternoon, setCaffeineAfternoon] = useState<string>("");
  const [alcoholEvening, setAlcoholEvening] = useState<string>("");
  const [screenTimeBeforeBed, setScreenTimeBeforeBed] = useState<string>("");
  const [exerciseToday, setExerciseToday] = useState<string>("");
  const [stressLevelToday, setStressLevelToday] = useState<string>("");
  
  // Section 5: Nap Info
  const [hadNap, setHadNap] = useState<string>("no");
  const [napDuration, setNapDuration] = useState<string>("");
  const [napTime, setNapTime] = useState<string>("");
  
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculation functions
  const calculateSleepDuration = (): number => {
    if (!bedtime || !wakeTime) return 0;
    
    const bed = new Date(`2000-01-01T${bedtime}:00`);
    const wake = new Date(`2000-01-01T${wakeTime}:00`);
    
    // Handle overnight (bedtime after midnight)
    if (wake < bed) {
      wake.setDate(wake.getDate() + 1);
    }
    
    let durationHours = (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
    
    // Adjust for time to fall asleep
    const fallAsleepMap: Record<string, number> = {
      "<15": 0.25,    // 15 minutes = 0.25 hours
      "15-30": 0.375, // 22.5 minutes average
      "30-45": 0.625, // 37.5 minutes average
      "45-60": 0.875, // 52.5 minutes average
      ">60": 1.0      // 1 hour
    };
    if (timeToFallAsleep) {
      durationHours -= fallAsleepMap[timeToFallAsleep] || 0;
    }
    
    // Adjust for wake-ups (estimate 15 minutes per wake-up)
    const wakeUpMap: Record<string, number> = {
      "0": 0,
      "1-2": 0.25,    // 15 minutes average
      "3-4": 0.5,     // 30 minutes average
      ">4": 0.75      // 45 minutes average
    };
    if (wakeUpCount) {
      durationHours -= wakeUpMap[wakeUpCount] || 0;
    }
    
    return Math.max(0, Math.round(durationHours * 10) / 10);
  };

  const calculateSleepEfficiency = (durationHours: number): number => {
    if (!bedtime || !wakeTime) return 0;
    
    const bed = new Date(`2000-01-01T${bedtime}:00`);
    const wake = new Date(`2000-01-01T${wakeTime}:00`);
    if (wake < bed) wake.setDate(wake.getDate() + 1);
    
    const timeInBedHours = (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
    
    if (timeInBedHours === 0) return 0;
    
    const efficiency = (durationHours / timeInBedHours) * 100;
    return Math.min(100, Math.max(0, Math.round(efficiency)));
  };

  const calculateSleepScore = (durationHours: number, efficiency: number): number => {
    let score = 0;
    
    // 1. Duration component (0-40 points)
    if (durationHours >= 7 && durationHours <= 8) score += 40;
    else if (durationHours >= 6.5 && durationHours <= 8.5) score += 30;
    else if (durationHours >= 6 && durationHours <= 9) score += 20;
    else if (durationHours >= 5 && durationHours <= 10) score += 10;
    
    // 2. Quality component (0-30 points)
    if (sleepQuality !== null) {
      score += sleepQuality * 3; // 3 points per quality point (1-10 scale)
    }
    
    // 3. Efficiency component (0-20 points)
    if (efficiency >= 85) score += 20;
    else if (efficiency >= 75) score += 15;
    else if (efficiency >= 65) score += 10;
    else if (efficiency >= 55) score += 5;
    
    // 4. Morning feeling component (0-10 points)
    const morningPoints: Record<string, number> = {
      "refreshed": 10,
      "somewhat_refreshed": 7,
      "tired": 3,
      "exhausted": 0
    };
    score += morningPoints[morningFeeling] || 0;
    
    // 5. Sleep hygiene adjustments (±15 points)
    if (caffeineAfternoon === "no") score += 5;
    if (alcoholEvening === "no") score += 5;
    if (screenTimeBeforeBed === "none" || screenTimeBeforeBed === "<30") score += 5;
    
    // 6. Nap penalty (if nap was too long or too late)
    if (hadNap === "yes") {
      const napPenalty: Record<string, number> = {
        "<20": 0,
        "20-40": -3,
        "40-60": -7,
        ">60": -10
      };
      score += napPenalty[napDuration] || 0;
      
      // Late nap penalty (after 4 PM)
      if (napTime && napTime >= "16:00") {
        score -= 5;
      }
    }
    
    return Math.min(100, Math.max(0, score));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      bedtime, wakeTime, timeToFallAsleep, wakeUpCount,
      sleepQuality, morningFeeling, dreamVividness,
      roomDarkness, noiseLevel, temperature,
      caffeineAfternoon, alcoholEvening, screenTimeBeforeBed,
      exerciseToday, stressLevelToday
    ];
    
    if (requiredFields.some(field => !field)) {
      toast.error("Please answer all required questions");
      return;
    }
    
    if (hadNap === "yes" && (!napDuration || !napTime)) {
      toast.error("Please provide nap details");
      return;
    }

    // Calculate all metrics
    const sleepDuration = calculateSleepDuration();
    const sleepEfficiency = calculateSleepEfficiency(sleepDuration);
    const sleepScore = calculateSleepScore(sleepDuration, sleepEfficiency);
    
    // Prepare metadata
    const metadata = {
      // Timing
      bedtime,
      wakeTime,
      timeToFallAsleep,
      wakeUpCount,
      
      // Quality
      sleepQuality,
      morningFeeling,
      dreamVividness,
      
      // Environment
      roomDarkness,
      noiseLevel,
      temperature,
      
      // Daily factors
      caffeineAfternoon,
      alcoholEvening,
      screenTimeBeforeBed,
      exerciseToday,
      stressLevelToday,
      
      // Nap
      hadNap,
      napDuration: hadNap === "yes" ? napDuration : null,
      napTime: hadNap === "yes" ? napTime : null,
      
      // Calculated values
      calculatedDuration: sleepDuration,
      calculatedEfficiency: sleepEfficiency,
      calculatedScore: sleepScore
    };

    setLoading(true);
    try {
      // Save sleep_score (primary measure for ML and goals)
      const res1 = await fetch("/api/measures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sleep_score",
          value: sleepScore,
          unit: "score",
          timestamp: new Date().toISOString(),
          metadata,
          notes,
        }),
      });
      
      if (!res1.ok) {
        const data = await res1.json();
        throw new Error(data.error || "Failed to save sleep score");
      }

      // Save sleep_duration
      const res2 = await fetch("/api/measures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sleep_duration",
          value: sleepDuration,
          unit: "hours",
          timestamp: new Date().toISOString(),
          metadata: { isCalculated: true },
          notes: `Calculated from questionnaire`,
        }),
      });

      // Save sleep_quality
      const res3 = await fetch("/api/measures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sleep_quality",
          value: sleepQuality || 0,
          unit: "score",
          timestamp: new Date().toISOString(),
          notes,
        }),
      });

      // Save sleep_efficiency
      const res4 = await fetch("/api/measures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sleep_efficiency",
          value: sleepEfficiency,
          unit: "percentage",
          timestamp: new Date().toISOString(),
          metadata: { isCalculated: true },
          notes: `Calculated efficiency: ${sleepEfficiency}%`,
        }),
      });

      toast.success("Sleep questionnaire saved successfully!", { icon: "✅" });
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error("SleepQuestionnaire error:", err);
      toast.error(err?.message || "Error saving sleep questionnaire");
    } finally {
      setLoading(false);
    }
  };

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
      {/* Sleep Timing */}
      {renderSection(
        "Sleep Timing",
        "Information about when you slept and how long it took",
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What time did you go to bed? *
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full rounded border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What time did you wake up? *
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full rounded border p-2"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How long did it take you to fall asleep? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {["<15", "15-30", "30-45", "45-60", ">60"].map((time) => (
                <label key={time} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="timeToFallAsleep"
                    value={time}
                    checked={timeToFallAsleep === time}
                    onChange={() => setTimeToFallAsleep(time)}
                    required
                  />
                  <span className="text-sm">{time} min</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How many times did you wake up during the night? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["0", "1-2", "3-4", ">4"].map((count) => (
                <label key={count} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="wakeUpCount"
                    value={count}
                    checked={wakeUpCount === count}
                    onChange={() => setWakeUpCount(count)}
                    required
                  />
                  <span className="text-sm">{count}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Sleep Quality */}
      {renderSection(
        "Sleep Quality",
        "How you felt about your sleep",
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate your sleep quality (1 = Very poor, 10 = Excellent) *
            </label>
            <div className="flex flex-wrap gap-1 justify-between">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <label key={n} className="flex flex-col items-center flex-1 min-w-[30px]">
                  <input
                    type="radio"
                    name="sleepQuality"
                    value={n}
                    checked={sleepQuality === n}
                    onChange={() => setSleepQuality(n)}
                    className="mb-1"
                    required
                  />
                  <span className="text-xs">{n}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How did you feel when you woke up? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "refreshed", label: "Refreshed & energetic" },
                { value: "somewhat_refreshed", label: "Somewhat refreshed" },
                { value: "tired", label: "Tired" },
                { value: "exhausted", label: "Exhausted" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="morningFeeling"
                    value={option.value}
                    checked={morningFeeling === option.value}
                    onChange={() => setMorningFeeling(option.value)}
                    required
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How vivid were your dreams? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "vivid", label: "Very vivid" },
                { value: "moderate", label: "Moderate" },
                { value: "faint", label: "Faint" },
                { value: "none", label: "No dream recall" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dreamVividness"
                    value={option.value}
                    checked={dreamVividness === option.value}
                    onChange={() => setDreamVividness(option.value)}
                    required
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Sleep Environment */}
      {renderSection(
        "Sleep Environment",
        "Conditions in your sleeping environment",
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How dark was your room? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "very_dark", label: "Very dark" },
                { value: "dark", label: "Dark" },
                { value: "some_light", label: "Some light" },
                { value: "bright", label: "Bright" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="roomDarkness"
                    value={option.value}
                    checked={roomDarkness === option.value}
                    onChange={() => setRoomDarkness(option.value)}
                    required
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Noise level during sleep *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "silent", label: "Silent" },
                { value: "quiet", label: "Quiet" },
                { value: "moderate", label: "Moderate noise" },
                { value: "noisy", label: "Noisy" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="noiseLevel"
                    value={option.value}
                    checked={noiseLevel === option.value}
                    onChange={() => setNoiseLevel(option.value)}
                    required
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room temperature felt *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "cool", label: "Cool" },
                { value: "comfortable", label: "Comfortable" },
                { value: "warm", label: "Warm" },
                { value: "hot", label: "Hot" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="temperature"
                    value={option.value}
                    checked={temperature === option.value}
                    onChange={() => setTemperature(option.value)}
                    required
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Daily Factors */}
      {renderSection(
        "Daily Factors",
        "Activities that might affect sleep",
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Did you consume caffeine after 2 PM? *
              </label>
              <div className="flex gap-4">
                {["yes", "no"].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="caffeineAfternoon"
                      value={option}
                      checked={caffeineAfternoon === option}
                      onChange={() => setCaffeineAfternoon(option)}
                      required
                    />
                    <span className="capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Did you drink alcohol in the evening? *
              </label>
              <div className="flex gap-4">
                {["yes", "no"].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="alcoholEvening"
                      value={option}
                      checked={alcoholEvening === option}
                      onChange={() => setAlcoholEvening(option)}
                      required
                    />
                    <span className="capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Screen time in the hour before bed *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "none", label: "None" },
                { value: "<30", label: "< 30 min" },
                { value: "30-60", label: "30-60 min" },
                { value: ">60", label: "> 60 min" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="screenTimeBeforeBed"
                    value={option.value}
                    checked={screenTimeBeforeBed === option.value}
                    onChange={() => setScreenTimeBeforeBed(option.value)}
                    required
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Did you exercise today? *
              </label>
              <div className="flex gap-4">
                {["yes", "no"].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exerciseToday"
                      value={option}
                      checked={exerciseToday === option}
                      onChange={() => setExerciseToday(option)}
                      required
                    />
                    <span className="capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overall stress level today *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "low", label: "Low" },
                  { value: "moderate", label: "Moderate" },
                  { value: "high", label: "High" },
                  { value: "very_high", label: "Very High" }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="stressLevelToday"
                      value={option.value}
                      checked={stressLevelToday === option.value}
                      onChange={() => setStressLevelToday(option.value)}
                      required
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Nap Information */}
      {renderSection(
        "Nap Information",
        "Details about daytime naps",
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Did you take a nap during the day?
            </label>
            <div className="flex gap-4">
              {["yes", "no"].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hadNap"
                    value={option}
                    checked={hadNap === option}
                    onChange={() => {
                      setHadNap(option);
                      if (option === "no") {
                        setNapDuration("");
                        setNapTime("");
                      }
                    }}
                  />
                  <span className="capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {hadNap === "yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nap duration *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["<20", "20-40", "40-60", ">60"].map((duration) => (
                    <label key={duration} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="napDuration"
                        value={duration}
                        checked={napDuration === duration}
                        onChange={() => setNapDuration(duration)}
                        required
                      />
                      <span className="text-sm">{duration} min</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What time did you nap? *
                </label>
                <input
                  type="time"
                  value={napTime}
                  onChange={(e) => setNapTime(e.target.value)}
                  className="w-full rounded border p-2"
                  required
                />
              </div>
            </div>
          )}
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
          placeholder="Any other observations about your sleep..."
        />
      </div>

      {/* Summary Preview */}
      {(bedtime && wakeTime) && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">Sleep Summary Preview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Duration:</p>
              <p className="font-semibold">{calculateSleepDuration()} hours</p>
            </div>
            <div>
              <p className="text-gray-600">Efficiency:</p>
              <p className="font-semibold">
                {calculateSleepEfficiency(calculateSleepDuration())}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">Quality:</p>
              <p className="font-semibold">{sleepQuality || "-"}/10</p>
            </div>
            <div>
              <p className="text-gray-600">Estimated Score:</p>
              <p className="font-semibold">
                {calculateSleepScore(
                  calculateSleepDuration(),
                  calculateSleepEfficiency(calculateSleepDuration())
                )}/100
              </p>
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
          {loading ? "Saving..." : "Submit Sleep Data"}
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