"use client";

import rooms from "../data/rooms";

function RoomCard({ room }: { room: (typeof rooms)[number] }) {
  return (
    <div className="glass rounded-2xl overflow-hidden group
                    [transform-style:preserve-3d] transition-transform duration-150
                    hover:[transform:perspective(800px)_rotateX(2deg)_translateZ(8px)]">

      {/* Map panel */}
      <div className="relative h-56 overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={room.image}
          alt={room.mapLabel}
          className="w-full h-full object-cover object-center brightness-90
                     group-hover:scale-105 transition-transform duration-700"
        />
        {/* Bottom gradient into card body */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#131313] to-transparent" />
        {/* Badge */}
        <span className={`absolute top-4 left-4 px-4 py-1.5 rounded-full
                           text-xs font-black tracking-widest uppercase font-orbitron
                           shadow-lg ${room.badgeBg} ${room.badgeText}`}>
          {room.type}
        </span>
      </div>

      {/* Card body */}
      <div className="p-6">
        <h4 className="font-sora text-2xl text-on-surface font-bold mb-4">{room.name}</h4>

        {/* Prize / Fee row */}
        <div className="flex justify-between items-center mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase mb-1">
              Prize Pool
            </p>
            <p className={`text-xl font-bold font-sora ${room.prizeColor}`}>{room.prizePool}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase mb-1">
              Entry Fee
            </p>
            <p className="text-xl font-bold font-sora text-on-surface">{room.entryFee}</p>
          </div>
        </div>

        <button className="w-full py-4 rounded-xl font-orbitron font-bold uppercase tracking-wider
                            border-2 border-crimson text-crimson
                            hover:bg-crimson hover:text-white hover:shadow-[0_0_20px_rgba(255,46,46,0.4)]
                            active:scale-95 transition-all duration-200">
          Join Room
        </button>
      </div>
    </div>
  );
}

export default function UpcomingRooms() {
  return (
    <section className="py-12 px-6 max-w-[1440px] mx-auto">

      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="font-orbitron text-3xl md:text-4xl text-on-surface font-bold tracking-tight mb-2">
            Upcoming Rooms
          </h2>
          <p className="font-sora text-on-surface-variant text-sm md:text-base">
            Join the next available battlegrounds and claim your glory.
          </p>
        </div>
        <button className="text-crimson text-xs font-bold tracking-widest uppercase hover:underline">
          View All Rooms
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 [perspective:1200px]">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

    </section>
  );
}
