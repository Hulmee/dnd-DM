<script setup>
defineProps({
    data: { type: Array, required: true },
    selectedUid: { type: Number, default: null },
})

const emit = defineEmits(['select'])

const showModal = ref(false)
</script>

<template>
    <div class="init-list">

        <!-- Column header -->
        <div class="init-list__header">
            <span class="init-list__title">Initiative Order</span>
            <button class="init-list__add" @click="showModal = true">＋ Add</button>
        </div>

        <!-- <AddCombatantModal v-if="showModal" @close="showModal = false" /> -->
        <Addcombatantmodal v-if="showModal" @close="showModal = false" />

        <ul class="init-list__rows">
            <template v-for="c in data" :key="c.uid">

                <PCRow v-if="c.type === 'PC'" :name="c.name" :initiative="c.initiative" :health-cur="c.healthCur"
                    :health-max="c.healthMax" :ac="c.ac" :active="c.active" :selected="c.uid === selectedUid"
                    :conditions="c.conditions ?? []" @select="emit('select', c.uid)" />
                <!-- 
                <DMNPCRow v-else :name="c.name" :initiative="c.initiative" :health-cur="c.healthCur"
                    :health-max="c.healthMax" :ac="c.ac" :active="c.active" :selected="c.uid === selectedUid"
                    :conditions="c.conditions ?? []" @select="emit('select', c.uid)" /> -->
                <DmNpcRow v-else :name="c.name" :initiative="c.initiative" :health-cur="c.healthCur"
                    :health-max="c.healthMax" :ac="c.ac" :active="c.active" :selected="c.uid === selectedUid"
                    :conditions="c.conditions ?? []" :tokenNum="c.tokenNum" @select="emit('select', c.uid)" />
            </template>
        </ul>

    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';

.init-list {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;

    &__header {
        height: 38px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 14px;
        @include separator(bottom);
    }

    &__title {
        @include eyebrow;
    }

    &__add {
        @include eyebrow(9px);
        color: $burnt-light;
        border: 1px solid $burnt-dim;
        padding: 3px 8px;
        border-radius: 2px;
        font-weight: 700;
        background: transparent;
        transition: opacity 0.15s;

        &:active {
            opacity: 0.7;
        }
    }

    &__rows {
        list-style: none;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: auto;
    }
}

.init-row {
    display: flex;
    align-items: center;
    height: 82px;
    flex-shrink: 0;
    padding: 0 12px 0 0;
    cursor: pointer;
    @include separator(bottom);
    transition: background 0.1s;

    &:hover:not(.init-row--active) {
        background: rgba(255, 255, 255, 0.03);
    }

    &--active {
        background: $burnt-faint;
    }

    &__stripe {
        width: 3px;
        align-self: stretch;
        flex-shrink: 0;

        &--pc {
            background: $pc-stripe;
        }

        &--npc {
            background: $npc-stripe;
        }
    }

    &--active &__stripe {
        background: $burnt-light;
    }

    &__num {
        font-family: $font-display;
        font-size: 22px;
        font-weight: 700;
        width: 42px;
        text-align: center;
        flex-shrink: 0;
        color: $text-dim;
        line-height: 1;
    }

    &--active &__num {
        color: $burnt-light;
    }

    &__info {
        flex: 1;
        padding: 0 10px;
        overflow: hidden;
    }

    &__name {
        display: block;
        font-family: $font-display;
        font-size: 13px;
        font-weight: 700;
        color: $text-bright;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
    }

    &__sub {
        display: block;
        font-size: 9px;
        color: $text-dim;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-top: 2px;
    }

    &__pips {
        display: flex;
        gap: 3px;
        margin-top: 5px;
        flex-wrap: wrap;
    }

    &__pip {
        display: inline-block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: $text-dim;

        &--concentrating {
            background: #4080A0;
        }

        &--poisoned {
            background: #50C050;
        }

        &--prone {
            background: #D09040;
        }

        &--charmed {
            background: #C090E0;
        }

        &--frightened {
            background: #E07040;
        }

        &--invisible {
            background: #60A0C0;
        }

        &--paralysed {
            background: #D060B0;
        }

        &--stunned {
            background: #5090C0;
        }

        &--unconscious {
            background: #A05050;
        }

        &--grappled {
            background: #90B040;
        }

        &--incapacitated {
            background: #C04040;
        }

        &--blinded {
            background: #A0A0A0;
        }

        &--petrified {
            background: #A0A080;
        }

        &--restrained {
            background: #C08050;
        }
    }

    &__right {
        flex-shrink: 0;
        text-align: right;
        min-width: 68px;
    }

    &__hp-val {
        display: block;
        font-size: 20px;
        font-weight: 700;
        line-height: 1;
    }

    &__hp-max {
        display: block;
        font-size: 10px;
        color: $text-dim;
        margin-top: 2px;
    }

    &__ac {
        display: block;
        font-size: 10px;
        color: $text-dim;
        margin-top: 3px;
        letter-spacing: 0.05em;
    }

    &__bar-label {
        display: block;
        font-size: 8px;
        color: $text-dim;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        text-align: right;
        margin-bottom: 5px;
    }

    &__bar-bg {
        width: 68px;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        background: $monument-dark;
    }

    &__bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.4s ease;
    }
}
</style>