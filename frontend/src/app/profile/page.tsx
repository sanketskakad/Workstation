"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ToastProvider";
import { getUserProfile, updateUserProfile } from "@/lib/api";
import { User as UserIcon, Mail, Building, Clock, MapPin, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { pushToast } = useToast();
  const [profile, setProfile] = useState({
    name: "Developer",
    email: "dev@workstation.io",
    bio: "",
    role: "Full-Stack Operator"
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("workstation-token") : null;

  useEffect(() => {
    if (token) {
      getUserProfile(token).then(user => {
        setProfile({
          name: user.name || "Developer",
          email: user.email || "",
          bio: user.bio || "",
          role: user.role || "Developer"
        });
      }).catch(console.error);
    }
  }, [token]);

  const handleUpdate = async () => {
    if (token) {
      try {
        await updateUserProfile({ name: profile.name, bio: profile.bio }, token);
        pushToast({ 
          title: "Identity Synchronized", 
          description: "Your operator profile has been updated and broadcasted to the team.", 
          type: "success" 
        });
      } catch (err) {
        pushToast({ title: "Update Failed", description: "Could not sync profile to cloud.", type: "error" });
      }
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <section className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              {/* Left Column: Avatar & Basic Info */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm text-center">
                   <div className="mx-auto h-32 w-32 rounded-full bg-brand-600 flex items-center justify-center text-4xl font-bold text-white shadow-glow mb-6">
                      {profile.name.substring(0, 3).toUpperCase()}
                   </div>
                   <h1 className="text-2xl font-bold">{profile.name}</h1>
                   <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-brand-500/10 text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                      <ShieldCheck className="h-3 w-3" /> {profile.role}
                   </div>
                   
                   <div className="mt-8 space-y-4 text-left border-t border-slate-100 dark:border-slate-800 pt-6">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                         <Building className="h-4 w-4" />
                         <span className="text-xs font-medium">Workstation Tech</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                         <MapPin className="h-4 w-4" />
                         <span className="text-xs font-medium">Remote / Global</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                         <Clock className="h-4 w-4" />
                         <span className="text-xs font-medium">UTC+5:30</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Column: Edit Form */}
              <div className="flex-1 space-y-8">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8 text-brand-600">
                    <UserIcon className="h-5 w-5" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Public Identity</h2>
                  </div>
                  
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label>Display Name</Label>
                      <Input 
                        value={profile.name} 
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email Address</Label>
                      <Input value={profile.email} disabled className="opacity-50" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Biography</Label>
                      <textarea 
                        className="flex min-h-32 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:text-white"
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button variant="primary" onClick={handleUpdate}>Update Operator Profile</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
