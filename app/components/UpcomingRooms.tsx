import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import { jwtVerify } from "jose";
import { encryptId } from "@/app/lib/encryption";

type RoomType = "SOLO" | "DUO" | "SQUAD" | "CUSTOM";

const TYPE_STYLES: Record<RoomType, { badgeBg: string; badgeText: string }> = {
  SOLO:   { badgeBg: "bg-crimson",   badgeText: "text-white" },
  DUO:    { badgeBg: "bg-secondary", badgeText: "text-[#462a00]" },
  SQUAD:  { badgeBg: "bg-tertiary",  badgeText: "text-[#4c3f00]" },
  CUSTOM: { badgeBg: "bg-white/20",  badgeText: "text-white" },
};

function deriveType(matchType: string | null, maxPlayers: number): RoomType {
  const t = (matchType ?? "").toLowerCase();
  if (t === "solo"  || maxPlayers === 48) return "SOLO";
  if (t === "duo"   || maxPlayers === 24) return "DUO";
  if (t === "squad" || maxPlayers === 12) return "SQUAD";
  return "CUSTOM";
}

async function getUpcomingRooms() {
  const now = new Date();

  await prisma.room.updateMany({
    where: { endTime: { lt: now }, status: { not: "closed" } },
    data: { status: "closed" },
  });

  const activeRooms = await prisma.room.findMany({
    where: { status: "active" },
    orderBy: { startTime: "asc" },
  });

  const closedRooms = await prisma.room.findMany({
    where: { status: "closed" },
    orderBy: { startTime: "desc" },
    take: 6,
  });

  return [...activeRooms, ...closedRooms];
}

function RoomCard({ room, href }: { room: Awaited<ReturnType<typeof getUpcomingRooms>>[number], href: string }) {
  const type = deriveType(room.match_type, room.maxPlayers);
  const { badgeBg, badgeText } = TYPE_STYLES[type];
  const isClosed = room.status === "closed";

  return (
    <div className="glass rounded-2xl overflow-hidden group
                    [transform-style:preserve-3d] transition-transform duration-150
                    hover:[transform:perspective(800px)_rotateX(2deg)_translateZ(8px)]">

      {/* Map panel */}
      <div className="relative h-56 overflow-hidden bg-black">
        {room.map_img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.map_img}
            alt={room.roomName}
            className="w-full h-full object-cover object-top brightness-90
                       group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <span className="material-symbols-outlined text-5xl text-white/20">map</span>
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#131313] to-transparent" />
        <span className={`absolute top-4 left-4 px-4 py-1.5 rounded-full
                           text-xs font-black tracking-widest uppercase font-orbitron
                           shadow-lg ${badgeBg} ${badgeText}`}>
          {type}
        </span>
      </div>

      {/* Card body */}
      <div className="p-6">
        <h4 className="font-sora text-2xl text-on-surface font-bold mb-4">{room.roomName}</h4>

        <div className="flex justify-between items-center mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase mb-1">
              Prize Pool
            </p>
            <p className="text-xl font-bold font-sora text-secondary">
              {room.total_price ? `₹${room.total_price}` : "Free"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase mb-1">
              Entry Fee
            </p>
            <p className="text-xl font-bold font-sora text-on-surface">
              {room.entry_fee ? `₹${room.entry_fee}` : "Free"}
            </p>
          </div>
        </div>

        <Link href={href} className="w-full py-4 rounded-xl font-orbitron font-bold uppercase tracking-wider
                            border-2 border-crimson text-crimson block text-center
                            hover:bg-crimson hover:text-white hover:shadow-[0_0_20px_rgba(255,46,46,0.4)]
                            active:scale-95 transition-all duration-200">
          {isClosed ? "View Room" : "Join Room"}
        </Link>
      </div>
    </div>
  );
}

export default async function UpcomingRooms() {
  const rooms = await getUpcomingRooms();
  const cookieStore = await cookies();
  const token = cookieStore.get("titan_token")?.value;
  let targetHref = "/v1/auth/login";

  if (token) {
    try {
      const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "titan-arena-fallback-secret");
      const { payload } = await jwtVerify(token, SECRET);
      const role = payload.role as string;
      const userId = payload.sub as string;
      
      const encryptedId = encryptId(userId);
      
      if (role === "admin") {
        targetHref = `/profile/v2/dashboard/${encryptedId}/home`;
      } else {
        targetHref = `/profile/v1/${encryptedId}/dashboard/home`;
      }
    } catch (e) {
      targetHref = "/v1/auth/login";
    }
  }

  // Create an array with 10 copies of rooms to ensure a smooth infinite marquee
  const duplicatedRooms = Array(10).fill(rooms).flat();

  return (
    <section className="py-12 max-w-[1440px] mx-auto overflow-hidden">

      <div className="flex justify-between items-end mb-12 px-6">
        <div>
          <h2 className="font-orbitron text-3xl md:text-4xl text-on-surface font-bold tracking-tight mb-2">
            Upcoming Rooms
          </h2>
          <p className="font-sora text-on-surface-variant text-sm md:text-base">
            Join the next available battlegrounds and claim your glory.
          </p>
        </div>
        <Link href={targetHref} className="text-crimson text-xs font-bold tracking-widest uppercase hover:underline">
          View All Rooms
        </Link>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl mx-6">
          <span className="material-symbols-outlined text-4xl text-white/20 block mb-3">event_busy</span>
          <p className="font-sora text-on-surface-variant">No active rooms right now. Check back soon.</p>
        </div>
      ) : (
        <div className="relative w-full [perspective:1200px] flex">
          <div className="flex gap-8 w-max animate-marquee hover:[animation-play-state:paused] pr-8 ml-6">
            {duplicatedRooms.map((room, idx) => (
              <div key={`${room.id}-${idx}`} className="w-[320px] md:w-[380px] shrink-0">
                <RoomCard room={room} href={targetHref} />
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}
