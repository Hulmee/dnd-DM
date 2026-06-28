<script setup>
// DmNPCRow — DM-only NPC row, shows HP numbers + AC
// Use NPCRow on the player screen (bar only, no numbers)

defineProps({
    name: { type: String, required: true },
    initiative: { type: Number, required: true },
    healthCur: { type: Number, required: true },
    healthMax: { type: Number, required: true },
    ac: { type: Number, required: true },
    active: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    conditions: { type: Array, default: () => [] },
    tokenNum: { type: Number, default: null },
})

defineEmits(['select'])

function hpColour(cur, max) {
    const pct = max === 0 ? 0 : (cur / max) * 100
    if (pct > 50) return 'col-ok'
    if (pct > 25) return 'col-hurt'
    return 'col-crit'
}
</script>

<template>
    <li class="init-row" :class="{ 'init-row--active': active, 'init-row--selected': selected }"
        @click="$emit('select')">
        <div class="init-row__stripe init-row__stripe--npc" />

        <span class="init-row__num">{{ initiative }}</span>

        <div class="init-row__info">
            <span class="init-row__name">{{ name }} <span v-if="tokenNum">({{ tokenNum }})</span></span>
            <span class="init-row__sub">NPC</span>
            <!-- <span class="init-row__sub">{{ tokenNum }}</span> -->
            <div v-if="conditions.length" class="init-row__pips">
                <span v-for="cid in conditions" :key="cid" class="init-row__pip"
                    :class="`init-row__pip--${cid.toLowerCase()}`" :title="cid" />
            </div>
        </div>

        <!-- HP numbers + AC — visible to DM only -->
        <div class="init-row__right">
            <span class="init-row__hp-val" :class="hpColour(healthCur, healthMax)">
                {{ healthCur }}
            </span>
            <span class="init-row__hp-max">/ {{ healthMax }}</span>
            <span class="init-row__ac">AC {{ ac }}</span>
        </div>
    </li>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';
@import '@/assets/css/row';

.init-row__stripe--npc {
    background: $npc-stripe;
}

.init-row__hp-val {
    display: block;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
}

.init-row__hp-max {
    display: block;
    font-size: 10px;
    color: $text-dim;
    margin-top: 2px;
}

.init-row__ac {
    display: block;
    font-size: 10px;
    color: $text-dim;
    margin-top: 3px;
    letter-spacing: 0.05em;
}
</style>