<script setup>
const { encounter, nextTurn, endCombat } = useCharacters()

// ── Selected combatant ────────────────────────────────────────
// Defaults to the active combatant; DM can tap any row to override.
const selectedUid = ref(null)

const selectedCombatant = computed(() =>
    encounter.value.find(c => c.uid === selectedUid.value) ?? null
)

// Keep selection on the active combatant when turn advances,
// unless the DM has manually selected someone else.
watch(encounter, (list) => {
    const active = list.find(c => c.active)
    if (!selectedUid.value && active) selectedUid.value = active.uid
}, { immediate: true })

function selectCombatant(uid) {
    selectedUid.value = uid
}

// ── Damage / Heal — logic added to useCharacters later ────────
function onDamage(uid, amount) {
    const c = encounter.value.find(e => e.uid === uid)
    if (c) c.healthCur = Math.max(0, c.healthCur - amount)
}

function onHeal(uid, amount) {
    const c = encounter.value.find(e => e.uid === uid)
    if (c) c.healthCur = Math.min(c.healthMax, c.healthCur + amount)
}

// ── Add modal ─────────────────────────────────────────────────
const showAddModal = ref(false)
</script>

<template>
    <div class="dm-screen">

        <header class="topbar">
            <div class="topbar__left">
                <span class="topbar__title">⚔ Initiative Tracker</span>
            </div>

            <div class="topbar__centre">
                <div class="topbar__stat">
                    <span class="topbar__stat-label">Active</span>
                    <span class="topbar__stat-value">
                        {{encounter.find(c => c.active)?.name ?? '—'}}
                    </span>
                </div>
            </div>

            <div class="topbar__right">
                <NuxtLink to="/characters" class="topbar__btn topbar__btn--data">⚙ Characters</NuxtLink>
                <button class="topbar__btn topbar__btn--add" @click="showAddModal = true">＋ Add</button>
                <button class="topbar__btn topbar__btn--next" @click="nextTurn">Next Turn ▶</button>
                <button class="topbar__btn topbar__btn--end" @click="endCombat">End Combat</button>
            </div>
        </header>

        <div class="body">

            <aside class="col col--init">
                <DMInitiativeList :data="encounter" :selected-uid="selectedUid" @select="selectCombatant" />
            </aside>

            <section class="col col--control">
                <div class="col__header">
                    <span class="col__header-label">Combatant</span>

                </div>
                <DMCombatantcontrol :combatant="selectedCombatant" @damage="onDamage" @heal="onHeal" />
            </section>

            <aside class="col col--conditions">
                <!-- <MonsterStatsPanel :combatant="selectedCombatant" /> -->
                <Monsterstatspanel :combatant="selectedCombatant" />
                <!-- <pre>{{ selectedCombatant }}</pre> -->
            </aside>

        </div>

        <Addcombatantmodal v-if="showAddModal" @close="showAddModal = false" />


    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';

.dm-screen {
    width: 100dvw;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: $monument-dark;
}

.topbar {
    height: 48px;
    flex-shrink: 0;
    background: $burnt;
    display: flex;
    align-items: center;
    padding: 0 16px;

    &__left {
        flex: 1;
        display: flex;
        align-items: center;
    }

    &__title {
        @include display(14px);
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    &__centre {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    &__stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
    }

    &__stat-label {
        @include eyebrow(7px);
        color: rgba(255, 255, 255, 0.5);
    }

    &__stat-value {
        font-family: $font-display;
        font-size: 16px;
        font-weight: 700;
        color: $text-bright;
        line-height: 1;
        letter-spacing: 0.04em;
    }

    &__right {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
    }

    &__btn {
        padding: 7px 14px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 1px solid transparent;
        transition: opacity 0.15s;

        &:active {
            opacity: 0.75;
        }

        &--data {
            background: transparent;
            color: rgba(255, 255, 255, 0.5);
            border-color: rgba(255, 255, 255, 0.15);
        }

        &--add {
            background: transparent;
            color: rgba(255, 255, 255, 0.7);
            border-color: rgba(255, 255, 255, 0.25);
        }

        &--next {
            background: $monument-dark;
            color: $text-bright;
            border-color: rgba(255, 255, 255, 0.2);
        }

        &--end {
            background: transparent;
            color: rgba(255, 255, 255, 0.35);
            border-color: rgba(255, 255, 255, 0.1);
        }
    }
}

.body {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.col {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &__header {
        height: 38px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        padding: 0 14px;
        @include separator(bottom);
    }

    &__header-label {
        @include eyebrow;
    }

    &--init {
        width: 280px;
        flex-shrink: 0;
        background: $monument;
        border-right: 1px solid $monument-mid;
    }

    &--control {
        flex: 1;
        background: $monument-dark;
        border-right: 1px solid $monument-mid;
    }

    &--conditions {
        width: 300px;
        flex-shrink: 0;
        background: $monument;
    }
}

.cond-active {
    padding: 10px 12px;
    flex-shrink: 0;
    @include separator(bottom);
}

.cond-grid-wrap {
    padding: 10px 12px 0;
    flex: 1;
}

.notes-wrap {
    padding: 10px 12px 12px;
    flex-shrink: 0;
    margin-top: auto;
    @include separator(top);
}
</style>