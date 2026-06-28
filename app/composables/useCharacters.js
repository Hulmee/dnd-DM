import { reactive, computed } from "vue";

// ── BroadcastChannel ──────────────────────────────────────────────────────────
const channel =
  typeof window !== "undefined" ? new BroadcastChannel("dnd-tracker") : null;

// Helper to save data to localStorage and sync tabs
function saveAndBroadcast() {
  if (typeof window !== "undefined") {
    localStorage.setItem("dnd_characters", JSON.stringify(characters));
    localStorage.setItem("dnd_encounter", JSON.stringify(_encounter));
  }

  channel?.postMessage({
    characters: JSON.parse(JSON.stringify(characters)),
    encounter: JSON.parse(JSON.stringify(_encounter)),
  });
}

// ── Load Initial State from localStorage ──────────────────────────────────────
const savedCharacters =
  typeof window !== "undefined" ? localStorage.getItem("dnd_characters") : null;
const savedEncounter =
  typeof window !== "undefined" ? localStorage.getItem("dnd_encounter") : null;

// Default initial data if localStorage is empty
const defaultCharacters = {
  "Giant Wolf Spider": { ac: 13, healthMax: 11, type: "NPC" },
  "Elric Silvyr": { ac: 15, healthMax: 45, type: "NPC" },
  "Ash Zombie": { ac: 8, healthMax: 22, type: "NPC" },
  Spider: { ac: 12, healthMax: 1, type: "NPC" },
};

// ── Character store ───────────────────────────────────────────────────────────
const characters = reactive(
  savedCharacters ? JSON.parse(savedCharacters) : defaultCharacters,
);

function endCombat() {
  // Clear encounter
  _encounter.splice(0, _encounter.length);
  saveAndBroadcast(); // Updated
}
// ── Encounter (internal) ──────────────────────────────────────────────────────
const _encounter = reactive(savedEncounter ? JSON.parse(savedEncounter) : []);

// Determine nextUid dynamically based on loaded data
const maxUid = _encounter.reduce((m, e) => Math.max(m, e.uid), 0);
let nextUid = maxUid ? maxUid + 1 : 5;

// ── Listen for updates from other tabs ───────────────────────────────────────
if (channel) {
  channel.onmessage = ({ data }) => {
    // Replace characters
    Object.keys(characters).forEach((k) => delete characters[k]);
    Object.assign(characters, data.characters);

    // Replace _encounter in place
    _encounter.splice(0, _encounter.length, ...data.encounter);

    // Keep nextUid ahead of any uid in the received data
    const maxUid = data.encounter.reduce((m, e) => Math.max(m, e.uid), 0);
    if (maxUid >= nextUid) nextUid = maxUid + 1;

    // Save the cross-tab updates locally as well
    if (typeof window !== "undefined") {
      localStorage.setItem("dnd_characters", JSON.stringify(data.characters));
      localStorage.setItem("dnd_encounter", JSON.stringify(data.encounter));
    }
  };
}

// ── Derived ───────────────────────────────────────────────────────────────────
const encounter = computed(() =>
  [..._encounter].sort((a, b) => b.initiative - a.initiative),
);

const availableCharacters = computed(() =>
  Object.entries(characters).filter(([name, c]) => {
    if (c.type === "NPC") return true;
    return !_encounter.some((e) => e.name === name);
  }),
);

// ── Actions ───────────────────────────────────────────────────────────────────
// NOTE: Change all instances of `broadcast()` to `saveAndBroadcast()` inside your functions below

function addToEncounter(name, initiative, tokenNum = null) {
  const char = characters[name];
  if (!char) return;
  _encounter.push({
    uid: nextUid++,
    name,
    type: char.type,
    ac: char.ac,
    healthMax: char.healthMax,
    healthCur: char.healthMax,
    initiative,
    conditions: [],
    active: false,
    tokenNum,
  });
  saveAndBroadcast(); // Updated
}

function removeFromEncounter(uid) {
  const idx = _encounter.findIndex((e) => e.uid === uid);
  if (idx !== -1) _encounter.splice(idx, 1);
  saveAndBroadcast(); // Updated
}

function createCharacter(name, { type, ac, healthMax }) {
  if (characters[name]) return;
  characters[name] = { type, ac, healthMax };
  saveAndBroadcast(); // Updated
}

function nextTurn() {
  const sorted = [..._encounter].sort((a, b) => b.initiative - a.initiative);
  const currentIdx = sorted.findIndex((c) => c.active);

  _encounter.forEach((c) => {
    c.active = false;
  });

  const nextIdx = (currentIdx + 1) % sorted.length;
  const nextUid_ = sorted[nextIdx]?.uid;

  const next = _encounter.find((e) => e.uid === nextUid_);
  if (next) next.active = true;

  saveAndBroadcast(); // Updated
}

// ── Composable ────────────────────────────────────────────────────────────────
export function useCharacters() {
  return {
    characters,
    encounter,
    availableCharacters,
    addToEncounter,
    removeFromEncounter,
    createCharacter,
    nextTurn,
    endCombat,
  };
}
