"use client";

import React from "react";

export interface RoomData {
  roomId: string;
  name: string;
  map: string;
  matchTime: string;
  playersCount: number;
  maxPlayers: number;
  status: string;
  isPublished: boolean;
  tier: string;
  icon?: string;
  matchType?: string;
  entryFee?: number;
  prizePool?: number;
  matchDate?: string;
}

interface ActiveRoomsProps {
  rooms: RoomData[];
}

export default function ActiveRooms({ rooms }: ActiveRoomsProps) {
  // Filter rooms that are published
  const activeRooms = rooms.filter((r) => r.isPublished);

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "WAITING":
        return "bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/20";
      case "PENDING":
        return "bg-[#353534]/50 text-on-surface-variant border-white/10";
      case "FULL":
        return "bg-[#e9c400]/10 text-[#e9c400] border-[#e9c400]/20";
      case "LIVE":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      default:
        return "bg-white/5 text-on-surface border-white/10";
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "FULL":
        return "bg-[#e9c400] shadow-[0_0_8px_#e9c400]";
      case "LIVE":
        return "bg-green-400 shadow-[0_0_8px_#4ade80]";
      default:
        return "bg-[#ff544a] shadow-[0_0_8px_#ff2e2e]";
    }
  };

  return (
    <div className="xl:col-span-2 glass-card rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#1c1b1b]/50">
        <h2 className="font-orbitron text-headline-md text-on-surface">
          ACTIVE ROOMS
        </h2>
        <button className="text-[#ffb4ab] text-sm font-jetbrains hover:underline uppercase tracking-wider">
          VIEW ALL
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#2a2a2a]/50 text-on-surface-variant text-[10px] font-jetbrains uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Room ID</th>
              <th className="px-6 py-3">Match Time</th>
              <th className="px-6 py-3">Map</th>
              <th className="px-6 py-3">Players</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {activeRooms.map((room) => {
              const occupancyPercent = Math.min(
                100,
                Math.round((room.playersCount / room.maxPlayers) * 100)
              );
              return (
                <tr
                  key={room.roomId}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4 font-jetbrains text-[#ffb4ab]">
                    {room.roomId}
                  </td>
                  <td className="px-6 py-4 text-sm font-sora">
                    {room.matchTime}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold font-sora">
                    {room.map}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressBarColor(
                            room.status
                          )}`}
                          style={{ width: `${occupancyPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-sora">
                        {room.playersCount}/{room.maxPlayers}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-jetbrains uppercase border ${getStatusStyle(
                        room.status
                      )}`}
                    >
                      {room.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {activeRooms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant text-sm font-sora">
                  No active rooms found. Publish rooms from the control panel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
