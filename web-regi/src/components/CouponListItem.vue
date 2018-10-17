<template>
  <li>
    <div class="details">
      <div class="name">{{ couponType.name }}</div>
      <div class="value">{{ couponType.unit === 'yen' ? '¥-' : '-'}}{{ couponType.value | addComma }}{{ couponType.unit === 'per' ? '%' : ''}}</div>
      <div class="effect-type" style="font-size: 0">
        <span class="value">{{ couponType.target === null ? '小計' : '単品' }}</span>
        <span class="unit">値引</span>
      </div>
      <div class="cloneNum">{{ couponType.bindedCoupons.length }}<span class="unit">枚</span></div>
      <div class="clone" @click="$emit('clone', couponType.id)"><font-awesome-icon :icon="['fas', 'clone']"></font-awesome-icon></div>
      <div class="edit" @click="$emit('selectType', couponType.id)"><font-awesome-icon :icon="['fas', 'pen']"></font-awesome-icon></div>
      <div class="expand" @click="expand = !expand">
        <font-awesome-icon v-if="!expand" :icon="['fas', 'caret-down']"></font-awesome-icon>
        <font-awesome-icon v-else :icon="['fas', 'caret-up']"></font-awesome-icon>
      </div>
    </div>
    <ul class="clones" v-if="expand">
      <li v-for="c in couponType.bindedCoupons" :key="c.id">
        <div class="details">
          <div class="left_times">
            <div v-if="couponType.limit_times === null">
              <span class="value">∞</span>
              <span class="unit">回</span>
            </div>
            <div v-else>
              <span class="value">{{ c.left_times }}</span>
              <span class="unit">回</span>
              <span style="margin: 0 0.2rem">/</span>
              <span>{{ couponType.limit_times }}</span>
              <span class="unit">回</span>
            </div>
          </div>
          <div class="concurrent">
            <div style="font-size: 0">
              <span class="value">{{ couponType.concurrent }}</span>
              <span class="unit">枚同時可</span>
            </div>
          </div>
          <div class="expire-time">
            <span v-if="c.expire_time === null" class="value">無期限</span>
            <span v-else class="value">{{ c.expire_time | remainTime }}</span>
          </div>
          <div class="edit" @click="$emit('select', c.id)"><font-awesome-icon :icon="['fas', 'pen']"></font-awesome-icon></div>
        </div>
      </li>
    </ul>
  </li>
</template>

<script>
export default {
  props: {
    couponType: Object
  },
  data () {
    return {
      expand: false
    }
  },
  filters: {
    addComma (val) {
      return val.toLocaleString()
    },
    remainTime (timeStr) {
      let remain = (new Date(timeStr.slice(0, 16)).getTime() - new Date().getTime()) / 1000

      if (remain < 0) return '期限切れ'
      else {
        if (remain < 3600) {
          return 'あと' + Math.floor(remain / 60) + '分'
        } else if (remain < 86400) {
          return 'あと' + Math.floor(remain / 3600) + '時間'
        } else if (remain < 604800) {
          return 'あと' + Math.floor(remain / 86400) + '日'
        } else {
          return 'あと' + Math.floor(remain / 604800) + '週間'
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li .details {
  display: flex;

  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 3px solid #e0e0e0;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 2em;
}
li:last-child .details {
  margin-bottom: 0;
}

li .details > div {
  height: 2rem;
  margin-right: 0.7rem;
}
li .details > div:last-child {
  margin-right: 0;
}
li .details .name {
  flex: 1 1 auto;

  height: 1.75rem;
  overflow: hidden;
}
li .details .value {
  flex: 0 0 auto;

  font-weight: bold;
}
li .details .effect-type {
  flex: 0 0 auto;

  font-size: 0.95rem;
}
li .details .cloneNum {
  flex: 0 0 auto;

  font-size: 1rem;
  font-weight: bold;
}
li .details .left_times {
  flex: 0 0 auto;
}
li .details .concurrent {
  flex: 0 0 auto;
}
li .details .expire-time {
  flex: 1 1 auto;
}
li .details .unit {
  margin-left: 0.1em;

  font-size: 0.8rem;
  font-weight: normal;
}
li .details .clone {
  flex: 0 0 auto;

  width: 2rem;
  height: 2rem;
  border-radius: 50%;

  font-size: 1rem;
  text-align: center;
  color: #fff;
  background-color: hsl(0, 100%, 63%);
  cursor: pointer;
}
li .details .clone:hover {
  background-color: hsl(0, 100%, 66%);
}
li .details .clone.disabled {
  cursor: default;
  background-color: hsl(0, 0%, 72%);
}
li .details .clone.disabled:hover {
  background-color: hsl(0, 0%, 72%);
}
li .details svg {
  height: 100%;
}
li .details .expand {
  flex: 0 0 auto;

  width: 1rem;
  height: 2rem;

  font-size: 1.3rem;
  text-align: center;
  cursor: pointer;
}
li .details .left_times > div {
  display: flex;
}
li .details span.value {
  font-size: 1rem;
  font-weight: bold;
}

li .clones {
  padding: 0 0 0.5rem 3rem;
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

@media screen and (max-width:600px) {
  li .clones {
    padding-left: 1rem;
  }
}
</style>
