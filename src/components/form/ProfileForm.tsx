"use client";

import React, { useState } from "react";
import FormField from "./FormField";
import toast from "react-hot-toast";

interface ProfileFormData {
  birthDate: string;
  height: number | string;
  weight: number | string;
}

interface ProfileFormProps {
  initialData?: ProfileFormData;
  isEditMode?: boolean;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function ProfileForm({
  initialData = { birthDate: "", height: "", weight: "" },
  isEditMode = false,
  onSubmit,
  isLoading = false,
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string | undefined> = {};

    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (birthDate > today) {
        newErrors.birthDate = "Birth date cannot be in the future";
      } else if (age > 150) {
        newErrors.birthDate = "Please enter a valid age";
      }
    }

    if (formData.height) {
      const height = Number(formData.height);
      if (height < 50 || height > 300) {
        newErrors.height = "Height must be between 50 and 300 cm";
      }
    }

    if (formData.weight) {
      const weight = Number(formData.weight);
      if (weight < 20 || weight > 500) {
        newErrors.weight = "Weight must be between 20 and 500 kg";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("❌ Please fix the errors in the form", {
        icon: "⚠️",
        style: {
          borderRadius: "8px",
          background: "#ef4444",
          color: "#fff",
          fontFamily: "Poppins, sans-serif",
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(
        isEditMode
          ? "✅ Profile updated successfully!"
          : "✅ Profile created successfully!",
        {
          icon: "🎉",
          style: {
            borderRadius: "8px",
            background: "#16a34a",
            color: "#fff",
            fontFamily: "Poppins, sans-serif",
          },
        }
      );
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "❌ Failed to save profile", {
        icon: "💥",
        style: {
          borderRadius: "8px",
          background: "#ef4444",
          color: "#fff",
          fontFamily: "Poppins, sans-serif",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <FormField
        label="Date of Birth"
        type="date"
        name="birthDate"
        value={formData.birthDate}
        onChange={handleInputChange}
        error={errors.birthDate}
        helpText="We use this to calculate your health metrics"
      />

      <FormField
        label="Height (cm)"
        type="number"
        name="height"
        value={formData.height}
        onChange={handleInputChange}
        placeholder="e.g., 175"
        min={50}
        max={300}
        step={0.5}
        error={errors.height}
        helpText="Enter your height in centimeters"
      />

      <FormField
        label="Weight (kg)"
        type="number"
        name="weight"
        value={formData.weight}
        onChange={handleInputChange}
        placeholder="e.g., 75"
        min={20}
        max={500}
        step={0.5}
        error={errors.weight}
        helpText="Enter your weight in kilograms"
      />

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full bg-[var(--mint-500)] text-white font-medium py-3 rounded-full hover:bg-[var(--mint-400)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting || isLoading
          ? isEditMode
            ? "Updating..."
            : "Creating..."
          : isEditMode
            ? "Update Profile"
            : "Create Profile"}
      </button>
    </form>
  );
}
