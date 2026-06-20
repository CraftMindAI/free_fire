import { NextRequest, NextResponse } from "next/server";
import { getDb1, getDb2 } from "@/app/lib/mongodb";

const SEED_ROOMS = [
  {
    roomId: "#RT-0982",
    name: "Cyber-Grid 9",
    map: "Cyber-Grid 9",
    matchType: "Battle Royale (Squad)",
    entryFee: 50,
    prizePool: 5000,
    playersCount: 100,
    maxPlayers: 100,
    matchDate: "Oct 24, 2023",
    matchTime: "18:00 UTC",
    status: "Published",
    isPublished: true,
    tier: "Legendary",
    icon: "sports_esports",
    createdAt: new Date(),
  },
  {
    roomId: "#RT-1004",
    name: "Neon Canyon Duel",
    map: "Neon Canyon",
    matchType: "1v1 Duel",
    entryFee: 10,
    prizePool: 200,
    playersCount: 0,
    maxPlayers: 2,
    matchDate: "Oct 26, 2023",
    matchTime: "21:30 UTC",
    status: "DRAFT",
    isPublished: false,
    tier: "Elite",
    icon: "security",
    createdAt: new Date(),
  },
  {
    roomId: "#RT-1102",
    name: "Dust 2.5 Core",
    map: "Dust 2.5",
    matchType: "Capture the Core",
    entryFee: 25,
    prizePool: 1200,
    playersCount: 0,
    maxPlayers: 10,
    matchDate: "Oct 27, 2023",
    matchTime: "04:00 UTC",
    status: "DRAFT",
    isPublished: false,
    tier: "Elite",
    icon: "settings_accessibility",
    createdAt: new Date(),
  },
];

async function getRoomsCollection() {
  try {
    const db2 = await getDb2();
    return db2.collection("rooms");
  } catch {
    const db1 = await getDb1();
    return db1.collection("rooms");
  }
}

export async function GET() {
  try {
    const roomsColl = await getRoomsCollection();
    let rooms = await roomsColl.find({}).toArray();

    if (rooms.length === 0) {
      console.log("Seeding rooms collection in database...");
      await roomsColl.insertMany(SEED_ROOMS);
      rooms = await roomsColl.find({}).toArray();
    }

    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error("Failed to get rooms:", error);
    return NextResponse.json(
      { error: "Database operation failed." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const roomsColl = await getRoomsCollection();

    if (action === "create") {
      const { map, matchType, entryFee, prizePool, maxPlayers, matchDate, matchTime } = body;

      if (!map || !matchType || !maxPlayers) {
        return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
      }

      // Generate a dynamic room ID
      const randomId = Math.floor(Math.random() * 9000) + 1000;
      const roomId = `#RT-${randomId}`;

      const newRoom = {
        roomId,
        name: map,
        map,
        matchType,
        entryFee: Number(entryFee || 0),
        prizePool: Number(prizePool || 0),
        playersCount: 0,
        maxPlayers: Number(maxPlayers),
        matchDate: matchDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        matchTime: matchTime ? `${matchTime} UTC` : "12:00 UTC",
        status: "DRAFT",
        isPublished: false,
        tier: Number(entryFee || 0) >= 50 ? "Legendary" : "Elite",
        icon: "sports_esports",
        createdAt: new Date(),
      };

      await roomsColl.insertOne(newRoom);
      return NextResponse.json({ success: true, room: newRoom });
    }

    const { roomId } = body;
    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    if (action === "publish") {
      const result = await roomsColl.updateOne(
        { roomId },
        {
          $set: {
            status: "Published",
            isPublished: true,
          },
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Room published successfully" });
    } else if (action === "edit") {
      const { map, matchType, entryFee, prizePool, maxPlayers, matchDate, matchTime } = body;
      
      const updateData: any = {};
      if (map) updateData.map = map;
      if (matchType) updateData.matchType = matchType;
      if (entryFee !== undefined) updateData.entryFee = Number(entryFee);
      if (prizePool !== undefined) updateData.prizePool = Number(prizePool);
      if (maxPlayers !== undefined) updateData.maxPlayers = Number(maxPlayers);
      if (matchDate) updateData.matchDate = matchDate;
      if (matchTime) updateData.matchTime = matchTime;

      const result = await roomsColl.updateOne(
        { roomId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Room edited successfully" });
    } else if (action === "delete") {
      const result = await roomsColl.deleteOne({ roomId });
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Room deleted successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update room:", error);
    return NextResponse.json(
      { error: "Database operation failed." },
      { status: 500 }
    );
  }
}
