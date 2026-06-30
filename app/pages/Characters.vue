<script setup>
const {
    characters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    exportCharacters,
    importCharacters,
    clearStorage,
    savedEncounters,
    saveEncounter,
    deleteEncounter,
} = useCharacters()

// ── Sorted character list ─────────────────────────────────────
const sortedCharacters = computed(() =>
    Object.entries(characters).sort(([, a], [, b]) => {
        if (a.type !== b.type) return a.type === 'PC' ? -1 : 1
        return 0
    })
)

const filter = ref('All')

const filtered = computed(() =>
    filter.value === 'All'
        ? sortedCharacters.value
        : sortedCharacters.value.filter(([, c]) => c.type === filter.value)
)

// ── Edit character ────────────────────────────────────────────
const editing = ref(null)
const editFields = reactive({ name: '', type: 'NPC', ac: 10, healthMax: 10 })
const editError = ref('')

function startEdit(name, char) {
    editing.value = name
    editFields.name = name
    editFields.type = char.type
    editFields.ac = char.ac
    editFields.healthMax = char.healthMax
    editError.value = ''
}

function cancelEdit() {
    editing.value = null
    editError.value = ''
}

function saveEdit() {
    editError.value = ''
    if (!editFields.name.trim()) { editError.value = 'Name is required.'; return }
    const result = updateCharacter(editing.value, editFields.name.trim(), {
        type: editFields.type, ac: editFields.ac, healthMax: editFields.healthMax,
    })
    if (!result.ok) { editError.value = result.error; return }
    editing.value = null
}

// ── Add character ─────────────────────────────────────────────
const showAdd = ref(false)
const newFields = reactive({ name: '', type: 'NPC', ac: 10, healthMax: 10 })
const addError = ref('')

function openAdd() {
    Object.assign(newFields, { name: '', type: 'NPC', ac: 10, healthMax: 10 })
    addError.value = ''
    showAdd.value = true
}

function saveNew() {
    addError.value = ''
    if (!newFields.name.trim()) { addError.value = 'Name is required.'; return }
    if (characters[newFields.name.trim()]) { addError.value = 'Name already exists.'; return }
    createCharacter(newFields.name.trim(), {
        type: newFields.type, ac: newFields.ac, healthMax: newFields.healthMax,
    })
    showAdd.value = false
}

// ── Delete character ──────────────────────────────────────────
const confirmDelete = ref(null)

// ── Export / Import ───────────────────────────────────────────
function downloadExport() {
    const blob = new Blob([exportCharacters()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dnd-characters-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
}

const fileInput = ref(null)
const importFeedback = ref(null)

function onFileSelected(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
        const result = importCharacters(ev.target.result)
        importFeedback.value = result.ok
            ? { ok: true, message: 'Characters imported successfully.' }
            : { ok: false, message: result.error }
    }
    reader.readAsText(file)
    e.target.value = ''
}

// ── Clear storage ─────────────────────────────────────────────
const showClearConfirm = ref(false)

function confirmClear() {
    clearStorage()
    showClearConfirm.value = false
}

// ── Saved encounters ──────────────────────────────────────────
// Build new encounter template
const showNewEncounter = ref(false)
const newEncTitle = ref('')
const newEncSelected = ref([])  // array of character names
const newEncError = ref('')

function openNewEncounter() {
    newEncTitle.value = ''
    newEncSelected.value = []
    newEncError.value = ''
    showNewEncounter.value = true
}

function toggleEncCharacter(name) {
    const idx = newEncSelected.value.indexOf(name)
    if (idx === -1) newEncSelected.value.push(name)
    else newEncSelected.value.splice(idx, 1)
}

function saveNewEncounter() {
    newEncError.value = ''
    if (!newEncTitle.value.trim()) { newEncError.value = 'Title is required.'; return }
    if (!newEncSelected.value.length) { newEncError.value = 'Select at least one character.'; return }
    saveEncounter(newEncTitle.value, newEncSelected.value)
    showNewEncounter.value = false
}

// Load encounter modal
const loadingEncounter = ref(null) // the encounter template being loaded
</script>

<template>
    <div class="char-page">

        <!-- ── Header ──────────────────────────────────────── -->
        <header class="page-header">
            <div class="page-header__left">
                <NuxtLink to="/" class="page-header__back">← DM Screen</NuxtLink>
                <h1 class="page-header__title">Characters</h1>
            </div>
            <div class="page-header__actions">
                <button class="hdr-btn hdr-btn--secondary" @click="fileInput.click()">↑ Import</button>
                <input ref="fileInput" type="file" accept=".json" class="hidden-input" @change="onFileSelected" />
                <button class="hdr-btn hdr-btn--secondary" @click="downloadExport">↓ Export</button>
                <button class="hdr-btn hdr-btn--primary" @click="openAdd">＋ New Character</button>
            </div>
        </header>

        <!-- ── Import feedback ─────────────────────────────── -->
        <div v-if="importFeedback" class="import-feedback"
            :class="importFeedback.ok ? 'import-feedback--ok' : 'import-feedback--err'">
            {{ importFeedback.message }}
            <button class="import-feedback__close" @click="importFeedback = null">✕</button>
        </div>

        <!-- ── Filters ─────────────────────────────────────── -->
        <div class="filters">
            <button v-for="f in ['All', 'PC', 'NPC']" :key="f" class="filter-btn"
                :class="{ 'filter-btn--active': filter === f }" @click="filter = f">{{ f }}</button>
            <span class="filters__count">{{ filtered.length }} characters</span>
        </div>

        <!-- ── Character list ──────────────────────────────── -->
        <div class="char-list">

            <!-- Add new inline form -->
            <div v-if="showAdd" class="char-row char-row--form">
                <div class="char-row__stripe char-row__stripe--new" />
                <div class="char-form">
                    <div class="char-form__row">
                        <div class="form-field">
                            <label class="form-label">Name</label>
                            <input v-model="newFields.name" class="form-input" type="text"
                                placeholder="Character name" />
                        </div>
                        <div class="form-field form-field--sm">
                            <label class="form-label">Type</label>
                            <select v-model="newFields.type" class="form-input">
                                <option value="PC">PC</option>
                                <option value="NPC">NPC</option>
                            </select>
                        </div>
                        <div class="form-field form-field--sm">
                            <label class="form-label">AC</label>
                            <input v-model.number="newFields.ac" class="form-input" type="number" min="1" max="30" />
                        </div>
                        <div class="form-field form-field--sm">
                            <label class="form-label">Max HP</label>
                            <input v-model.number="newFields.healthMax" class="form-input" type="number" min="1" />
                        </div>
                    </div>
                    <p v-if="addError" class="form-error">{{ addError }}</p>
                    <div class="char-form__actions">
                        <button class="form-btn form-btn--cancel" @click="showAdd = false">Cancel</button>
                        <button class="form-btn form-btn--save" @click="saveNew">Save</button>
                    </div>
                </div>
            </div>

            <!-- Character rows -->
            <div v-for="[name, char] in filtered" :key="name" class="char-row"
                :class="{ 'char-row--editing': editing === name }">
                <div class="char-row__stripe"
                    :class="char.type === 'PC' ? 'char-row__stripe--pc' : 'char-row__stripe--npc'" />

                <!-- View -->
                <template v-if="editing !== name">
                    <div class="char-row__info">
                        <span class="char-row__name">{{ name }}</span>
                        <span class="char-row__type"
                            :class="char.type === 'PC' ? 'char-row__type--pc' : 'char-row__type--npc'">{{ char.type
                            }}</span>
                    </div>
                    <div class="char-row__stats">
                        <div class="char-stat"><span class="char-stat__label">AC</span><span class="char-stat__val">{{
                            char.ac }}</span></div>
                        <div class="char-stat"><span class="char-stat__label">Max HP</span><span
                                class="char-stat__val">{{ char.healthMax }}</span></div>
                    </div>
                    <div class="char-row__btns">
                        <button class="row-btn row-btn--edit" @click="startEdit(name, char)">Edit</button>
                        <button class="row-btn row-btn--delete" @click="confirmDelete = name">Delete</button>
                    </div>
                </template>

                <!-- Edit -->
                <template v-else>
                    <div class="char-form">
                        <div class="char-form__row">
                            <div class="form-field">
                                <label class="form-label">Name</label>
                                <input v-model="editFields.name" class="form-input" type="text" />
                            </div>
                            <div class="form-field form-field--sm">
                                <label class="form-label">Type</label>
                                <select v-model="editFields.type" class="form-input">
                                    <option value="PC">PC</option>
                                    <option value="NPC">NPC</option>
                                </select>
                            </div>
                            <div class="form-field form-field--sm">
                                <label class="form-label">AC</label>
                                <input v-model.number="editFields.ac" class="form-input" type="number" min="1"
                                    max="30" />
                            </div>
                            <div class="form-field form-field--sm">
                                <label class="form-label">Max HP</label>
                                <input v-model.number="editFields.healthMax" class="form-input" type="number" min="1" />
                            </div>
                        </div>
                        <p v-if="editError" class="form-error">{{ editError }}</p>
                        <div class="char-form__actions">
                            <button class="form-btn form-btn--cancel" @click="cancelEdit">Cancel</button>
                            <button class="form-btn form-btn--save" @click="saveEdit">Save</button>
                        </div>
                    </div>
                </template>
            </div>

            <div v-if="filtered.length === 0 && !showAdd" class="char-empty">No characters found.</div>
        </div>

        <!-- ══════════════════════════════════════════════════
             SAVED ENCOUNTERS SECTION
        ══════════════════════════════════════════════════ -->
        <div class="section-divider">
            <span class="section-divider__label">Saved Encounters</span>
            <button class="hdr-btn hdr-btn--primary" @click="openNewEncounter">＋ New Encounter</button>
        </div>

        <!-- New encounter form -->
        <div v-if="showNewEncounter" class="enc-form-wrap">
            <div class="enc-form">

                <div class="enc-form__header">
                    <div class="form-field">
                        <label class="form-label">Encounter Title</label>
                        <input v-model="newEncTitle" class="form-input" type="text" placeholder="e.g. Forest Ambush" />
                    </div>
                </div>

                <div class="enc-form__body">
                    <div class="form-label" style="margin-bottom: 8px">Select Characters</div>
                    <div class="enc-char-grid">
                        <button v-for="[name, c] in sortedCharacters" :key="name" class="enc-char-btn" :class="{
                            'enc-char-btn--selected': newEncSelected.includes(name),
                            'enc-char-btn--pc': c.type === 'PC',
                            'enc-char-btn--npc': c.type === 'NPC',
                        }" @click="toggleEncCharacter(name)">
                            <span class="enc-char-btn__name">{{ name }}</span>
                            <span class="enc-char-btn__meta">{{ c.type }} · {{ c.healthMax }}HP</span>
                        </button>
                    </div>
                </div>

                <p v-if="newEncError" class="form-error">{{ newEncError }}</p>

                <div class="enc-form__actions">
                    <button class="form-btn form-btn--cancel" @click="showNewEncounter = false">Cancel</button>
                    <button class="form-btn form-btn--save" @click="saveNewEncounter">
                        Save Encounter ({{ newEncSelected.length }} selected)
                    </button>
                </div>

            </div>
        </div>

        <!-- Saved encounter list -->
        <div class="enc-list">
            <div v-if="savedEncounters.length === 0 && !showNewEncounter" class="char-empty">
                No saved encounters yet.
            </div>

            <div v-for="enc in savedEncounters" :key="enc.id" class="enc-row">
                <div class="enc-row__stripe" />
                <div class="enc-row__info">
                    <span class="enc-row__title">{{ enc.title }}</span>
                    <div class="enc-row__names">
                        <span v-for="name in enc.names" :key="name" class="enc-row__tag" :class="{
                            'enc-row__tag--pc': characters[name]?.type === 'PC',
                            'enc-row__tag--npc': characters[name]?.type === 'NPC',
                            'enc-row__tag--missing': !characters[name],
                        }">
                            {{ name }}
                        </span>
                    </div>
                </div>
                <div class="enc-row__btns">
                    <button class="row-btn row-btn--edit" @click="loadingEncounter = enc">▶ Load</button>
                    <button class="row-btn row-btn--delete" @click="deleteEncounter(enc.id)">Delete</button>
                </div>
            </div>
        </div>
        <pre>{{ loadingEncounter }}</pre>

        <!-- ── Danger zone ──────────────────────────────────── -->
        <div class="danger-zone">
            <span class="danger-zone__label">Danger Zone</span>
            <template v-if="!showClearConfirm">
                <button class="hdr-btn hdr-btn--danger" @click="showClearConfirm = true">Clear All Data</button>
            </template>
            <template v-else>
                <span class="danger-zone__confirm">This resets everything. Are you sure?</span>
                <button class="hdr-btn hdr-btn--secondary" @click="showClearConfirm = false">Cancel</button>
                <button class="hdr-btn hdr-btn--danger" @click="confirmClear">Yes, clear everything</button>
            </template>
        </div>

        <!-- ── Delete character confirm ─────────────────────── -->
        <Teleport to="body">
            <div v-if="confirmDelete" class="del-overlay" @click.self="confirmDelete = null">
                <div class="del-modal">
                    <div class="del-modal__title">Delete "{{ confirmDelete }}"?</div>
                    <p class="del-modal__desc">Removes from the character store. Won't affect any current encounter.</p>
                    <div class="del-modal__actions">
                        <button class="form-btn form-btn--cancel" @click="confirmDelete = null">Cancel</button>
                        <button class="form-btn form-btn--delete"
                            @click="deleteCharacter(confirmDelete); confirmDelete = null">Delete</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── Load encounter modal ─────────────────────────── -->
        <Loadencountermodal v-if="loadingEncounter" :encounter="loadingEncounter" @close="loadingEncounter = null" />

    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';
// @import '@/assets/css/_row.scss';

.char-page {
    min-height: 100dvh;
    background: $monument-dark;
    display: flex;
    flex-direction: column;
}

// ── Header ────────────────────────────────────────────────────
.page-header {
    background: $monument;
    border-bottom: 2px solid $burnt;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    &__left {
        display: flex;
        align-items: baseline;
        gap: 20px;
    }

    &__back {
        font-size: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: $text-dim;
        text-decoration: none;
        transition: color 0.15s;

        &:hover {
            color: $burnt-light;
        }
    }

    &__title {
        font-family: $font-display;
        font-size: 22px;
        font-weight: 700;
        color: $text-bright;
        letter-spacing: 0.05em;
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }
}

.hdr-btn {
    padding: 8px 16px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid transparent;
    cursor: pointer;
    transition: opacity 0.15s, background 0.15s;

    &:active {
        opacity: 0.75;
    }

    &--primary {
        background: $burnt;
        color: $text-bright;
        border-color: $burnt-light;

        &:hover {
            background: $burnt-light;
        }
    }

    &--secondary {
        background: transparent;
        color: $text-mid;
        border-color: $monument-lite;

        &:hover {
            color: $text-bright;
        }
    }

    &--danger {
        background: rgba($hp-crit, 0.12);
        color: $hp-crit;
        border-color: $hp-crit;

        &:hover {
            background: rgba($hp-crit, 0.22);
        }
    }
}

.hidden-input {
    display: none;
}

// ── Import feedback ───────────────────────────────────────────
.import-feedback {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 24px;
    font-size: 12px;
    font-weight: 700;

    &--ok {
        background: rgba($hp-ok, 0.12);
        color: $hp-ok;
    }

    &--err {
        background: rgba($hp-crit, 0.12);
        color: $hp-crit;
    }

    &__close {
        color: inherit;
        opacity: 0.6;
        font-size: 14px;

        &:hover {
            opacity: 1;
        }
    }
}

// ── Filters ───────────────────────────────────────────────────
.filters {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px 24px;
    border-bottom: 1px solid $monument-mid;

    &__count {
        margin-left: auto;
        font-size: 10px;
        color: $text-dim;
        letter-spacing: 0.1em;
    }
}

.filter-btn {
    padding: 5px 14px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: 1px solid $monument-mid;
    background: transparent;
    color: $text-dim;
    cursor: pointer;
    transition: all 0.15s;

    &--active {
        background: $burnt-faint;
        border-color: $burnt-light;
        color: $burnt-light;
    }

    &:hover:not(&--active) {
        color: $text-mid;
    }
}

// ── Character list ────────────────────────────────────────────
.char-list {
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.char-row {
    display: flex;
    align-items: center;
    background: $monument;
    border-radius: 4px;
    border: 1px solid $monument-mid;
    overflow: hidden;

    &--editing {
        border-color: $burnt-dim;
        flex-direction: column;
        align-items: stretch;
    }

    &__stripe {
        width: 4px;
        align-self: stretch;
        flex-shrink: 0;

        &--pc {
            background: $pc-stripe;
        }

        &--npc {
            background: $npc-stripe;
        }

        &--new {
            background: $burnt-dim;
        }
    }

    &__info {
        flex: 1;
        padding: 14px 16px;
        display: flex;
        align-items: baseline;
        gap: 12px;
        overflow: hidden;
    }

    &__name {
        font-family: $font-display;
        font-size: 15px;
        font-weight: 700;
        color: $text-bright;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__type {
        font-size: 9px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        font-weight: 700;

        &--pc {
            color: $pc-stripe;
        }

        &--npc {
            color: $npc-stripe;
        }
    }

    &__stats {
        display: flex;
        gap: 24px;
        padding: 0 16px;
        flex-shrink: 0;
    }

    &__btns {
        display: flex;
        gap: 6px;
        padding: 0 14px;
        flex-shrink: 0;
    }
}

.char-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    &__label {
        font-size: 8px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: $text-dim;
    }

    &__val {
        font-family: $font-display;
        font-size: 18px;
        font-weight: 700;
        color: $text-bright;
        line-height: 1;
    }
}

.row-btn {
    padding: 5px 12px;
    border-radius: 2px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid transparent;
    cursor: pointer;
    transition: opacity 0.15s;

    &:active {
        opacity: 0.7;
    }

    &--edit {
        background: transparent;
        color: $text-dim;
        border-color: $monument-lite;

        &:hover {
            color: $text-bright;
        }
    }

    &--delete {
        background: transparent;
        color: rgba($hp-crit, 0.6);

        &:hover {
            color: $hp-crit;
        }
    }
}

.char-empty {
    padding: 40px 0;
    text-align: center;
    font-size: 12px;
    color: $text-dim;
    letter-spacing: 0.1em;
}

// ── Inline form ───────────────────────────────────────────────
.char-form {
    flex: 1;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    &__row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 120px;

    &--sm {
        max-width: 90px;
        min-width: 70px;
        flex: 0 0 auto;
    }
}

.form-label {
    font-size: 8px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: $text-dim;
}

.form-input {
    background: $monument-dark;
    border: 1px solid $monument-lite;
    border-radius: 3px;
    padding: 7px 10px;
    color: $text-bright;
    font-size: 13px;
    width: 100%;
    transition: border-color 0.15s;

    &:focus {
        border-color: $burnt-dim;
    }

    option {
        background: $monument;
    }
}

.form-error {
    font-size: 11px;
    color: $hp-crit;
    font-weight: 700;
}

.form-btn {
    padding: 7px 16px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid transparent;
    cursor: pointer;

    &--cancel {
        background: transparent;
        color: $text-dim;
        border-color: $monument-lite;
    }

    &--save {
        background: $burnt;
        color: $text-bright;
        border-color: $burnt-light;

        &:hover {
            background: $burnt-light;
        }
    }

    &--delete {
        background: rgba($hp-crit, 0.15);
        color: $hp-crit;
        border-color: $hp-crit;
    }
}

// ── Section divider ───────────────────────────────────────────
.section-divider {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px 12px;
    border-top: 2px solid $monument-mid;
    margin-top: 8px;

    &__label {
        font-family: $font-display;
        font-size: 16px;
        font-weight: 700;
        color: $text-bright;
        letter-spacing: 0.05em;
    }
}

// ── New encounter form ────────────────────────────────────────
.enc-form-wrap {
    padding: 0 24px 16px;
}

.enc-form {
    background: $monument;
    border: 1px solid $burnt-dim;
    border-radius: 4px;
    overflow: hidden;

    &__header {
        padding: 14px 16px 10px;
        border-bottom: 1px solid $monument-mid;
    }

    &__body {
        padding: 14px 16px;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid $monument-mid;
    }
}

.enc-char-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.enc-char-btn {
    display: flex;
    flex-direction: column;
    padding: 8px 12px;
    border-radius: 3px;
    border: 1px solid $monument-mid;
    background: $monument-dark;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.1s, background 0.1s;
    min-width: 120px;

    &:hover {
        border-color: $monument-lite;
    }

    &--selected {
        background: $burnt-faint;
        border-color: $burnt-light;
    }

    &--pc {
        border-left: 3px solid $pc-stripe;
    }

    &--npc {
        border-left: 3px solid $npc-stripe;
    }

    &--selected#{&}--pc,
    &--selected#{&}--npc {
        border-left-color: $burnt-light;
    }

    &__name {
        font-family: $font-display;
        font-size: 12px;
        font-weight: 700;
        color: $text-bright;
        line-height: 1.2;
    }

    &__meta {
        font-size: 9px;
        color: $text-dim;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-top: 3px;
    }
}

// ── Encounter list ────────────────────────────────────────────
.enc-list {
    padding: 0 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.enc-row {
    display: flex;
    align-items: center;
    background: $monument;
    border-radius: 4px;
    border: 1px solid $monument-mid;
    overflow: hidden;

    &__stripe {
        width: 4px;
        align-self: stretch;
        flex-shrink: 0;
        background: $burnt-dim;
    }

    &__info {
        flex: 1;
        padding: 12px 16px;
        overflow: hidden;
    }

    &__title {
        display: block;
        font-family: $font-display;
        font-size: 14px;
        font-weight: 700;
        color: $text-bright;
        margin-bottom: 6px;
    }

    &__names {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    &__tag {
        font-size: 9px;
        padding: 2px 7px;
        border-radius: 2px;
        border: 1px solid $monument-mid;
        color: $text-dim;

        letter-spacing: 0.06em;

        &--pc {
            color: $pc-stripe;
            border-color: rgba($pc-stripe, 0.4);
        }

        &--npc {
            // color: $npc-stripe;
            color: $burnt-light;
            // border-color: rgba($npc-stripe, 0.4);
            border-color: rgba($burnt-light, 0.4);
        }

        &--missing {
            color: $hp-hurt;
            border-color: rgba($hp-hurt, 0.3);
            text-decoration: line-through;
        }
    }

    &__btns {
        display: flex;
        gap: 6px;
        padding: 0 14px;
        flex-shrink: 0;
    }
}

// ── Danger zone ───────────────────────────────────────────────
.danger-zone {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid $monument-mid;
    margin-top: auto;
    flex-shrink: 0;

    &__label {
        font-size: 9px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: $text-dim;
        margin-right: 4px;
    }

    &__confirm {
        font-size: 11px;
        color: $hp-crit;
    }
}

// ── Delete modal ──────────────────────────────────────────────
.del-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.del-modal {
    background: $monument;
    border: 1px solid $hp-crit;
    border-radius: 6px;
    padding: 24px;
    width: 360px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    &__title {
        font-family: $font-display;
        font-size: 16px;
        font-weight: 700;
        color: $text-bright;
    }

    &__desc {
        font-size: 12px;
        color: $text-mid;
        line-height: 1.5;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
    }
}
</style>