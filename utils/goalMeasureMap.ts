export const goalMeasureMap: Record<string, string[]> = {
    WEIGHT_LOSS: ["weight"],
    MUSCLE_GAIN: ["weight"],
    MAINTENANCE: ["weight", "height"],
    HEART_HEALTH: ["blood_pressure"],
    SLEEP_IMPROVEMENT: ["sleep_duration", "sleep_quality"],
    STRESS_REDUCTION: ["stress_level"],
    DIABETES_CONTROL: ["glucose"],
};

// Helper to get measure types
export function getMeasureTypesForGoalType(type: string): string[] {
    return goalMeasureMap[type] || [];
}
