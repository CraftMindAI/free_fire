"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RoomData } from "./ActiveRooms";

interface RoomControlProps {
  rooms: RoomData[];
  userId?: string;
  onPublish: (roomId: string) => Promise<void>;
  onDelete: (roomId: string) => Promise<void>;
}

export default function RoomControl({ rooms, userId, onPublish, onDelete }: RoomControlProps) {
  const router = useRouter();
  // Local state for tracking success feedback ping animation for each room
  const [feedbackRoomIds, setFeedbackRoomIds] = useState<string[]>([]);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  // Get draft rooms only
  const controlRooms = rooms.filter((r) => r.status.toLowerCase() === "draft");

  const handlePublishClick = async (roomId: string) => {
    if (processingIds.includes(roomId)) return;
    setProcessingIds((prev) => [...prev, roomId]);
    try {
      await onPublish(roomId);

      // Trigger temporary ping feedback animation
      setFeedbackRoomIds((prev) => [...prev, roomId]);
      setTimeout(() => {
        setFeedbackRoomIds((prev) => prev.filter((id) => id !== roomId));
      }, 1000);
    } catch (err) {
      console.error("Failed to publish:", err);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== roomId));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-sora text-xl font-bold text-[#e5e2e1] flex items-center gap-3">
        <span className="w-2 h-8 bg-[#ffb4ab] rounded-full"></span>
        Room Control
      </h2>
      <div className="space-y-4">
        {controlRooms.map((room) => {
          const isLive = room.isPublished || room.status === "LIVE" ;
          const isFeedbackActive = feedbackRoomIds.includes(room.roomId);
          const isProcessing = processingIds.includes(room.roomId);

          return (
            <div
              key={room.roomId}
              className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-5 rounded-xl flex flex-col gap-4 relative overflow-hidden group hover:border-[#ffb4ab]/50 transition-all duration-300"
            >
              {/* Floating icon watermark */}
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px]">
                  {room.icon || "settings_accessibility"}
                </span>
              </div>

              {/* Card Header */}
              <div className="flex justify-between items-start z-10">
                <div>
                  <h4 className="font-bold text-lg text-on-surface font-sora">
                    {room.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant font-sora">
                    Tier: {room.tier} • Map: {room.map}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-jetbrains uppercase border ${
                    isLive
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-[#353534]/80 text-on-surface-variant border-white/5"
                  }`}
                >
                  {isLive ? "LIVE" : "DRAFT"}
                </span>
              </div>

              {/* Action Buttons Row */}
              {!isLive && (
                <div className="flex gap-2 mt-2 z-10">
                  <button
                    onClick={() => router.push(`/profile/v2/${userId}/matches`)}
                    className="flex-1 bg-[#353534] py-2 rounded text-xs font-bold hover:bg-[#5e3f3b]/30 text-on-surface transition-colors flex items-center justify-center gap-1 font-sora"
                  >
                    <span className="material-symbols-outlined text-sm">
                      visibility
                    </span>{" "}
                    VIEW
                  </button>
                </div>
              )}

              {/* Publish CTA Button */}
              <button
                onClick={() => handlePublishClick(room.roomId)}
                disabled={isLive || isProcessing}
                className={`w-full py-3 rounded-lg font-bold font-orbitron text-xs tracking-widest transition-all z-10 ${
                  isLive
                    ? "published-btn cursor-not-allowed"
                    : "bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#ffb4ab] hover:text-[#690005] active:scale-95"
                }`}
              >
                {isProcessing
                  ? "PUBLISHING..."
                  : isLive
                  ? "PUBLISHED & LOCKED"
                  : "PUBLISH TO ARENA"}
              </button>

              {/* Success Ping animation feedback */}
              {isFeedbackActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 pointer-events-none animate-ping"></div>
              )}
            </div>
          );
        })}
        {controlRooms.length === 0 && (
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 rounded-xl text-center flex flex-col items-center gap-4">
            <p className="text-on-surface-variant font-sora text-sm">
              No draft matches found.
            </p>
            <button
              onClick={() => router.push(`/profile/v2/${userId}/matches`)}
              className="bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#ffb4ab] hover:text-[#690005] active:scale-95 px-5 py-3 rounded-lg font-bold font-orbitron text-xs tracking-widest transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              CREATE ROOM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
