<template>
  <li @click="onClick()" :style="{ 'border-top-color': item.category ? item.category.color : '#ccc' }">
    <div class="name">
      <span>{{ item.name | shortenName }}</span>
    </div>
    <div class="price">
      ¥{{ item.price | addComma }}
    </div>
    <div v-if="showSelect && selected" class="selected">
      <font-awesome-icon :icon="['fas', 'check']"></font-awesome-icon>
    </div>
  </li>
</template>

<script>
function strCount (str) {
  let len = 0
  let i

  str = escape(str)
  for (i = 0; i < str.length; i++, len++) {
    if (str.charAt(i) === '%') {
      if (str.charAt(++i) === 'u') {
        i += 3
        len++
      }
      i++
    }
  }
  return len
}

export default {
  props: {
    item: Object,
    selected: Boolean,
    showSelect: Boolean
  },
  methods: {
    onClick () {
      if (this.selected) this.$emit('unselect', this.item.id)
      else this.$emit('select', this.item.id)
    }
  },
  filters: {
    addComma (val) {
      return val.toLocaleString()
    },
    shortenName (name) {
      if (strCount(name) > 26) {
        return name.slice(0, 13) + '…'
      }
      return name
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li {
  position: relative;
}
.name {
  height: 3rem;

  line-height: 3rem;
  transition: .3s;
}
.name span {
  display: inline-block;

  width: 100%;

  font-size: 1rem;
  line-height: 1.5rem;
  text-align: center;
  vertical-align: middle;
  overflow-wrap: break-word;
}
.price {
  margin-top: .3em;

  color: #555;
  font-size: 0.9rem;
  text-align: right;
  line-height: 1em;
}
.selected {
  position: absolute;
  top: 50%;
  left: 50%;

  font-size: 3rem;
  color: rgba(252, 170, 23, 0.5);
  transform: translate(-50%, -50%);
}
</style>
