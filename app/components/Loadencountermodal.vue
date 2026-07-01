<script setup>
const props = defineProps({
    encounter: { type: Object, required: true }, // { id, title, names[] }
})
const emit = defineEmits(['close'])

const { characters, loadEncounter } = useCharacters()

// ── Step 1 — replace or merge ─────────────────────────────────
const mode = ref(null) // 'replace' | 'merge'

// ── Step 2 — per-combatant initiative + token ─────────────────
// Build an entry row for each name in the template.
// Characters missing from the store are flagged.
// _key is needed because the same name can appear multiple times (e.g. 3x Spider).
const nameCounters = {}
const entries = ref(
    props.encounter.names.map((name, idx) => {
        const type = characters[name]?.type ?? 'NPC'
        let tokenNum = null
        if (type === 'NPC') {
            nameCounters[name] = (nameCounters[name] || 0) + 1
            tokenNum = nameCounters[name]
        }
        return {
            _key: `${name}-${idx}`,
            name,
            exists: !!characters[name],
            type,
            initiative: 10,
            tokenNum,
        }
    })
)

const missingNames = computed(() => entries.value.filter(e => !e.exists).map(e => e.name))

function confirm() {
    const valid = entries.value.filter(e => e.exists)
    loadEncounter(valid, mode.value)
    emit('close')
}
</script>

<template>
    <Teleport to="body">
        <div class="modal-overlay" @click.self="emit('close')">
            <div class="modal">

                <div class="modal__header">
                    <span class="modal__title">Load — {{ encounter.title }}</span>
                    <button class="modal__close" @click="emit('close')">✕</button>
                </div>

                <!-- Step 1: replace or merge -->
                <div v-if="!mode" class="modal__body">
                    <p class="modal__desc">
                        What should happen to the current encounter?
                    </p>
                    <div class="mode-btns">
                        <button class="mode-btn" @click="mode = 'replace'">
                            <span class="mode-btn__icon">↺</span>
                            <span class="mode-btn__label">Replace</span>
                            <span class="mode-btn__sub">Clear current combatants and load fresh</span>
                        </button>
                        <button class="mode-btn" @click="mode = 'merge'">
                            <span class="mode-btn__icon">＋</span>
                            <span class="mode-btn__label">Merge</span>
                            <span class="mode-btn__sub">Add to whoever is already running</span>
                        </button>
                    </div>
                </div>

                <!-- Step 2: set initiative + token per combatant -->
                <div v-else class="modal__body">

                    <div v-if="missingNames.length" class="modal__warning">
                        ⚠ Not in character store, will be skipped:
                        <strong>{{ missingNames.join(', ') }}</strong>
                    </div>

                    <div class="entry-list">
                        <div v-for="entry in entries" :key="entry._key" class="entry-row"
                            :class="{ 'entry-row--missing': !entry.exists }">
                            <div class="entry-row__info">
                                <span class="entry-row__name">{{ entry.name }}</span>
                                <span class="entry-row__type"
                                    :class="entry.type === 'PC' ? 'entry-row__type--pc' : 'entry-row__type--npc'">
                                    {{ entry.type }}
                                </span>
                                <span v-if="!entry.exists" class="entry-row__missing">missing</span>
                            </div>
                            <div v-if="entry.exists" class="entry-row__inputs">
                                <div class="entry-field">
                                    <label class="entry-label">Initiative</label>
                                    <input v-model.number="entry.initiative" class="entry-input" type="number" min="1"
                                        max="30" />
                                </div>
                                <div v-if="entry.type === 'NPC'" class="entry-field">
                                    <label class="entry-label">Token #</label>
                                    <input v-model.number="entry.tokenNum" class="entry-input" type="number" min="1"
                                        max="20" placeholder="—" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal__actions">
                        <button class="modal__btn modal__btn--cancel" @click="mode = null">← Back</button>
                        <button class="modal__btn modal__btn--confirm" @click="confirm">
                            Load Encounter
                        </button>
                    </div>

                </div>

            </div>
        </div>
    </Teleport>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.modal {
    background: $monument;
    border: 1px solid $burnt-dim;
    border-radius: 6px;
    width: 420px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 12px;
        border-bottom: 1px solid $monument-mid;
        flex-shrink: 0;
    }

    &__title {
        font-family: $font-display;
        font-size: 15px;
        font-weight: 700;
        color: $text-bright;
        letter-spacing: 0.04em;
    }

    &__close {
        font-size: 14px;
        color: $text-dim;
        padding: 2px 6px;

        &:hover {
            color: $text-bright;
        }
    }

    &__body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
    }

    &__desc {
        font-size: 12px;
        color: $text-mid;
        line-height: 1.5;
    }

    &__warning {
        font-size: 11px;
        color: $hp-hurt;
        background: rgba($hp-hurt, 0.08);
        border: 1px solid rgba($hp-hurt, 0.25);
        border-radius: 3px;
        padding: 8px 10px;
        line-height: 1.5;
    }

    &__actions {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-top: 4px;
        padding-top: 12px;
        border-top: 1px solid $monument-mid;
    }

    &__btn {
        padding: 8px 16px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 1px solid transparent;
        cursor: pointer;
        transition: opacity 0.15s;

        &--cancel {
            background: transparent;
            color: $text-dim;
            border-color: $monument-lite;
        }

        &--confirm {
            background: $burnt;
            color: $text-bright;
            border-color: $burnt-light;

            &:hover {
                background: $burnt-light;
            }
        }
    }
}

// ── Step 1: mode selection ────────────────────────────────────
.mode-btns {
    display: flex;
    gap: 10px;
}

.mode-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 16px 12px;
    background: $monument-dark;
    border: 1px solid $monument-mid;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.15s, background 0.15s;

    &:hover {
        border-color: $burnt-light;
        background: $burnt-faint;
    }

    &__icon {
        font-size: 22px;
        color: $burnt-light;
    }

    &__label {
        font-family: $font-display;
        font-size: 13px;
        font-weight: 700;
        color: $text-bright;
        letter-spacing: 0.04em;
    }

    &__sub {
        font-size: 10px;
        color: $text-dim;
        line-height: 1.4;
    }
}

// ── Step 2: entry list ────────────────────────────────────────
.entry-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.entry-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: $monument-dark;
    border: 1px solid $monument-mid;
    border-radius: 3px;

    &--missing {
        opacity: 0.4;
    }

    &__info {
        flex: 1;
        display: flex;
        align-items: baseline;
        gap: 8px;
        overflow: hidden;
    }

    &__name {
        font-family: $font-display;
        font-size: 13px;
        font-weight: 700;
        color: $text-bright;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__type {
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;

        &--pc {
            color: $pc-stripe;
        }

        &--npc {
            color: $npc-stripe;
        }
    }

    &__missing {
        font-size: 9px;
        color: $hp-hurt;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    &__inputs {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
    }
}

.entry-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 72px;
}

.entry-label {
    font-size: 7px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: $text-dim;
}

.entry-input {
    background: $monument;
    border: 1px solid $monument-mid;
    border-radius: 3px;
    padding: 6px 8px;
    color: $text-bright;
    font-size: 13px;
    width: 100%;
    text-align: center;
    transition: border-color 0.15s;

    &:focus {
        border-color: $burnt-dim;
    }
}
</style>