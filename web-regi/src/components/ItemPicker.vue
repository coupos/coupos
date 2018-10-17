<template>
  <div>
    <div class="button" @click="showModal()">商品を選択</div>
    <div class="modal" v-if="show">
      <div class="wrapper"></div>
      <div class="body">
        <ItemGrid class="item-grid" :items="items" :categories="categories" :selectedItems="selectedItems" @select="onSelect($event)" @unselect="onUnselect($event)" showSelect></ItemGrid>
        <div class="button-wrapper" @click="show = false">
          <a class="button submit"><span style="font-size: 1.3rem">{{ selectedItems.length === 0 ? '全' : selectedItems.length }}</span>商品を選択</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ItemGrid from './ItemGrid'

export default {
  components: {
    ItemGrid
  },
  props: {
    items: Object,
    categories: Object,
    selectedItems: Array
  },
  data () {
    return {
      show: false
    }
  },
  methods: {
    showModal () {
      this.show = true
    },
    onSelect (id) {
      if (this.selectedItems.indexOf(id) < 0) this.selectedItems.push(id)
    },
    onUnselect (id) {
      this.selectedItems.splice(this.selectedItems.indexOf(id), 1)
    }
  }
}
</script>

<style scoped>
div.button {
  width: auto;
  height: 2rem;
  padding: 0 1rem;
  border-radius: 1rem;

  line-height: 2rem;
  background-color: hsl(222, 100%, 61%);
  color: #fff;
  text-align: center;
  cursor: pointer;
}
div.button:hover {
  line-height: 2rem;
  background-color: hsl(222, 100%, 66%);
  color: #fff;
  text-align: center;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
}
.wrapper {
  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 75%);
}
.body {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 50rem;
  height: auto;
  padding: 50px 20px;
  border-radius: 5px;

  background-color: #fff;
  transform: translate(-50%, -50%);
}
.item-grid {
  margin: 0 auto;
}
.button-wrapper {
  margin-top: 50px;

  text-align: center;
}
.button.submit {
  margin: 0;
  padding-left: 5rem;
  padding-right: 5rem;

  background-color: hsl(0, 100%, 63%);
  box-shadow: 0 3px 0 hsl(0, 100%, 38%);
}
.button.submit:hover {
  background-color: hsl(0, 100%, 66%);
  box-shadow: 0 3px 0 hsl(0, 100%, 43%);
}
.button.submit:active {
  box-shadow: none;
}
</style>
