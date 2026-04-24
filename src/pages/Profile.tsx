import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { User, Shield, CreditCard, Bell, LogOut, ChevronRight, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api";

const Profile = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<any>({
    fullName: "",
    phone: "",
    city: "",
    state: "",
    profilePictureUrl: "",
    metadata: {
      panCard: "",
      monthlyIncome: ""
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await PrymeAPI.getProfile();
      if (res && res.data) {
        setProfileData({
          ...res.data,
          metadata: res.data.metadata || {}
        });
      }
    } catch (error) {
      toast({
        title: "Error fetching profile",
        description: "Could not load your profile data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      await PrymeAPI.updateProfile(profileData);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error saving your profile.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid File", description: "Please upload an image file.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get Presigned URL
      const { data } = await PrymeAPI.initiateAvatarUpload(file.type);
      if (!data || !data.uploadUrl) throw new Error("Could not get upload URL");

      // 2. Upload directly to S3
      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });

      // 3. The documentId is the S3 key. We can construct the public URL or just save the documentId
      // For now, let's assume the bucket is public or we serve it via CloudFront.
      // If we are locally mocking with dummy-s3-upload, we just use a placeholder or the URL
      const fileUrl = data.uploadUrl.includes("dummy-s3") 
        ? URL.createObjectURL(file) // fake it locally for UX
        : data.uploadUrl.split("?")[0]; 

      // 4. Update Profile
      const updatedProfile = { ...profileData, profilePictureUrl: fileUrl };
      await PrymeAPI.updateProfile(updatedProfile);
      setProfileData(updatedProfile);

      toast({ title: "Profile Picture Updated", description: "Your avatar has been changed." });
    } catch (error) {
      console.error(error);
      toast({ title: "Upload Failed", description: "Could not upload profile picture.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (activeTab) {
      case "Personal Info":
        return (
          <div className="bg-card text-card-foreground rounded-[2.5rem] border border-border p-8 shadow-xl">
            <div className="flex items-center gap-6 mb-10">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-slate-200 dark:bg-white/10 flex items-center justify-center border-2 border-primary overflow-hidden">
                  {profileData.profilePictureUrl ? (
                    <img src={profileData.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/jpeg,image/png" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tight">{profileData.fullName || profileData.email?.split("@")[0] || "Member"}</h2>
                <p className="text-slate-500 dark:text-slate-400">{profileData.email}</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">
                   <Shield className="w-3 h-3" /> VERIFIED ACCOUNT
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Details</p>
                
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 ml-1">Full Name</label>
                  <Input 
                    value={profileData.fullName || ""} 
                    onChange={e => setProfileData({...profileData, fullName: e.target.value})}
                    className="rounded-xl border-border bg-secondary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 ml-1">Phone Number</label>
                  <Input 
                    value={profileData.phone || ""} 
                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    className="rounded-xl border-border bg-secondary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 ml-1">PAN Card</label>
                  <Input 
                    value={profileData.metadata?.panCard || ""} 
                    onChange={e => setProfileData({...profileData, metadata: {...profileData.metadata, panCard: e.target.value.toUpperCase()}})}
                    className="rounded-xl border-border bg-secondary uppercase"
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Location & Professional</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 ml-1">City</label>
                    <Input 
                      value={profileData.city || ""} 
                      onChange={e => setProfileData({...profileData, city: e.target.value})}
                      className="rounded-xl border-border bg-secondary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 ml-1">State</label>
                    <Input 
                      value={profileData.state || ""} 
                      onChange={e => setProfileData({...profileData, state: e.target.value})}
                      className="rounded-xl border-border bg-secondary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 ml-1">Monthly Income (₹)</label>
                  <Input 
                    type="number"
                    value={profileData.metadata?.monthlyIncome || ""} 
                    onChange={e => setProfileData({...profileData, metadata: {...profileData.metadata, monthlyIncome: e.target.value}})}
                    className="rounded-xl border-border bg-secondary"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isSaving}
                className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        );

      case "KYC Status":
        const hasPan = !!profileData.metadata?.panCard;
        const hasAadhar = !!profileData.metadata?.aadhar; // assuming metadata might have this
        
        return (
          <div className="space-y-8">
            <div className={`p-8 rounded-[2.5rem] ${hasPan ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'} border flex gap-6 items-center`}>
              <div className={`w-14 h-14 rounded-2xl ${hasPan ? 'bg-green-500/10' : 'bg-amber-500/10'} flex items-center justify-center shrink-0`}>
                {hasPan ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Shield className="w-6 h-6 text-amber-500" />}
              </div>
              <div className="flex-1">
                <h4 className={`text-lg font-semibold ${hasPan ? 'text-green-900 dark:text-green-400' : 'text-amber-900 dark:text-amber-400'}`}>
                  {hasPan ? "KYC Verification Complete" : "KYC Verification Incomplete"}
                </h4>
                <p className={`text-sm ${hasPan ? 'text-green-900/70 dark:text-green-400/60' : 'text-amber-900/70 dark:text-amber-400/60'} mt-1`}>
                  {hasPan ? "Your identity has been verified. You have access to instant pre-approved offers." : "Update your PAN Card in Personal Info to unlock instant pre-approved offers from 5 top banks."}
                </p>
              </div>
              {!hasPan && (
                <Button variant="outline" onClick={() => setActiveTab("Personal Info")} className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10">
                  Update PAN <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        );

      case "Bank Accounts":
        return (
          <div className="bg-card text-card-foreground rounded-[2.5rem] border border-border p-8 shadow-xl text-center py-20">
            <CreditCard className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Linked Accounts</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">Link your primary bank account for faster disbursals and auto-repayment setup.</p>
            <Button variant="outline" className="rounded-xl">Link Bank Account</Button>
          </div>
        );

      case "Preferences":
        return (
          <div className="bg-card text-card-foreground rounded-[2.5rem] border border-border p-8 shadow-xl">
            <h3 className="text-xl font-semibold mb-6">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { title: "Application Updates", desc: "Get notified when your loan status changes." },
                { title: "New Offers", desc: "Alert me when a better interest rate is available." },
                { title: "EMI Reminders", desc: "Receive reminders 3 days before EMI is due." }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e]">
      <Helmet>
        <title>My Profile | PRYME Consulting</title>
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-32 pb-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Sidebar Nav */}
              <div className="w-full md:w-64 space-y-2 shrink-0">
                {[
                  { icon: User, label: "Personal Info" },
                  { icon: Shield, label: "KYC Status" },
                  { icon: CreditCard, label: "Bank Accounts" },
                  { icon: Bell, label: "Preferences" },
                ].map((item) => (
                  <button 
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                      activeTab === item.label 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <button onClick={signOut} className="w-full flex items-center gap-3 p-4 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 mt-8 transition-all">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default Profile;
