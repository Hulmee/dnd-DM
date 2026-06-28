<script setup>
defineProps({
    name: { type: String, required: true },
    initiative: { type: Number, required: true },
    healthCur: { type: Number, required: true },
    healthMax: { type: Number, required: true },
    active: { type: Boolean, default: false },
    conditions: { type: Array, default: () => [] },
    tokenNum: { type: Number, default: null },
})

defineEmits(['select'])

function hpFill(cur, max) {
    const pct = max === 0 ? 0 : (cur / max) * 100
    if (pct > 50) return 'fill-ok'
    if (pct > 25) return 'fill-hurt'
    return 'fill-crit'
}

function hpPct(cur, max) {
    if (max === 0) return '0%'
    return Math.min(100, Math.max(0, (cur / max) * 100)) + '%'
}
</script>

<template>
    <li class="init-row" :class="{ 'init-row--active': active }" @click="$emit('select')">
        <div class="init-row__stripe init-row__stripe--npc" />

        <span class="init-row__num">{{ initiative }}</span>

        <div class="init-row__info">
            <span class="init-row__name">{{ name }} ({{ tokenNum }})</span>
            <span class="init-row__sub">NPC</span>
            <div v-if="conditions.length" class="init-row__pips">
                <span v-for="cid in conditions" :key="cid" class="init-row__pip"
                    :class="`init-row__pip--${cid.toLowerCase()}`" :title="cid" />
            </div>
        </div>

        <div class="init-row__right">
            <span class="init-row__bar-label">HP</span>
            <div class="init-row__bar-bg">
                <div class="init-row__bar-fill" :class="hpFill(healthCur, healthMax)"
                    :style="{ width: hpPct(healthCur, healthMax) }" />
            </div>
        </div>
    </li>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';
@import '@/assets/css/row';

.init-row__stripe--npc {
    background: $npc-stripe;
}

.init-row__bar-label {
    display: block;
    font-size: 8px;
    color: $text-dim;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-align: right;
    margin-bottom: 5px;
}

.init-row__bar-bg {
    width: 68px;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: $monument-dark;
}

.init-row__bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.4s ease;
}
</style>