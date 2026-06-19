export interface User {
  id: number;
  name: string;
  email: string;
  /** SHA-256 hex of the password (demo only) */
  passwordHash: string;
  role: "player" | "admin";
}

// Passwords: demo1234 → hash below (SHA-256)
const users: User[] = [
  {
    id: 1,
    name: "Commander Vex",
    email: "commander@titan.io",
    passwordHash: "0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d",
    role: "admin",
  },
  {
    id: 2,
    name: "Ghost Rider",
    email: "ghost@titan.io",
    passwordHash: "0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d",
    role: "player",
  },
];

export default users;
