<script setup>
const emit = defineEmits(['close'])

const { availableCharacters, addToEncounter, createCharacter } = useCharacters()

// ── Tab ───────────────────────────────────────────────────────
const tab = ref('select')

// ── Select from store ─────────────────────────────────────────
const selectedName = ref('')
const selectInitiative = ref(null)
const selectTokenNum = ref('')

const selectedType = computed(() => {
    const found = availableCharacters.value.find(([n]) => n === selectedName.value)
    return found ? found[1].type : null
})

// Auto-select first available when list changes
watchEffect(() => {
    if (availableCharacters.value.length && !selectedName.value) {
        selectedName.value = availableCharacters.value[0][0]
    }
})

function confirmSelect() {
    if (!selectedName.value) return
    addToEncounter(selectedName.value, selectInitiative.value, selectTokenNum.value)
    emit('close')
}

// ── Create new ────────────────────────────────────────────────
const newName = ref('')
const newType = ref('NPC')
const newAc = ref(10)
const newHealthMax = ref(10)
const newInitiative = ref(10)
const newTokenNum = ref('')
const createError = ref('')

function confirmCreate() {
    createError.value = ''
    if (!newName.value.trim()) {
        createError.value = 'Name is required.'
        return
    }

    createCharacter(newName.value.trim(), {
        type: newType.value,
        ac: newAc.value,
        healthMax: newHealthMax.value,
    })
    addToEncounter(newName.value.trim(), newInitiative.value, newType.value === 'NPC' ? newTokenNum.value : null)
    emit('close')
}
const onKeydown = (e) => {
    if (e.key === 'Enter') {
        if (tab.value === 'select') {
            confirmSelect()
        } else {
            confirmCreate()
        }
    } else if (e.key === 'Escape') {
        emit('close')
    }
}
onMounted(() => {
    addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
    removeEventListener('keydown', onKeydown)
})
</script>

<template>
    <Teleport to="body">
        <div class="modal-overlay">
            <div class="modal">

                <div class="modal__header">
                    <span class="modal__title">Add Combatant</span>
                    <button class="modal__close" @click="emit('close')">✕</button>
                </div>

                <div class="modal__tabs">
                    <button class="modal__tab" :class="{ 'modal__tab--active': tab === 'select' }"
                        @click="tab = 'select'">From Characters</button>
                    <button class="modal__tab" :class="{ 'modal__tab--active': tab === 'create' }"
                        @click="tab = 'create'">Create New</button>
                </div>

                <!-- ── Select from characters ── -->
                <div v-if="tab === 'select'" class="modal__body">

                    <div v-if="availableCharacters.length === 0" class="modal__empty">
                        No characters available to add.
                    </div>

                    <template v-else>
                        <div class="modal__field">
                            <label class="modal__label">Character</label>
                            <select v-model="selectedName" class="modal__input">
                                <option value="" disabled>Select a character…</option>
                                <option v-for="[name, c] in availableCharacters" :key="name" :value="name">
                                    {{ name }} — {{ c.type }} · AC {{ c.ac }} · {{ c.healthMax }} HP
                                </option>
                            </select>
                        </div>

                        <div class="modal__field">
                            <label class="modal__label">Initiative Roll</label>
                            <input v-model.number="selectInitiative" class="modal__input" type="number" min="1"
                                max="30" />
                        </div>

                        <div v-if="selectedType === 'NPC'" class="modal__field">
                            <label class="modal__label">Token Number</label>
                            <input v-model.number="selectTokenNum" class="modal__input" type="text" />
                        </div>

                        <div class="modal__actions">
                            <button class="modal__btn modal__btn--cancel" @click="emit('close')">Cancel</button>
                            <button class="modal__btn modal__btn--confirm" :disabled="!selectedName"
                                @click="confirmSelect">Add to Encounter</button>
                        </div>
                    </template>

                </div>

                <!-- ── Create new ── -->
                <div v-if="tab === 'create'" class="modal__body">

                    <div class="modal__field">
                        <label class="modal__label">Name</label>
                        <input v-model="newName" class="modal__input" type="text" placeholder="e.g. Goblin Chief" />
                    </div>

                    <div class="modal__row">
                        <div class="modal__field">
                            <label class="modal__label">Type</label>
                            <select v-model="newType" class="modal__input">
                                <option value="PC">PC</option>
                                <option value="NPC">NPC</option>
                            </select>
                        </div>
                        <div class="modal__field">
                            <label class="modal__label">AC</label>
                            <input v-model.number="newAc" class="modal__input" type="number" min="1" max="30" />
                        </div>
                    </div>

                    <div class="modal__row">
                        <div class="modal__field">
                            <label class="modal__label">Max HP</label>
                            <input v-model.number="newHealthMax" class="modal__input" type="number" min="1" />
                        </div>
                        <div class="modal__field">
                            <label class="modal__label">Initiative</label>
                            <input v-model.number="newInitiative" class="modal__input" type="number" min="1" max="30" />
                        </div>
                    </div>

                    <div v-if="newType === 'NPC'" class="modal__field">
                        <label class="modal__label">Token Number</label>
                        <input v-model.number="newTokenNum" class="modal__input" type="number" min="1" max="20" />
                    </div>

                    <p v-if="createError" class="modal__error">{{ createError }}</p>

                    <div class="modal__actions">
                        <button class="modal__btn modal__btn--cancel" @click="emit('close')">Cancel</button>
                        <button class="modal__btn modal__btn--confirm" @click="confirmCreate">
                            Create &amp; Add
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
    width: 380px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 12px;
        border-bottom: 1px solid $monument-mid;
    }

    &__title {
        font-family: $font-display;
        font-size: 16px;
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

    &__tabs {
        display: flex;
        border-bottom: 1px solid $monument-mid;
    }

    &__tab {
        flex: 1;
        padding: 10px 0;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: $text-dim;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        transition: color 0.15s, border-color 0.15s;

        &--active {
            color: $burnt-light;
            border-color: $burnt-light;
        }

        &:hover:not(&--active) {
            color: $text-mid;
        }
    }

    &__body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    &__empty {
        font-size: 11px;
        color: $text-dim;
        text-align: center;
        padding: 20px 0;
    }

    &__row {
        display: flex;
        gap: 10px;
    }

    &__field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex: 1;
    }

    &__label {
        font-size: 8px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: $text-dim;
    }

    &__input {
        background: $monument-dark;
        border: 1px solid $monument-lite;
        border-radius: 3px;
        padding: 8px 10px;
        color: $text-bright;
        font-size: 13px;
        width: 100%;
        transition: border-color 0.15s;

        &:focus {
            border-color: $burnt-dim;
        }

        // Native select styling
        option {
            background: $monument;
        }
    }

    &__error {
        font-size: 11px;
        color: $hp-crit;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
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

        &:disabled {
            opacity: 0.35;
            cursor: not-allowed;
        }

        &--cancel {
            background: transparent;
            color: $text-dim;
            border-color: $monument-lite;
        }

        &--confirm {
            background: $burnt;
            color: $text-bright;
            border-color: $burnt-light;

            &:hover:not(:disabled) {
                background: $burnt-light;
            }
        }
    }
}
</style>