<script setup>
// CombatantControl — DM centre column
// Shows the selected combatant's stats and a numpad for damage / healing.
// Logic hooks (applyDamage, applyHeal) will be added to useCharacters later.

const props = defineProps({
    combatant: { type: Object, default: null },
})

const { removeFromEncounter } = useCharacters()

// ── HP helpers ────────────────────────────────────────────────
function hpPct(cur, max) {
    if (!max) return 0
    return Math.min(100, Math.max(0, (cur / max) * 100))
}

function hpState(cur, max) {
    const pct = hpPct(cur, max)
    if (pct > 50) return 'ok'
    if (pct > 25) return 'hurt'
    return 'crit'
}

// ── Numpad ────────────────────────────────────────────────────
const input = ref('')

const displayValue = computed(() => input.value || '0')

function pressDigit(d) {
    if (input.value.length >= 4) return
    input.value += d
}

function backspace() {
    input.value = input.value.slice(0, -1)
}

function clear() {
    input.value = ''
}

function half() {
    const n = parseInt(input.value || '0')
    input.value = String(Math.max(1, Math.floor(n / 2)))
}

// Emits — parent wires these to useCharacters actions
const emit = defineEmits(['damage', 'heal'])

function applyDamage() {
    const n = parseInt(input.value || '0')
    if (n > 0 && props.combatant) {
        emit('damage', props.combatant.uid, n)
        input.value = ''
    }
}

function applyHeal() {
    const n = parseInt(input.value || '0')
    if (n > 0 && props.combatant) {
        emit('heal', props.combatant.uid, n)
        input.value = ''
    }
}

// Clear input when selected combatant changes
watch(() => props.combatant?.uid, () => { input.value = '' })
</script>

<template>
    <div class="control">

        <!-- Empty state -->
        <div v-if="!combatant" class="control__empty">
            <span class="control__empty-icon">⚔</span>
            <span class="control__empty-label">Select a combatant</span>
        </div>

        <template v-else>

            <!-- Identity -->
            <div class="control__identity">
                <div class="control__name">{{ combatant.name }}</div>
                <div class="control__sub">
                    {{ combatant.type }} · Initiative {{ combatant.initiative }}
                </div>
            </div>

            <!-- Stat chips -->
            <div class="stat-chips">
                <div class="stat-chip">
                    <span class="stat-chip__label">HP</span>
                    <span class="stat-chip__val" :class="`col-${hpState(combatant.healthCur, combatant.healthMax)}`">
                        {{ combatant.healthCur }}
                    </span>
                    <span class="stat-chip__sub">of {{ combatant.healthMax }}</span>
                </div>
                <div class="stat-chip">
                    <span class="stat-chip__label">AC</span>
                    <span class="stat-chip__val">{{ combatant.ac }}</span>
                </div>
                <div class="stat-chip">
                    <span class="stat-chip__label">Initiative</span>
                    <span class="stat-chip__val stat-chip__val--init">{{ combatant.initiative }}</span>
                </div>
            </div>

            <!-- HP bar -->
            <div class="hp-bar-section">
                <div class="hp-bar-section__labels">
                    <span>Health</span>
                    <span :class="`col-${hpState(combatant.healthCur, combatant.healthMax)}`">
                        {{ Math.round(hpPct(combatant.healthCur, combatant.healthMax)) }}%
                    </span>
                </div>
                <div class="hp-bar">
                    <div class="hp-bar__fill" :class="`fill-${hpState(combatant.healthCur, combatant.healthMax)}`"
                        :style="{ width: hpPct(combatant.healthCur, combatant.healthMax) + '%' }" />
                </div>
            </div>

            <!-- Damage / Heal -->
            <div class="dmg-section">
                <span class="dmg-section__label">Damage / Heal</span>

                <div class="numpad-display">{{ displayValue }}</div>

                <div class="numpad">
                    <button class="numpad__key" @click="pressDigit('7')">7</button>
                    <button class="numpad__key" @click="pressDigit('8')">8</button>
                    <button class="numpad__key" @click="pressDigit('9')">9</button>
                    <button class="numpad__key numpad__key--util" @click="clear">CLR</button>

                    <button class="numpad__key" @click="pressDigit('4')">4</button>
                    <button class="numpad__key" @click="pressDigit('5')">5</button>
                    <button class="numpad__key" @click="pressDigit('6')">6</button>
                    <button class="numpad__key numpad__key--util" @click="backspace">⌫</button>

                    <button class="numpad__key" @click="pressDigit('1')">1</button>
                    <button class="numpad__key" @click="pressDigit('2')">2</button>
                    <button class="numpad__key" @click="pressDigit('3')">3</button>
                    <button class="numpad__key numpad__key--util" @click="half">½</button>

                    <button class="numpad__key numpad__key--zero" @click="pressDigit('0')">0</button>
                    <button class="numpad__key numpad__key--util"
                        @click="removeFromEncounter(combatant.uid)">Remove</button>
                </div>

                <div class="apply-row">
                    <button class="apply-btn apply-btn--dmg" @click="applyDamage">− Damage</button>
                    <button class="apply-btn apply-btn--heal" @click="applyHeal">＋ Heal</button>
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';

.control {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    // ── Empty state ───────────────────────────────────────────
    &__empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: $text-dim;
    }

    &__empty-icon {
        font-size: 28px;
        opacity: 0.25;
    }

    &__empty-label {
        @include eyebrow(10px);
    }

    // ── Identity ──────────────────────────────────────────────
    &__identity {
        padding: 14px 18px 12px;
        flex-shrink: 0;
        @include separator(bottom);
    }

    &__name {
        font-family: $font-display;
        font-size: 24px;
        font-weight: 700;
        color: $text-bright;
        line-height: 1;
    }

    &__sub {
        @include eyebrow(10px);
        margin-top: 5px;
    }
}

// ── Stat chips ────────────────────────────────────────────────
.stat-chips {
    display: flex;
    gap: 10px;
    padding: 14px 18px 0;
}

.stat-chip {
    flex: 1;
    background: $monument;
    border: 1px solid $monument-mid;
    border-radius: 4px;
    padding: 10px 12px;
    text-align: center;

    &__label {
        display: block;
        font-size: 8px;
        letter-spacing: 0.18em;
        color: $text-dim;
        text-transform: uppercase;
        margin-bottom: 4px;
    }

    &__val {
        display: block;
        font-family: $font-display;
        font-size: 26px;
        font-weight: 700;
        line-height: 1;
        color: $text-bright;

        &--init {
            color: $burnt-light;
        }
    }

    &__sub {
        display: block;
        font-size: 10px;
        color: $text-dim;
        margin-top: 3px;
    }
}

// ── HP bar ────────────────────────────────────────────────────
.hp-bar-section {
    padding: 12px 18px 0;

    &__labels {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: $text-dim;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 6px;
    }
}

.hp-bar {
    @include hp-bar(10px, 5px);
    background: $monument;
    border: 1px solid $monument-mid;

    &__fill {
        height: 100%;
        border-radius: 5px;
        transition: width 0.4s ease;
    }
}

// ── Damage section ────────────────────────────────────────────
.dmg-section {
    padding: 12px 18px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &__label {
        display: block;
        font-size: 9px;
        letter-spacing: 0.2em;
        color: $text-dim;
        text-transform: uppercase;
        padding-bottom: 8px;
        @include separator(bottom);
    }
}

.numpad-display {
    background: $monument-dark;
    border: 1px solid $monument-lite;
    border-radius: 3px;
    padding: 8px 14px;
    font-family: $font-display;
    font-size: 28px;
    font-weight: 700;
    color: $text-bright;
    text-align: center;
    line-height: 1;
    letter-spacing: 0.05em;
}

.numpad {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;

    &__key {
        background: $monument;
        border: 1px solid $monument-mid;
        border-radius: 3px;
        padding: 10px 0;
        font-size: 15px;
        font-weight: 700;
        color: $text-mid;
        text-align: center;
        line-height: 1;
        transition: background 0.1s;

        &:active {
            background: $monument-mid;
        }

        &--util {
            color: $text-dim;
            font-size: 11px;
            letter-spacing: 0.04em;
        }

        &--zero {
            grid-column: span 3;
        }
    }
}

.apply-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.apply-btn {
    padding: 11px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid;
    transition: opacity 0.15s;

    &:active {
        opacity: 0.7;
    }

    &--dmg {
        background: rgba($hp-crit, 0.15);
        border-color: $hp-crit;
        color: $hp-crit;
    }

    &--heal {
        background: rgba($hp-ok, 0.13);
        border-color: $hp-ok;
        color: $hp-ok;
    }
}
</style>