<template>
  <transition-group tag="ul" name="list">
    <CouponListItem v-for="(type, typeId) in couponGroups" :couponType="type" :key="typeId" @clone="$emit('clone', $event)" @selectType="$emit('selectType', $event)" @select="$emit('select', $event)"></CouponListItem>
    <li @click="$emit('add')" class="new" key="new">
      <div class="name"></div>
      <font-awesome-icon class="circle" :icon="['far', 'circle']"></font-awesome-icon>
      <font-awesome-icon class="plus" :icon="['fas', 'plus']"></font-awesome-icon>
    </li>
  </transition-group>
</template>

<script>
import CouponListItem from './CouponListItem'

export default {
  components: {
    CouponListItem
  },
  props: {
    couponGroups: Object
  },
  filters: {
    addComma (val) {
      return val.toLocaleString()
    }
  }
}
</script>

<style scoped>
.list-enter-active, .list-leave-active {
  transition: .3s;
}
.list-enter, .list-leave-to {
  transform: scale(0);
}

li.new {
  position: relative;

  height: 3.1rem;
  border: none;
  border-radius: 5px;

  background-color: #FF4747;
  color: #fff;
  text-align: center;
  cursor: pointer;
}
li.new .circle {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 2rem;
  height: 2rem;
  transform: translate(-50%, -50%);
}
li.new .plus {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 1rem;
  height: 1rem;
  transform: translate(-50%, -50%);
}
li.new svg {
  height: 100%;
  transition: .3s;
}
li.new:hover svg {
  transform: translate(-50%, -50%) scale(1.1);
}
</style>
