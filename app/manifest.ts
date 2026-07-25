import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Titan Arena Gaming",
    short_name: "Titan Arena",
    description:
      "Join Daily Free Fire Custom Rooms, Win Cash Rewards, and Compete with Top Squads",
    start_url: "/",
    display: "standalone",
    background_color: "#131313",
    theme_color: "#ff3b30",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
