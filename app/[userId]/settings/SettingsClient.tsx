"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import RegisterForm from "@/app/components/auth/RegisterForm";

import { PROFILE_IMAGES as AVAILABLE_AVATARS } from "@/app/data/profile";
interface User {
  id: string;
  username: string;
  player_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: string;
  designation?: string;
  profile_img?: string | null;
}

interface AdminTeamMember {
  id: string;
  username: string;
  player_id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: string;
  status: string;
  designation?: string;
  profile_img?: string | null;
}

interface SettingsClientProps {
  user: User;
  initialAdmins: AdminTeamMember[];
}

export default function SettingsClient({
  user: initialUser,
  initialAdmins,
}: SettingsClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User>(initialUser);
  const [admins, setAdmins] = useState<AdminTeamMember[]>(initialAdmins);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals Visibility
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const [adminToEdit, setAdminToEdit] = useState<AdminTeamMember | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminTeamMember | null>(null);

  // Form States - Profile
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePlayerId, setProfilePlayerId] = useState(user.player_id);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profileWhatsapp, setProfileWhatsapp] = useState(user.whatsapp);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const openProfileModal = () => {
    setProfileName(user.name);
    setProfileEmail(user.email);
    setProfilePlayerId(user.player_id);
    setProfilePhone(user.phone);
    setProfileWhatsapp(user.whatsapp);
    setProfileError("");
    setProfileSuccess("");
    setShowUpdateProfileModal(true);
  };

  // Form States - Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

// Form States - Add Admin
// State removed because it is handled by RegisterForm

// UI States
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState("");
  const [generalSuccess, setGeneralSuccess] = useState("");

  const isAdmin = user.role.toLowerCase() === "admin";

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    if (!profileName || !profileEmail || !profilePlayerId) {
      setProfileError("Full Name, Email Address, and Player ID are required.");
      setProfileLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileEmail)) {
      setProfileError("Invalid email address format.");
      setProfileLoading(false);
      return;
    }

    // Phone format validation
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (profilePhone && !phoneRegex.test(profilePhone)) {
      setProfileError("Invalid phone number format. Use 7 to 20 digits (optional + prefix).");
      setProfileLoading(false);
      return;
    }

    // WhatsApp format validation
    if (profileWhatsapp && !phoneRegex.test(profileWhatsapp)) {
      setProfileError("Invalid WhatsApp number format. Use 7 to 20 digits (optional + prefix).");
      setProfileLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          playerId: profilePlayerId,
          phone: profilePhone,
          whatsapp: profileWhatsapp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile.");
      } else {
        setProfileSuccess("Profile updated successfully!");
        setUser((prev) => ({
          ...prev,
          name: profileName,
          email: profileEmail,
          player_id: profilePlayerId,
          phone: profilePhone,
          whatsapp: profileWhatsapp,
        }));
        setAdmins((prev) => prev.map(adm => adm.id === user.id ? { 
          ...adm, 
          name: profileName, 
          email: profileEmail,
          player_id: profilePlayerId
        } : adm));
        router.refresh();
        // Auto-close after delay
        setTimeout(() => {
          setShowUpdateProfileModal(false);
          setProfileSuccess("");
        }, 1500);
      }
    } catch {
      setProfileError("Network error. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Avatar Update
  const handleUpdateAvatar = async (imgPath: string) => {
    setGeneralError("");
    setAvatarLoading(true);

    try {
      const res = await fetch("/api/auth/profile-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_img: imgPath }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.error || "Failed to update profile image.");
      } else {
        setGeneralSuccess("Profile image updated successfully!");
        setUser((prev) => ({
          ...prev,
          profile_img: imgPath,
        }));
        setAdmins((prev) => prev.map(adm => adm.id === user.id ? { ...adm, profile_img: imgPath } : adm));
        router.refresh();
        setTimeout(() => setGeneralSuccess(""), 3000);
      }
    } catch {
      setGeneralError("Network error. Please try again.");
    } finally {
      setAvatarLoading(false);
      setShowAvatarModal(false);
      setSelectedAvatar(null);
    }
  };

  // Handle Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);

    if (!currentPassword || !newPassword) {
      setPasswordError("Both current and new passwords are required.");
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to reset password.");
      } else {
        setPasswordSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Auto-close after delay
        setTimeout(() => {
          setShowResetPasswordModal(false);
          setPasswordSuccess("");
        }, 1500);
      }
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Add Admin Success Callback
  const handleAddAdminSuccess = (data: any) => {
    setGeneralSuccess("Administrator created successfully!");
    const newMember: AdminTeamMember = {
      id: String(data.user.id),
      username: data.user.username,
      player_id: data.user.player_id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone || "",
      whatsapp: data.user.whatsapp || "",
      role: data.user.role,
      status: "Active",
      profile_img: data.user.profile_img,
    };
    setAdmins((prev) => [...prev, newMember]);
    setShowAddAdminModal(false);
    router.refresh();
    setTimeout(() => {
      setGeneralSuccess("");
    }, 3000);
  };

  // Handle Edit Admin Success Callback
  const handleEditAdminSuccess = (data: any) => {
    setGeneralSuccess("Administrator updated successfully!");
    setAdmins((prev) => prev.map(adm => adm.id === String(data.user.id) ? {
      ...adm,
      ...data.user,
      id: String(data.user.id)
    } : adm));
    
    // If the edited admin is the current user, update the user state so header/sidebar updates instantly
    if (String(data.user.id) === user.id) {
      setUser((prev) => ({
        ...prev,
        ...data.user,
        id: String(data.user.id)
      }));
    }

    setAdminToEdit(null);
    router.refresh();
    setTimeout(() => {
      setGeneralSuccess("");
    }, 3000);
  };

  // Handle Remove/Delete Admin
  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    const adminId = adminToDelete.id;
    setGeneralError("");
    setGeneralSuccess("");

    try {
      const res = await fetch(`/api/admin/${adminId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.error || "Failed to remove administrator.");
      } else {
        setGeneralSuccess(data.message || "Administrator removed successfully.");
        setAdmins((prev) => prev.filter((adm) => adm.id !== adminId));
        setTimeout(() => setGeneralSuccess(""), 4000);
      }
    } catch {
      setGeneralError("Network error. Please try again.");
    }
    setAdminToDelete(null);
    setActiveMenuId(null);
  };

  // Close modals on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddAdminModal(false);
        setShowUpdateProfileModal(false);
        setShowResetPasswordModal(false);
        setShowAvatarModal(false);
        setSelectedAvatar(null);
        setAdminToEdit(null);
        setAdminToDelete(null);
        setActiveMenuId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Map predefined pictures for admin listing
  const getAvatarForAdmin = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("sarah") || lowerName.includes("jenkins")) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuBCvGNadhkC1CYGed4GzcbSbShrVdpGejG6a1R4kUMr6JMJLx15e5-2wSCxTmA9DztWVYBwmQmG6YrtC0zvNJ-gGli9zclCj7nJFGmSPvh4rgkloGe2HwSQLq6HUz1jXh_yj2vKU-8iFqSnHUEzBZ5Illzlt8hFEIxg2lxxj25xHwql6oIg43vVtfU7hqTMU9O5QxvlA5mBTkNfQH49-bZ79UC3l_JctsrOM5aNcu_XJMv2pqIku_CGONtuxLuUXd8p3jH0CFYGaXk";
    }
    if (lowerName.includes("marcus") || lowerName.includes("lee")) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuB9zyOpNgo4-EcYTOrRWdaVxNdEXRo2aIZX-dQ7rIVhAgcAzEN8KtSgnH9FqESXJX3Dxw8g2I_HFAHisuI0WLf8NtQdEKkRaa8Zjc71wO2nDu2C49TscFuDSA5G3qGf3FHr3ndYQsgtq5n5bNmAHihfDNBAx-MsZErCjIA837h7nIgWtALK6wdmCn8xeTCsQaZKZZftzf0lOIHDhV9ysqBE3Hmz1YR6CRCD6EDfCVAB60a8kjofuK34Zl4DjEftyD6E3-W6CGL33SY";
    }
    if (lowerName.includes("elena") || lowerName.includes("varga")) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuDxaKkykL_w92mpVaNHFjh4I-e85i4eTxt203q8G83FSEdFRCymR77-CL67_p348Oanwn5LEbtHZDTls2_JpaNnrtxgKXbYFeuyqE5EHKYHBZUS7ox-DURQGVo6Ul1-dikCgM6SmbL0bHtSzYqy3qdJW-8PnB6sXQBKYW2IU86SoWJiYEsJmKx9GWZk5LU21spi4Ow0XEsCPnKjnPRanURQpHtMN24lISF0fG053k1vvkvUr7oMsTYZ-O00zjJkSCo1O90CGA6aDVs";
    }
    return "";
  };

  return (
    <div className="flex bg-[#090909] text-[#e5e2e1] min-h-screen font-sora overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        role={user.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <Header
          username={user.name}
          profileImg={user.profile_img || undefined}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Main Panel Canvas */}
        <main className="flex-1 px-8 pt-28 pb-12 relative z-10">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Header Section */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="font-orbitron text-[36px] sm:text-[48px] font-black text-on-surface uppercase tracking-tight mb-2 orbitron-header">
                  {isAdmin ? "Admin Settings" : "Account Settings"}
                </h1>
                <p className="font-sora text-sm text-[#e8bcb7] max-w-2xl">
                  {isAdmin
                    ? "Manage your personal profile, security credentials, and oversee the administrative team of Titan Arena."
                    : "Manage your personal account profile, contact information, and security preferences."}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[#ffb4ab] font-jetbrains text-xs tracking-wider uppercase bg-[#ffb4ab]/5 px-3 py-1.5 rounded-full border border-[#ffb4ab]/10">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse"></span>
                {isAdmin ? "ADMIN CONTROL" : "PLAYER ACCOUNT"}
              </div>
            </section>

            {generalSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-lg text-sm">
                {generalSuccess}
              </div>
            )}
            {generalError && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                {generalError}
              </div>
            )}

            {/* Profile Card Section */}
            <section className="grid grid-cols-1 gap-8">
              <div
                className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-10 border border-white/10"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "inset 0 0 20px rgba(255, 74, 74, 0.05)",
                  borderColor: "rgba(255, 74, 74, 0.2)",
                }}
              >
                {/* Avatar area */}
                <div className="relative group">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-[#ffb4ab]/30 p-1 bg-gradient-to-tr from-[#ffb4ab] to-transparent overflow-hidden flex items-center justify-center relative">
                    {user.profile_img || getAvatarForAdmin(user.name) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        className="w-full h-full object-cover rounded-full bg-[#1e1e22]"
                        src={user.profile_img || getAvatarForAdmin(user.name) || ""}
                        alt={user.name}
                        onError={(e) => {
                          // Fallback to initial icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback avatar */}
                    <div className={`w-full h-full rounded-full bg-[#353534] flex items-center justify-center ${user.profile_img || getAvatarForAdmin(user.name) ? 'hidden' : ''}`}>
                      <span className="material-symbols-outlined text-4xl text-[#ffb4ab]">
                        person
                      </span>
                    </div>
                  </div>
                  
                  {/* Edit Avatar Overlay */}
                  <button 
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer border-4 border-transparent"
                  >
                    <span className="material-symbols-outlined text-white text-3xl mb-1">photo_camera</span>
                    <span className="text-white text-[10px] font-jetbrains uppercase font-bold tracking-wider">Change</span>
                  </button>
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                    <h2 className="font-orbitron text-2xl sm:text-3xl font-extrabold text-on-surface">
                      {user.name}
                    </h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffb4ab]/10 border border-[#ffb4ab] text-[#ffb4ab] font-jetbrains text-[10px] uppercase tracking-wider w-fit mx-auto md:mx-0 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] mr-2 animate-ping"></span>
                      Combat Player
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 max-w-lg text-left text-xs text-[#e8bcb7] font-sora">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">mail</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">tag</span>
                      <span>Player ID: {user.player_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">call</span>
                      <span>{user.phone || "No phone added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">sms</span>
                      <span>WhatsApp: {user.whatsapp || "No number"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                    <button
                      onClick={openProfileModal}
                      className="bg-[#ffb4ab] hover:bg-[#ffb4ab]/90 text-[#410002] px-5 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#ffb4ab]/10 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_edit</span>
                      Update Profile
                    </button>
                    <button
                      onClick={() => setShowResetPasswordModal(true)}
                      className="border border-[#ffb4ab]/40 hover:border-[#ffb4ab] text-[#ffb4ab] px-5 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest flex items-center gap-2 bg-white/5 transition-all active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Manage Admins Section - Admins Only */}
            {isAdmin && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h3 className="font-orbitron text-xl sm:text-2xl font-bold text-on-surface uppercase tracking-tight orbitron-header">
                      Manage Admins
                    </h3>
                    <p className="font-sora text-sm text-[#e8bcb7]">
                      View and manage platform credentials and access designations for core operators.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddAdminModal(true)}
                    className="bg-[#ffa504] hover:bg-[#ffa504]/90 text-[#684100] px-5 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#ffa504]/10 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Add New Admin
                  </button>
                </div>

                <div
                  className="glass-card rounded-2xl overflow-hidden border border-white/5"
                  style={{
                    background: "rgba(255, 255, 255, 0.01)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          <th className="px-6 py-4 font-jetbrains text-xs text-[#e8bcb7] uppercase tracking-widest">
                            Administrator
                          </th>
                          <th className="px-6 py-4 font-jetbrains text-xs text-[#e8bcb7] uppercase tracking-widest">
                            Phone Number
                          </th>
                          <th className="px-6 py-4 font-jetbrains text-xs text-[#e8bcb7] uppercase tracking-widest">
                            WhatsApp Number
                          </th>
                          <th className="px-6 py-4 font-jetbrains text-xs text-[#e8bcb7] uppercase tracking-widest">
                            Status
                          </th>
                          <th className="px-6 py-4 font-jetbrains text-xs text-[#e8bcb7] uppercase tracking-widest text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {admins.map((adm) => (
                          <tr
                            key={adm.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center bg-[#201f1f]">
                                  {adm.profile_img || getAvatarForAdmin(adm.name) ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      className="w-full h-full object-cover"
                                      src={adm.profile_img || getAvatarForAdmin(adm.name) || ""}
                                      alt={adm.name}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  
                                  <div className={`flex items-center justify-center ${adm.profile_img || getAvatarForAdmin(adm.name) ? 'hidden' : ''}`}>
                                    <span className="material-symbols-outlined text-xl text-[#ffb4ab]">
                                      person
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-sora text-sm font-semibold text-on-surface">
                                    {adm.name}
                                  </div>
                                  <div className="font-jetbrains text-[11px] text-[#e8bcb7]/70">
                                    {adm.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                           
                            <td className="px-6 py-4">
                              <span className="font-sora text-xs text-[#e8bcb7]">
                                {adm.phone || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-sora text-xs text-[#e8bcb7]">
                                {adm.whatsapp || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-sora text-xs text-[#e8bcb7]">
                                  {adm.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {adm.id === user.id ? (
                                <span className="font-jetbrains text-[10px] text-[#e8bcb7]/50 tracking-wider">
                                  Current User
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => setAdminToEdit(adm)}
                                    className="w-8 h-8 rounded bg-white/5 hover:bg-[#ffb4ab]/10 border border-white/5 hover:border-[#ffb4ab]/20 flex items-center justify-center transition-all cursor-pointer group"
                                    title="Edit Admin"
                                  >
                                    <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-[#ffb4ab] transition-colors">
                                      edit
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => setAdminToDelete(adm)}
                                    className="w-8 h-8 rounded bg-white/5 hover:bg-red-950/40 border border-white/5 hover:border-red-500/30 flex items-center justify-center transition-all cursor-pointer group"
                                    title="Remove Admin"
                                  >
                                    <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-red-400 transition-colors">
                                      delete
                                    </span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-white/[0.01] border-t border-white/5 flex justify-center">
                    <span className="font-jetbrains text-xs text-[#e8bcb7] tracking-wider">
                      OPERATOR TEAM SIZE: {admins.length} ACTIVE
                    </span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* MODAL: AVATAR SELECTION */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300 ${
          showAvatarModal ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`glass-card rounded-2xl w-full max-w-2xl p-6 sm:p-8 transform transition-transform duration-300 border border-white/10 ${
            showAvatarModal ? "scale-100" : "scale-95"
          }`}
          style={{
            background: "rgba(18, 18, 18, 0.95)",
            boxShadow: "0 0 30px rgba(255, 74, 74, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 74, 74, 0.3)",
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-orbitron font-extrabold text-xl sm:text-2xl text-[#ffb4ab] uppercase tracking-tight">
              Select Profile Picture
            </h3>
            <button
              onClick={() => {
                setShowAvatarModal(false);
                setSelectedAvatar(null);
              }}
              className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer"
            >
              close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 py-4">
            {AVAILABLE_AVATARS.map((avatar, idx) => {
              const isSelected = selectedAvatar ? selectedAvatar === avatar : user.profile_img === avatar;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedAvatar(avatar)}
                  disabled={avatarLoading}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected ? "border-[#ffb4ab]" : "border-transparent hover:border-white/30"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar}
                    alt={`Avatar ${idx + 1}`}
                    className="w-full h-auto aspect-square object-cover"
                  />
                  <div className={`absolute inset-0 bg-black/40 transition-opacity ${isSelected ? "opacity-0" : "opacity-0 group-hover:opacity-100"} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#ffb4ab] rounded-full p-0.5 text-black shadow-lg z-10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              onClick={() => {
                setShowAvatarModal(false);
                setSelectedAvatar(null);
              }}
              className="px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-widest text-[#e8bcb7] hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedAvatar && selectedAvatar !== user.profile_img) {
                  handleUpdateAvatar(selectedAvatar);
                } else {
                  setShowAvatarModal(false);
                }
              }}
              disabled={avatarLoading || (!selectedAvatar && !user.profile_img)}
              className="px-6 py-2 bg-[#ffb4ab] hover:bg-[#ffb4ab]/90 text-[#410002] rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#ffb4ab]/10 cursor-pointer disabled:opacity-50"
            >
              {avatarLoading ? "Updating..." : "Change"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: UPDATE PROFILE */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300 ${
          showUpdateProfileModal ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`glass-card rounded-2xl w-full max-w-lg p-6 sm:p-8 transform transition-transform duration-300 border border-white/10 ${
            showUpdateProfileModal ? "scale-100" : "scale-95"
          }`}
          style={{
            background: "rgba(18, 18, 18, 0.95)",
            boxShadow: "0 0 30px rgba(255, 74, 74, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 74, 74, 0.3)",
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-orbitron font-extrabold text-xl sm:text-2xl text-[#ffb4ab] uppercase tracking-tight">
              Update Profile
            </h3>
            <button
              onClick={() => {
                setShowUpdateProfileModal(false);
                setProfileError("");
                setProfileSuccess("");
              }}
              className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer"
            >
              close
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {profileError && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-200 px-3 py-2 rounded text-xs">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 px-3 py-2 rounded text-xs">
                {profileSuccess}
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-jetbrains text-[10px] tracking-[0.15em] text-[#e8bcb7]/70 uppercase">
                Full Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab] focus:outline-none transition-all placeholder:text-[#e8bcb7]/20"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-jetbrains text-[10px] tracking-[0.15em] text-[#e8bcb7]/70 uppercase">
                Email Address
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab] focus:outline-none transition-all placeholder:text-[#e8bcb7]/20"
                placeholder="email@titanarena.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-jetbrains text-[10px] tracking-[0.15em] text-[#e8bcb7]/70 uppercase">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab] focus:outline-none transition-all placeholder:text-[#e8bcb7]/20"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-jetbrains text-[10px] tracking-[0.15em] text-[#e8bcb7]/70 uppercase">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={profileWhatsapp}
                  onChange={(e) => setProfileWhatsapp(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab] focus:outline-none transition-all placeholder:text-[#e8bcb7]/20"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                disabled={profileLoading}
                className="flex-1 bg-[#ffb4ab] hover:bg-[#ffb4ab]/90 text-[#410002] py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#ffb4ab]/10 cursor-pointer disabled:opacity-50"
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUpdateProfileModal(false);
                  setProfileError("");
                  setProfileSuccess("");
                }}
                className="flex-1 border border-white/10 hover:border-white/20 text-[#e8bcb7] py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: RESET PASSWORD */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300 ${
          showResetPasswordModal ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`glass-card rounded-2xl w-full max-w-md p-6 sm:p-8 transform transition-transform duration-300 border border-white/10 ${
            showResetPasswordModal ? "scale-100" : "scale-95"
          }`}
          style={{
            background: "rgba(18, 18, 18, 0.95)",
            boxShadow: "0 0 30px rgba(255, 74, 74, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 74, 74, 0.3)",
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-orbitron font-extrabold text-xl sm:text-2xl text-[#ffb4ab] uppercase tracking-tight">
              Reset Password
            </h3>
            <button
              onClick={() => {
                setShowResetPasswordModal(false);
                setPasswordError("");
                setPasswordSuccess("");
              }}
              className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer"
            >
              close
            </button>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            {passwordError && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-200 px-3 py-2 rounded text-xs">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 px-3 py-2 rounded text-xs">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-jetbrains text-[10px] tracking-[0.15em] text-[#e8bcb7]/70 uppercase">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab] focus:outline-none transition-all placeholder:text-[#e8bcb7]/20"
                placeholder="••••••••••••"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-jetbrains text-[10px] tracking-[0.15em] text-[#e8bcb7]/70 uppercase">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab] focus:outline-none transition-all placeholder:text-[#e8bcb7]/20"
                placeholder="Create new password"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-jetbrains text-[10px] tracking-[0.15em] text-[#e8bcb7]/70 uppercase">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab] focus:outline-none transition-all placeholder:text-[#e8bcb7]/20"
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-[#ffb4ab] hover:bg-[#ffb4ab]/90 text-[#410002] py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#ffb4ab]/10 cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                className="w-full text-[#e8bcb7] py-2 text-xs font-bold hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: ADD NEW ADMIN */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300 ${
          showAddAdminModal ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`glass-card rounded-2xl w-full max-w-lg p-6 sm:p-8 transform transition-transform duration-300 border border-white/10 ${
            showAddAdminModal ? "scale-100" : "scale-95"
          }`}
          style={{
            background: "rgba(18, 18, 18, 0.95)",
            boxShadow: "0 0 30px rgba(255, 74, 74, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 74, 74, 0.3)",
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-orbitron font-extrabold text-xl sm:text-2xl text-[#ffb4ab] uppercase tracking-tight">
              Add New Admin
            </h3>
            <button
              onClick={() => {
                setShowAddAdminModal(false);
              }}
              className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer"
            >
              close
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-1">
            <RegisterForm role="admin" onSuccess={handleAddAdminSuccess} />
          </div>
        </div>
      </div>
      {/* MODAL: EDIT ADMIN */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300 ${
          adminToEdit ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`glass-card rounded-2xl w-full max-w-lg p-6 sm:p-8 transform transition-transform duration-300 border border-white/10 ${
            adminToEdit ? "scale-100" : "scale-95"
          }`}
          style={{
            background: "rgba(18, 18, 18, 0.95)",
            boxShadow: "0 0 30px rgba(255, 74, 74, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 74, 74, 0.3)",
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-orbitron font-extrabold text-xl sm:text-2xl text-[#ffb4ab] uppercase tracking-tight">
              Edit Admin
            </h3>
            <button
              onClick={() => {
                setAdminToEdit(null);
              }}
              className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer"
            >
              close
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-1">
            {adminToEdit && (
              <RegisterForm
                role="admin"
                mode="edit"
                adminId={adminToEdit.id}
                initialData={{
                  username: adminToEdit.username,
                  playerId: adminToEdit.player_id,
                  email: adminToEdit.email,
                  phone: adminToEdit.phone || "",
                  whatsapp: adminToEdit.whatsapp || "",
                  role: adminToEdit.role,
                }}
                onSuccess={handleEditAdminSuccess}
              />
            )}
          </div>
        </div>
      </div>

      {/* MODAL: DELETE ADMIN */}
      <div
        className={`fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300 ${
          adminToDelete ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`glass-card rounded-2xl w-full max-w-md p-6 sm:p-8 transform transition-transform duration-300 border border-white/10 ${
            adminToDelete ? "scale-100" : "scale-95"
          }`}
          style={{
            background: "rgba(18, 18, 18, 0.95)",
            boxShadow: "0 0 30px rgba(255, 74, 74, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 74, 74, 0.3)",
          }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/30">
              <span className="material-symbols-outlined text-3xl text-red-400">
                warning
              </span>
            </div>
            <h3 className="font-orbitron font-extrabold text-xl text-[#ffb4ab] uppercase tracking-tight mb-2">
              Remove Administrator?
            </h3>
            <p className="font-sora text-sm text-[#e8bcb7]">
              Are you sure you want to remove <strong className="text-white">{adminToDelete?.name}</strong> from the administrative team? This action cannot be undone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDeleteAdmin}
              className="flex-1 bg-red-900/80 hover:bg-red-800 text-red-100 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border border-red-500/30 shadow-[0_0_15px_rgba(255,0,0,0.2)]"
            >
              Confirm Remove
            </button>
            <button
              onClick={() => setAdminToDelete(null)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-[#e8bcb7] py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border border-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
