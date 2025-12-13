export const goalMeasureMap: Record<string, string[]> = {
    WEIGHT_LOSS: ["weight"],
    MUSCLE_GAIN: ["weight"],
    MAINTENANCE: ["weight", "height"],
    HEART_HEALTH: ["blood_pressure"],
    SLEEP_IMPROVEMENT: ["sleep_score", "sleep_duration", "sleep_quality", "sleep_efficiency"],
    STRESS_REDUCTION: ["stress_score", "stress_health", "stress_level"],
    DIABETES_CONTROL: ["glucose"],
};

// Helper to get measure types
export function getMeasureTypesForGoalType(type: string): string[] {
    return goalMeasureMap[type] || [];
}

// New: Get primary measure type for each goal (for progress calculation)
export function getPrimaryMeasureTypeForGoal(type: string): string {
  const primaryMap: Record<string, string> = {
    WEIGHT_LOSS: "weight",
    MUSCLE_GAIN: "weight",
    MAINTENANCE: "weight",
    HEART_HEALTH: "blood_pressure",
    SLEEP_IMPROVEMENT: "sleep_score",
    STRESS_REDUCTION: "stress_score",
    DIABETES_CONTROL: "glucose",
  };
  return primaryMap[type] || goalMeasureMap[type]?.[0] || "";
}