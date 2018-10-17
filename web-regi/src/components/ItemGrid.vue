<template>
  <ul>
    <ItemGridElement v-for="item in sortedItems" :item="item" :selected="selectedItems ? selectedItems.indexOf(item.id) >= 0 : false" :showSelect="showSelect" @select="$emit('select', $event)" @unselect="$emit('unselect', $event)" :key="item.id"></ItemGridElement>
    <li v-if="makeNew" @click="$emit('add')" class="new">
      <font-awesome-icon class="circle" :icon="['far', 'circle']"></font-awesome-icon>
      <font-awesome-icon class="plus" :icon="['fas', 'plus']"></font-awesome-icon>
    </li>
  </ul>
</template>

<script>
import ItemGridElement from './ItemGridElement'

export default {
  components: {
    ItemGridElement
  },
  props: {
    items: Object,
    new: Boolean,
    showSelect: Boolean,
    selectedItems: Array
  },
  computed: {
    sortedItems () {
      let array = []

      Object.keys(this.items).forEach(id => {
        let item = this.items[id]
        item.id = id
        array.push(item)
      })

      array.sort((a, b) => {
        if (a.category === null && b.category === null) return 0
        else if (a.category === null) return -1
        else if (b.category === null) return 1
        else if (a.category.name !== b.category.name) return a.category.name - b.category.name
        else if (a.name < b.name) return -1
        else if (a.name > b.name) return 1
        return 0
      })

      return array
    },
    makeNew () {
      return this.new
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, 8rem);
  grid-auto-rows: 5.5rem;
  grid-gap: 1rem;
  justify-content: center;
}

li {
  display: inline-block;

  padding: .5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
  border-top: 5px solid #ccc;
  border-radius: 5px;

  cursor: pointer;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
}
li.new {
  position: relative;

  border: none;
  background-color: #FF4747;
  color: #fff;
  text-align: center;
}
li.new .circle {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 3.5rem;
  height: 3.5rem;
  transform: translate(-50%, -50%);
}
li.new .plus {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 2rem;
  height: 2rem;
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
