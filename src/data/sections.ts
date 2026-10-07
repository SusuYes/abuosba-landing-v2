// Each section's Arabic name, spelled in Musnad for its glass divider (reading order).
export const sections = {
  work: { letters: ["𐩲", "𐩣", "𐩡"], gloss: "ʿml · عمل · Work" },
  nightTalk: { letters: ["𐩩", "𐩱", "𐩣", "𐩡", "𐩩"], gloss: "tʾmlt · تأمّلات · Night Talk" },
  about: { letters: ["𐩲", "𐩬", "𐩺"], gloss: "ʿny · عني · About" },
} as const;

// Suhail (Canopus) as seen from Sana'a, 15.37° N.
export const suhailOverSanaa = [
  ["Rises, bearing", "145.6°"],
  ["Highest altitude", "21.9°"],
  ["Sets, bearing", "214.4°"],
  ["Magnitude", "−0.74"],
] as const;
