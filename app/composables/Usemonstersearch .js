import { ref } from "vue";

// ── Open5e API ────────────────────────────────────────────────────────────────
// Hosted, free, no API key required.
// We pin to the 2024 SRD so results are consistent with the rules you're running.
// https://open5e.com/api-docs

const API_BASE = "https://api.open5e.com/v2/creatures/";
const DOCUMENT_KEY = "srd-2024";

// Fields we actually need — keeps payloads small.
const FIELDS = [
  "key",
  "name",
  "type",
  "size",
  "challenge_rating",
  "armor_class",
  "armor_detail",
  "hit_points",
  "hit_dice",
  "speed_all",
  "ability_scores",
  "modifiers",
  "saving_throws_all",
  "skill_bonuses_all",
  "passive_perception",
  "resistances_and_immunities",
  "actions",
  "traits",
  "document",
].join(",");

export function useMonsterSearch() {
  const results = ref([]);
  const loading = ref(false);
  const error = ref("");
  const hasSearched = ref(false);

  let debounceTimer = null;
  let currentController = null;

  async function search(query) {
    clearTimeout(debounceTimer);

    if (!query || query.trim().length < 2) {
      results.value = [];
      hasSearched.value = false;
      return;
    }

    debounceTimer = setTimeout(() => runSearch(query.trim()), 350);
  }

  async function runSearch(query) {
    // Cancel any in-flight request
    currentController?.abort();
    currentController = new AbortController();

    loading.value = true;
    error.value = "";

    const url =
      `${API_BASE}?name__icontains=${encodeURIComponent(query)}` +
      `&document__key__in=${DOCUMENT_KEY}` +
      `&fields=${FIELDS}` +
      `&limit=20`;

    try {
      const res = await fetch(url, { signal: currentController.signal });
      if (!res.ok) throw new Error(`Open5e API error: ${res.status}`);
      const data = await res.json();
      results.value = data.results ?? [];
      hasSearched.value = true;
    } catch (e) {
      if (e.name !== "AbortError") {
        error.value = "Could not reach Open5e. Check your connection.";
        results.value = [];
      }
    } finally {
      loading.value = false;
    }
  }

  function clear() {
    results.value = [];
    error.value = "";
    hasSearched.value = false;
  }

  // ── Normalise an Open5e creature into our character store shape ───────────
  // Stored once on import — never re-fetched after this point.
  function toCharacterStats(creature) {
    return {
      type: "NPC",
      ac: creature.armor_class,
      healthMax: creature.hit_points,
      source: "open5e",
      sourceKey: creature.key,
      ruleset: DOCUMENT_KEY,
      // Extra stat block data — shown in the DM stats panel
      meta: {
        size: creature.size?.name ?? null,
        creatureType: creature.type?.name ?? null,
        challengeRating: creature.challenge_rating,
        hitDice: creature.hit_dice,
        speed: creature.speed_all ?? null,
        abilityScores: creature.ability_scores ?? null,
        modifiers: creature.modifiers ?? null,
        savingThrows: creature.saving_throws_all ?? null,
        skills: creature.skill_bonuses_all ?? null,
        passivePerception: creature.passive_perception ?? null,
        resistances: creature.resistances_and_immunities ?? null,
        actions: (creature.actions ?? []).filter(
          (a) => a.action_type === "ACTION",
        ),
        bonusActions: (creature.actions ?? []).filter(
          (a) => a.action_type === "BONUS_ACTION",
        ),
        reactions: (creature.actions ?? []).filter(
          (a) => a.action_type === "REACTION",
        ),
        legendaryActions: (creature.actions ?? []).filter(
          (a) => a.action_type === "LEGENDARY_ACTION",
        ),
        traits: creature.traits ?? [],
      },
    };
  }

  return {
    results,
    loading,
    error,
    hasSearched,
    search,
    clear,
    toCharacterStats,
  };
}
