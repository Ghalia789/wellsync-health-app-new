/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar/Navbar";
import ProfileForm from "@/components/form/ProfileForm";
import toast from "react-hot-toast";

interface UserProfile {
  _id?: string;
  idUser?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (status !== "authenticated") return;

      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (res.ok && data.profile) {
          // Convert date string to YYYY-MM-DD format for input field
          const profile = data.profile;
          if (profile.birthDate) {
            // Handle both ISO string and potential timezone issues
            const date = new Date(profile.birthDate);
            // Adjust for timezone to get the correct date
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            profile.birthDate = `${year}-${month}-${day}`;
          }
          setProfile(profile);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [status]);

  const handleCreateProfile = async (formData: any) => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create profile");
      }

      setProfile(data.profile);
      setIsEditMode(false);
    } catch (err: any) {
      throw new Error(err.message || "Failed to create profile");
    }
  };

  const handleUpdateProfile = async (formData: any) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Convert date string to YYYY-MM-DD format using UTC
      const updatedProfile = data.profile;
      if (updatedProfile.birthDate) {
        const date = new Date(updatedProfile.birthDate);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        updatedProfile.birthDate = `${year}-${month}-${day}`;
      }

      setProfile(updatedProfile);
      setIsEditMode(false);
    } catch (err: any) {
      throw new Error(err.message || "Failed to update profile");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--gray-50)', color: 'var(--gray-500)'}}>
          <div className="text-center animate-pulse" style={{color: 'var(--gray-500)'}}>
            <div className="text-lg">Loading your profile...</div>
          </div>
        </div>
      </>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'var(--gray-50)'}}>
        <div className="max-w-4xl mx-auto">
          {!profile && !isEditMode ? (
            // No profile exists - show CTA
            <div className="rounded-lg shadow-md p-8 text-center" style={{backgroundColor: 'var(--card-bg)'}}>
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--gray-900)'}}>
                  Complete Your Health Profile
                </h1>
                <p className="text-lg" style={{color: 'var(--gray-600)'}}>
                  Tell us about yourself so we can better serve your health
                  needs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                <div className="p-6 rounded-lg" style={{backgroundColor: 'var(--blue-50)'}}>
                  <div className="text-4xl mb-3">🎂</div>
                  <h3 className="font-semibold mb-2" style={{color: 'var(--gray-900)'}}>
                    Birth Date
                  </h3>
                  <p className="text-sm" style={{color: 'var(--gray-600)'}}>
                    Helps us calculate your health metrics
                  </p>
                </div>

                <div className="p-6 rounded-lg" style={{backgroundColor: 'var(--green-50)'}}>
                  <div className="text-4xl mb-3">📏</div>
                  <h3 className="font-semibold mb-2" style={{color: 'var(--gray-900)'}}>Height</h3>
                  <p className="text-sm" style={{color: 'var(--gray-600)'}}>
                    Essential for BMI calculation
                  </p>
                </div>

                <div className="p-6 rounded-lg" style={{backgroundColor: 'var(--purple-50)'}}>
                  <div className="text-4xl mb-3">⚖️</div>
                  <h3 className="font-semibold mb-2" style={{color: 'var(--gray-900)'}}>Weight</h3>
                  <p className="text-sm" style={{color: 'var(--gray-600)'}}>
                    Track your wellness journey
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditMode(true)}
                className="inline-block bg-[var(--mint-500)] text-white font-medium py-3 px-8 rounded-full hover:bg-[var(--mint-400)] transition-colors"
              >
                Create Your Profile
              </button>
            </div>
          ) : (
            // Profile exists or editing mode
            <div className="rounded-lg shadow-md p-8" style={{backgroundColor: 'var(--card-bg)'}}>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold" style={{color: 'var(--gray-900)'}}>
                  {isEditMode ? "Edit Your Health Profile" : "Your Health Profile"}
                </h1>
                {profile && !isEditMode && (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="bg-[var(--mint-500)] text-white font-medium py-2 px-4 rounded-full hover:bg-[var(--mint-400)] transition-colors text-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditMode ? (
                <ProfileForm
                  initialData={{
                    birthDate: profile?.birthDate || "",
                    height: profile?.height || "",
                    weight: profile?.weight || "",
                  }}
                  isEditMode={!!profile}
                  onSubmit={
                    profile ? handleUpdateProfile : handleCreateProfile
                  }
                  isLoading={isLoading}
                />
              ) : (
                // View mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-lg" style={{background: `linear-gradient(to bottom right, var(--blue-50), var(--blue-100))`}}>
                      <p className="text-sm font-medium mb-2" style={{color: 'var(--gray-600)'}}>
                        Birth Date
                      </p>
                      <p className="text-2xl font-bold" style={{color: 'var(--gray-900)'}}>
                        {profile?.birthDate
                          ? new Date(profile.birthDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Not set"}
                      </p>
                    </div>

                    <div className="p-6 rounded-lg" style={{background: `linear-gradient(to bottom right, var(--green-50), var(--green-100))`}}>
                      <p className="text-sm font-medium mb-2" style={{color: 'var(--gray-600)'}}>
                        Height
                      </p>
                      <p className="text-2xl font-bold" style={{color: 'var(--gray-900)'}}>
                        {profile?.height ? `${profile.height} cm` : "Not set"}
                      </p>
                    </div>

                    <div className="p-6 rounded-lg" style={{background: `linear-gradient(to bottom right, var(--purple-50), var(--purple-100))`}}>
                      <p className="text-sm font-medium mb-2" style={{color: 'var(--gray-600)'}}>
                        Weight
                      </p>
                      <p className="text-2xl font-bold" style={{color: 'var(--gray-900)'}}>
                        {profile?.weight ? `${profile.weight} kg` : "Not set"}
                      </p>
                    </div>
                  </div>

                  {profile?.updatedAt && (
                    <div className="text-center text-sm" style={{color: 'var(--gray-500)'}}>
                      Last updated on{" "}
                      {new Date(profile.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
