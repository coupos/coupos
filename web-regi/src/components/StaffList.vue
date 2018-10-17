<template>
  <ul>
    <li v-for="(staff, name) in staffs" :key="name">
      <div class="name">{{ name }}</div>
      <div class="state">{{ staff.state | covertState }}</div>
      <div class="edit" @click="$emit('select', name)"><font-awesome-icon :icon="['fas', 'pen']"></font-awesome-icon></div>
    </li>
    <li @click="$emit('add')" class="new">
      <div class="name"></div>
      <font-awesome-icon class="circle" :icon="['far', 'circle']"></font-awesome-icon>
      <font-awesome-icon class="plus" :icon="['fas', 'plus']"></font-awesome-icon>
    </li>
  </ul>
</template>

<script>
import CouponListItem from './CouponListItem'

export default {
  components: {
    CouponListItem
  },
  props: {
    staffs: Object
  },
  filters: {
    covertState (state) {
      if (state === 'offline') return 'オフライン'
      else if (state === 'waiting') return '待機中'
      else if (state === 'typing') return '会計中'
      else if (state === 'closed') return '休止中'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li {
  display: flex;

  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 3px solid #e0e0e0;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 2em;
}
li > div {
  height: 2rem;
  margin-right: 0.7rem;
}
li > div:last-child {
  margin-right: 0;
}
li .name {
  flex: 1 1 0;

  height: 1.75rem;
  overflow: hidden;
}
li .state {
  flex: 1 1 0;

  height: 1.75rem;
}
li div.edit {
  flex: 0 0 auto;

  width: 2rem;
  height: 2rem;
  border-radius: 50%;

  font-size: 1rem;
  text-align: center;
  color: #fff;
  background-color: #3D77FF;
  cursor: pointer;
}
li div.edit:hover {
  background-color: hsl(222, 100%, 66%);
}
li svg {
  height: 100%;
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
