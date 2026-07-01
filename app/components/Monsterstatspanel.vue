<script setup>
// MonsterStatsPanel — DM right column
// Shows extra stat block info (saves, skills, resistances, actions, traits)
// for the selected combatant, sourced from Open5e and saved on the encounter
// entry at import time — never re-fetched during a session.

const props = defineProps({
    combatant: { type: Object, default: null },
})

const meta = computed(() => props.combatant?.meta ?? null)

const abilityOrder = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
const abilityShort = {
    strength: 'STR', dexterity: 'DEX', constitution: 'CON',
    intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA',
}

function modSign(n) {
    if (n === null || n === undefined) return '—'
    return n >= 0 ? `+${n}` : `${n}`
}

function speedString(speed) {
    if (!speed) return null
    const parts = []
    if (speed.walk) parts.push(`${speed.walk} ft.`)
    if (speed.fly) parts.push(`fly ${speed.fly} ft.`)
    if (speed.swim) parts.push(`swim ${speed.swim} ft.`)
    if (speed.climb) parts.push(`climb ${speed.climb} ft.`)
    if (speed.burrow) parts.push(`burrow ${speed.burrow} ft.`)
    return parts.join(', ')
}

const resistanceLines = computed(() => {
    const r = meta.value?.resistances
    if (!r) return []
    const lines = []
    if (r.damage_resistances_display) lines.push({ label: 'Resist', text: r.damage_resistances_display })
    if (r.damage_immunities_display) lines.push({ label: 'Immune', text: r.damage_immunities_display })
    if (r.damage_vulnerabilities_display) lines.push({ label: 'Vulnerable', text: r.damage_vulnerabilities_display })
    if (r.condition_immunities_display) lines.push({ label: 'Cond. Immune', text: r.condition_immunities_display })
    return lines
})

console.log('MonsterStatsPanel', meta.value, resistanceLines.value)
</script>

<template>
    <div class="stats-panel">

        <div class="stats-panel__header">
            <span class="col-title">Stat Block</span>
            <span v-if="combatant" class="stats-panel__target">{{ combatant.name }}</span>
        </div>

        <!-- No combatant selected -->
        <div v-if="!combatant" class="stats-panel__empty">
            Select a combatant
        </div>

        <!-- Combatant has no Open5e meta — manually created or PC -->
        <div v-else-if="!meta" class="stats-panel__empty">
            No extended stat block available.<br />
            <span class="stats-panel__empty-sub">
                Import from Open5e on the Characters page to see actions and traits here.
            </span>
        </div>

        <!-- Full stat block -->
        <div v-else class="stats-panel__body">

            <!-- Basic info -->
            <div class="sp-section">
                <div class="sp-line" v-if="meta.creatureType">
                    {{ meta.size }} {{ meta.creatureType }} · CR {{ meta.challengeRating }}
                </div>
                <div class="sp-line" v-if="meta.hitDice">
                    Hit Dice: <span>{{ meta.hitDice }}</span>
                </div>
                <div class="sp-line" v-if="speedString(meta.speed)">
                    Speed: <span>{{ speedString(meta.speed) }}</span>
                </div>
                <div class="sp-line" v-if="meta.passivePerception">
                    Passive Perception: <span>{{ meta.passivePerception }}</span>
                </div>
            </div>

            <!-- Ability scores -->
            <div v-if="meta.abilityScores" class="ability-grid">
                <div v-for="key in abilityOrder" :key="key" class="ability-chip">
                    <span class="ability-chip__label">{{ abilityShort[key] }}</span>
                    <span class="ability-chip__val">{{ meta.abilityScores[key] }}</span>
                    <span class="ability-chip__mod">{{ modSign(meta.modifiers?.[key]) }}</span>
                </div>
            </div>

            <!-- Resistances / immunities -->
            <div v-if="resistanceLines.length" class="sp-section">
                <div v-for="r in resistanceLines" :key="r.label" class="sp-line">
                    {{ r.label }}: <span>{{ r.text }}</span>
                </div>
            </div>

            <!-- Traits -->
            <div v-if="meta.traits?.length" class="sp-block">
                <div class="sp-block__title">Traits</div>
                <div v-for="t in meta.traits" :key="t.name" class="sp-entry">
                    <span class="sp-entry__name">{{ t.name }}.</span>
                    <span class="sp-entry__desc">{{ t.desc }}</span>
                </div>
            </div>

            <!-- Actions -->
            <div v-if="meta.actions?.length" class="sp-block">
                <div class="sp-block__title">Actions</div>
                <div v-for="a in meta.actions" :key="a.name" class="sp-entry">
                    <span class="sp-entry__name">{{ a.name }}.</span>
                    <span class="sp-entry__desc">{{ a.desc }}</span>
                </div>
            </div>

            <!-- Bonus actions -->
            <div v-if="meta.bonusActions?.length" class="sp-block">
                <div class="sp-block__title">Bonus Actions</div>
                <div v-for="a in meta.bonusActions" :key="a.name" class="sp-entry">
                    <span class="sp-entry__name">{{ a.name }}.</span>
                    <span class="sp-entry__desc">{{ a.desc }}</span>
                </div>
            </div>

            <!-- Reactions -->
            <div v-if="meta.reactions?.length" class="sp-block">
                <div class="sp-block__title">Reactions</div>
                <div v-for="a in meta.reactions" :key="a.name" class="sp-entry">
                    <span class="sp-entry__name">{{ a.name }}.</span>
                    <span class="sp-entry__desc">{{ a.desc }}</span>
                </div>
            </div>

            <!-- Legendary actions -->
            <div v-if="meta.legendaryActions?.length" class="sp-block">
                <div class="sp-block__title">Legendary Actions</div>
                <div v-for="a in meta.legendaryActions" :key="a.name" class="sp-entry">
                    <span class="sp-entry__name">{{ a.name }}.</span>
                    <span class="sp-entry__desc">{{ a.desc }}</span>
                </div>
            </div>

        </div>

    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';

.stats-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.stats-panel__header {
    padding: 10px 14px 8px;
    border-bottom: 1px solid $monument-mid;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.col-title {
    font-size: 9px;
    letter-spacing: 0.2em;
    color: $text-dim;
    text-transform: uppercase;
}

.stats-panel__target {
    font-family: $font-display;
    font-size: 11px;
    color: $burnt-light;
    letter-spacing: 0.05em;
}

.stats-panel__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
    font-size: 11px;
    color: $text-dim;
    line-height: 1.6;
}

.stats-panel__empty-sub {
    font-size: 10px;
    color: $text-dim;
    opacity: 0.7;
    margin-top: 4px;
    display: block;
}

.stats-panel__body {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.sp-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.sp-line {
    font-size: 11px;
    color: $text-mid;
    line-height: 1.5;

    span {
        color: $text-bright;
    }
}

// Ability score grid
.ability-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
}

.ability-chip {
    background: $monument-dark;
    border: 1px solid $monument-mid;
    border-radius: 3px;
    padding: 6px 4px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1px;

    &__label {
        font-size: 8px;
        letter-spacing: 0.1em;
        color: $text-dim;
    }

    &__val {
        font-family: $font-display;
        font-size: 13px;
        font-weight: 700;
        color: $text-bright;
    }

    &__mod {
        font-size: 9px;
        color: $burnt-light;
    }
}

// Action/trait blocks
.sp-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.sp-block__title {
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: $burnt-light;
    padding-bottom: 4px;
    border-bottom: 1px solid $monument-mid;
}

.sp-entry {
    font-size: 11px;
    line-height: 1.5;
    color: $text-mid;
}

.sp-entry__name {
    font-weight: 700;
    color: $text-bright;
    font-style: italic;
    margin-right: 4px;
}

.sp-entry__desc {
    color: $text-mid;
}
</style>