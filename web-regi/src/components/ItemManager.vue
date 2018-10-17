<template>
  <div>
    <ErrorMessage ref="errorMessage"></ErrorMessage>
    <div v-if="modalState !== 'none'" class="overlay" @click="modalState = 'none'"></div>
    <div v-if="modalState === 'add' || modalState === 'edit'" class="modal form">
      <div class="close" @click="modalState = 'none'">
        <font-awesome-icon :icon="['fas', 'times']"></font-awesome-icon>
      </div>
      <h3>カテゴリーを{{ modalState === 'add' ? '追加' : '編集'}}</h3>
      <div class="props">
        <div class="name">
          <h4>カテゴリー名</h4>
        </div>
        <div class="value">
          <input v-model="catFormName" type="text" maxlength="20" />
        </div>
        <div class="name">
          <h4>テーマカラー</h4>
        </div>
        <div class="value">
          <swatches v-model="catFormColor" colors="material-basic"></swatches>
        </div>
      </div>
      <div v-if="modalState === 'add'" class="actions">
        <a class="button add" :class="{ 'disabled': !validateForm }" @click="addCategory()">追加</a>
      </div>
      <div v-else class="actions">
        <a class="button update" :class="{ 'disabled': !validateForm }" @click="editCategory()">更新</a>
        <a class="button delete" :class="{ 'disabled': !validateForm }" @click="deleteCategory()">削除</a>
      </div>
    </div>
    <div v-if="modalState === 'adding' || modalState === 'editing' || modalState === 'deleting'" class="modal processing">
      <h3 v-if="modalState === 'adding'">カテゴリーを追加</h3>
      <h3 v-else-if="modalState === 'editing'">カテゴリーを編集</h3>
      <h3 v-else>カテゴリーを削除</h3>
      <div class="icon">
        <div class="circle">
          <font-awesome-icon :icon="['fas', 'sync']" spin></font-awesome-icon>
        </div>
      </div>
      <h3 v-if="modalState === 'adding'">追加しています...</h3>
      <h3 v-else-if="modalState === 'editing'">編集しています...</h3>
      <h3 v-else>削除しています...</h3>
    </div>
    <div v-if="modalState === 'added' || modalState === 'edited' || modalState === 'deleted'" class="modal completed">
      <div class="close" @click="modalState = 'none'">
        <font-awesome-icon :icon="['fas', 'times']"></font-awesome-icon>
      </div>
      <h3 v-if="modalState === 'added'">カテゴリーを追加</h3>
      <h3 v-else-if="modalState === 'edited'">カテゴリーを編集</h3>
      <h3 v-else>カテゴリーを削除</h3>
      <div class="icon">
        <div class="circle">
          <font-awesome-icon :icon="['fas', 'check']"></font-awesome-icon>
        </div>
      </div>
      <h3 v-if="modalState === 'added'">追加しました</h3>
      <h3 v-else-if="modalState === 'edited'">編集しました</h3>
      <h3 v-else>削除しました</h3>
    </div>
    <div class="flexbox">
      <div id="item-list">
        <div id="search">
          <img src="../assets/barcode.png" />
          <input v-model="searchStr" @keyup.enter="searchItem(searchStr)" placeholder="商品を検索" />
        </div>
        <ItemGrid v-show="loadedItems && loadedCategories" :items="filteredItems" @select="selectItem($event)" @add="selectNew()" new></ItemGrid>
        <div v-show="!loadedItems || !loadedCategories" class="loading">
          <font-awesome-icon :icon="['fas', 'spinner']" pulse></font-awesome-icon>
        </div>
      </div>
      <div id="manage-pane">
        <div v-if="manageState === 'notselected'" class="message">
          <h2 class="title">商品データ</h2>
          <p>
            商品が選択されていません。<br />
            左の商品グリッドから商品を選択してください。
          </p>
        </div>
        <div v-else-if="manageState === 'add'" class="selected form">
          <h2 class="title">商品を新規登録</h2>
          <div class="props">
            <div class="name">
              <h4>商品名</h4>
            </div>
            <div class="value itemname">
              <input v-model="inputName" type="text" maxlength="30" />
            </div>
            <div class="name">
              <h4>カテゴリー</h4>
            </div>
            <div class="value category">
              <div class="color" :style="{ 'background-color': categories[selectedCategory] ? categories[selectedCategory].color : '#ccc' }"></div>
              <div class="select">
                <select v-model="selectedCategory">
                  <option value="">なし</option>
                  <option v-for="(category, key) in categories" :key="key" :value="key">{{ category.name }}</option>
                </select>
                <font-awesome-icon class="down-arrow" :icon="['fas', 'caret-down']"></font-awesome-icon>
              </div>
              <div class="button edit-cat" :class="{ 'disabled': selectedCategory === '' }" @click="if (selectedCategory !== '') openEditCategory()"><font-awesome-icon :icon="['fas', 'pen']"></font-awesome-icon></div>
              <div class="button add-cat" @click="openAddCategory()"><font-awesome-icon :icon="['fas', 'plus']"></font-awesome-icon></div>
            </div>
            <div class="name">
              <h4>価格</h4>
            </div>
            <div class="value price">
              <span class="unit">¥</span><input v-model.number="inputPrice" type="number" min="0" />
            </div>
          </div>
          <div class="actions">
            <a class="button add" :class="{ 'disabled': !validateForm }" @click="if (validateForm) addItem()">登録</a>
          </div>
        </div>
        <div v-else-if="manageState === 'selected'" class="selected form">
          <h2 class="title">商品データを編集</h2>
          <h3 class="itemname">{{ selectedItem.name }}</h3>
          <p class="itemid">ID {{ selectedItem.id }}</p>
          <div class="props">
            <div class="name">
              <h4>商品名</h4>
            </div>
            <div class="value itemname">
              <input v-model="inputName" type="text" maxlength="30" />
            </div>
            <div class="name">
              <h4>カテゴリー</h4>
            </div>
            <div class="value category">
              <div class="color" :style="{ 'background-color': categories[selectedCategory] ? categories[selectedCategory].color : '#ccc' }"></div>
              <div class="select">
                <select v-model="selectedCategory">
                  <option value="">なし</option>
                  <option v-for="(category, key) in categories" :key="key" :value="key">{{ category.name }}</option>
                </select>
                <font-awesome-icon class="down-arrow" :icon="['fas', 'caret-down']"></font-awesome-icon>
              </div>
              <div class="button edit-cat" :class="{ 'disabled': selectedCategory === '' }" @click="if (selectedCategory !== '') openEditCategory()"><font-awesome-icon :icon="['fas', 'pen']"></font-awesome-icon></div>
              <div class="button add-cat" @click="openAddCategory()"><font-awesome-icon :icon="['fas', 'plus']"></font-awesome-icon></div>
            </div>
            <div class="name">
              <h4>価格</h4>
            </div>
            <div class="value price">
              <span class="unit">¥</span><input v-model.number="inputPrice" type="number" min="0" />
            </div>
          </div>
          <div class="actions">
            <a class="button update" :class="{ 'disabled': !validateForm }" @click="if (validateForm) updateItem()">更新</a>
            <a class="button delete" @click="deleteItem()">削除</a>
          </div>
        </div>
        <ItemManagerProcessDisplay v-else :state="manageState"></ItemManagerProcessDisplay>
      </div>
    </div>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'
import ItemGrid from './ItemGrid'
import ErrorMessage from './ErrorMessage'
import ItemManagerProcessDisplay from './ItemManagerProcessDisplay'

export default {
  name: 'Item',
  components: {
    Swatches,
    ItemGrid,
    ErrorMessage,
    ItemManagerProcessDisplay
  },
  data () {
    return {
      categories: {},
      items: {},
      loadedCategories: false,
      loadedItems: false,
      searchStr: '',
      manageState: 'notselected',
      selectedItem: undefined,
      inputIdSet: false,
      inputId: '',
      inputName: '',
      selectedCategory: undefined,
      inputPrice: 0,
      modalState: 'none',
      catFormName: '',
      catFormColor: '#cccccc'
    }
  },
  computed: {
    filteredItems () {
      if (this.searchStr.length < 1) {
        return this.items
      } else {
        let itemIds = Object.keys(this.items)
        let filteredItemIds = []

        itemIds.forEach(id => {
          if (id.indexOf(this.searchStr) > -1 || this.items[id].name.indexOf(this.searchStr) > -1) {
            filteredItemIds.push(id)
          }
        })

        let filteredItems = {}
        filteredItemIds.forEach(id => {
          filteredItems[id] = this.items[id]
        })

        return filteredItems
      }
    },
    validateForm () {
      if (this.modalState === 'add' || this.modalState === 'edit') {
        if (this.catFormName.length < 1 || this.catFormName.length > 20) {
          return false
        }
        if (this.catFormColor.length !== 7) {
          return false
        }
      }
      if (this.manageState === 'selected' || this.manageState === 'add') {
        if (this.manageState === 'add' && this.inputIdSet && this.inputId.length < 1) {
          return false
        } else if (this.manageState === 'add' && this.inputIdSet && this.inputId.length > 13) {
          return false
        }
        if (this.inputName.length < 1) {
          return false
        } else if (this.inputName.length > 30) {
          return false
        }
        if (this.selectedCategory.length > 20) {
          return false
        }
        if (this.inputPrice < 0) {
          return false
        }
      } else {
        return false
      }
      return true
    }
  },
  methods: {
    selectItem (id) {
      if (!this.items[id]) {
        console.log('selectItem()で不明なIDが呼ばれました : ' + id)
        return
      }

      this.selectedItem = {
        id,
        name: this.items[id].name,
        category: this.items[id].category ? this.items[id].category.id : null,
        price: this.items[id].price
      }

      this.inputName = this.selectedItem.name
      this.selectedCategory = this.selectedItem.category === null ? '' : this.selectedItem.category
      this.inputPrice = this.selectedItem.price

      this.manageState = 'selected'
    },
    selectNew () {
      this.inputId = ''
      this.inputName = ''
      this.selectedCategory = ''
      this.inputPrice = 0

      this.manageState = 'add'
    },
    async addItem () {
      if (this.inputIdSet && this.inputId.length < 1) {
        this.$refs.errorMessage.pushMessage('カスタムIDを入力してください')
        return
      } else if (this.inputIdSet && this.inputId.length > 13) {
        this.$refs.errorMessage.pushMessage('カスタムIDは13文字以内で入力してください')
      }
      if (this.inputName.length < 1) {
        this.$refs.errorMessage.pushMessage('商品名を入力してください')
        return
      } else if (this.inputName.length > 30) {
        this.$refs.errorMessage.pushMessage('商品名は30文字以内で入力してください')
        return
      }
      if (this.selectedCategory.length > 20) {
        this.$refs.errorMessage.pushMessage('カテゴリー名は20文字以内で入力してください')
        return
      }
      if (this.inputPrice < 0) {
        this.$refs.errorMessage.pushMessage('価格は自然数で入力してください')
        return
      }

      this.manageState = 'adding'
      /* 商品を追加 */
      await AwsUtil.post('CouposAPI', 'items', {
        id: this.inputIdSet ? this.inputId : null,
        name: this.inputName,
        category: this.selectedCategory,
        price: this.inputPrice
      })
        .then(response => {
          console.log('商品を追加 : ' + response.status)
          this.manageState = 'added'
          this.selectedItem = null
        })
        .catch(error => {
          if (error.response.status === 409) {
            this.$refs.errorMessage.pushMessage('IDが重複しています。他のIDを設定するか、カスタムIDをオフにしてください。')
          } else {
            console.log(JSON.stringify(error))
            this.$refs.errorMessage.pushMessage('登録に失敗しました。しばらくしてからもう一度お試しください。')
          }
          this.manageState = 'add'
        })

      /* 商品リストを更新 */
      this.loadedItems = false
      AwsUtil.get('CouposAPI', 'items')
        .then(response => {
          console.log('商品を取得 : ' + response.status)
          this.items = response.data
          this.loadedItems = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async updateItem () {
      this.manageState = 'updating'
      /* 商品を更新 */
      await AwsUtil.put('CouposAPI', 'items/' + this.selectedItem.id, {
        name: this.inputName,
        category: this.selectedCategory,
        price: this.inputPrice
      })
        .then(response => {
          console.log('商品を更新 ' + this.selectedItem.id + ' : ' + response.status)
          this.manageState = 'updated'
          this.selectedItem = null
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('更新に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'selected'
        })

      /* 商品リストを更新 */
      this.loadedItems = false
      AwsUtil.get('CouposAPI', 'items')
        .then(response => {
          console.log('商品を取得 : ' + response.status)
          this.items = response.data
          this.loadedItems = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async deleteItem () {
      if (!window.confirm(`${this.inputName}を削除しようとしています。よろしいですか？`)) return

      this.manageState = 'deleting'
      /* 商品を削除 */
      await AwsUtil.del('CouposAPI', 'items/' + this.selectedItem.id)
        .then(response => {
          console.log('商品を削除 ' + this.selectedItem.id + ' : ' + response.status)
          this.manageState = 'deleted'
          this.selectedItem = null
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('削除に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'selected'
        })

      /* 商品リストを更新 */
      this.loadedItems = false
      AwsUtil.get('CouposAPI', 'items')
        .then(response => {
          console.log('商品を取得 : ' + response.status)
          this.items = response.data
          this.loadedItems = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    openEditCategory () {
      this.catFormName = this.categories[this.selectedCategory].name
      this.catFormColor = this.categories[this.selectedCategory].color

      this.modalState = 'edit'
    },
    openAddCategory () {
      this.catFormName = ''
      this.catFormColor = '#cccccc'

      this.modalState = 'add'
    },
    async editCategory () {
      if (this.catFormName.length < 1) {
        this.$refs.errorMessage.pushMessage('カテゴリー名を入力してください。')
        return false
      } else if (this.catFormName.length > 20) {
        this.$refs.errorMessage.pushMessage('カテゴリー名は20文字以内で入力してください。')
        return false
      }
      if (this.catFormColor.length !== 7) {
        this.$refs.errorMessage.pushMessage('テーマカラーが正しくありません。')
        return false
      }

      this.modalState = 'editing'
      /* カテゴリーを追加 */
      await AwsUtil.put('CouposAPI', 'categories/' + this.selectedCategory, {
        name: this.catFormName,
        color: this.catFormColor
      })
        .then(response => {
          console.log('カテゴリーを更新 : ' + response.status)
          this.modalState = 'edited'
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('更新に失敗しました。しばらくしてからもう一度お試しください。')
          this.modalState = 'edit'
        })

      /* カテゴリーリストを更新 */
      this.loadedCategories = false
      AwsUtil.get('CouposAPI', 'categories')
        .then(response => {
          console.log('カテゴリーを取得 : ' + response.status)
          this.categories = response.data
          this.loadedCategories = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async deleteCategory () {
      this.modalState = 'deleting'
      /* カテゴリーを追加 */
      await AwsUtil.del('CouposAPI', 'categories/' + this.selectedCategory)
        .then(response => {
          console.log('カテゴリーを削除 : ' + response.status)
          this.selectedCategory = ''
          this.modalState = 'deleted'
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('削除に失敗しました。しばらくしてからもう一度お試しください。')
          this.modalState = 'edit'
        })

      /* カテゴリーリストを更新 */
      this.loadedCategories = false
      AwsUtil.get('CouposAPI', 'categories')
        .then(response => {
          console.log('カテゴリーを取得 : ' + response.status)
          this.categories = response.data
          this.loadedCategories = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async addCategory () {
      if (this.catFormName.length < 1) {
        this.$refs.errorMessage.pushMessage('カテゴリー名を入力してください。')
        return false
      } else if (this.catFormName.length > 20) {
        this.$refs.errorMessage.pushMessage('カテゴリー名は20文字以内で入力してください。')
        return false
      }
      if (this.catFormColor.length !== 7) {
        this.$refs.errorMessage.pushMessage('テーマカラーが正しくありません。')
        return false
      }

      this.modalState = 'adding'
      /* カテゴリーを追加 */
      await AwsUtil.post('CouposAPI', 'categories', {
        name: this.catFormName,
        color: this.catFormColor
      })
        .then(response => {
          console.log('カテゴリーを追加 : ' + response.status)
          this.modalState = 'added'
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('追加に失敗しました。しばらくしてからもう一度お試しください。')
          this.modalState = 'add'
        })

      /* カテゴリーリストを更新 */
      this.loadedCategories = false
      AwsUtil.get('CouposAPI', 'categories')
        .then(response => {
          console.log('カテゴリーを取得 : ' + response.status)
          this.categories = response.data
          this.loadedCategories = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    }
  },
  filters: {
    addComma (val) {
      return val.toLocaleString()
    }
  },
  created () {
    AwsUtil.get('CouposAPI', 'categories')
      .then(response => {
        console.log('カテゴリーを取得 : ' + response.status)
        this.categories = response.data
        this.loadedCategories = true
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
    AwsUtil.get('CouposAPI', 'items')
      .then(response => {
        console.log('商品を取得 : ' + response.status)
        this.items = response.data
        this.loadedItems = true
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flexbox {
  margin: 1rem 0;
}

/* 商品リスト */

#item-list {
  flex: 1 1 0;
}

#item-list #search {
  display: flex;

  padding: 0.7rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

#item-list #search img {
  flex: 0 0 auto;

  height: 1.75rem;
}

#item-list #search input {
  flex: 1 1 auto;

  height: 1.75rem;
  padding: 0 .2rem;
  margin-top: 1px;
  margin-left: 0.5rem;
  margin-bottom: -1px; /* ボーダー補正 */
  border-bottom: 1px solid transparent;

  font-size: 1rem;
  line-height: 1.75rem;
}
#item-list #search input:focus {
  border-bottom: 1px solid #FCA919;
}

.loading {
  padding: 3rem;

  font-size: 3rem;
  text-align: center;
  color: #555;
}

/* カテゴリーモーダル */

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;

  background-color: rgba(0, 0, 0, .7);
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2;

  width: 400px;
  padding: 20px;
  border-radius: 5px;

  transform: translate(-50%, -50%);
  background-color: #fff;
}
.modal .close {
  position: absolute;
  top: 15px;
  right: 15px;

  width: 1.7rem;
  height: 1.7rem;

  font-size: 1.5rem;
  line-height: 1.7rem;
  text-align: center;
  cursor: pointer;
  vertical-align: middle;
}
.modal .close svg {
  height: 1.7rem;
}
.modal .props {
  margin: 0 auto;
}
.modal h3 {
  margin-bottom: 1rem;

  font-size: 1.5rem;
  text-align: center;
}
.modal.form input {
  width: 100%;
  padding: 0 0.5rem;
  border: 1px solid #ccc;
}
.modal .icon .circle {
  width: 100px;
  height: 100px;
  margin: 2rem auto 1rem auto;
  border-radius: 50%;

  font-size: 50px;
  color: #fff;
  background-color: #FCA919;
  text-align: center;
}
.modal .circle svg {
  margin: 25px;
}

/* 管理パネル */

#manage-pane {
  flex: 1 1 0;

  margin-left: 1rem;
}
#manage-pane h2 {
  width: 100%;
  padding: 0 0.5rem;
  margin-bottom: 1rem;

  font-size: 1.1rem;
  line-height: 2em;

  color: #fff;
  background-color: #555;
}
#manage-pane .message p {
  margin: 0 0.5rem;
}
.form .itemname {
  font-size: 1.2rem;
  line-height: 1.3em;
}
.form .itemid {
  font-size: 0.9rem;
  line-height: 1.5em;
  color: #777;
}
.form .props {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-auto-rows: 50px;
  grid-gap: 0.7rem;

  margin-top: 0.5rem;
}
.form .props div.name {
  display: flex;
  align-items: center;
}
.form .props div.name h4 {
  font-weight: bold;
  font-size: 1rem;
  line-height: 1.4rem;
}
.form .props div.value {
  display: flex;
  align-items: center;
}
.form .props div.value.itemid .vue-js-switch {
  flex: 0 0 auto;

  height: 28px;
  margin-right: 1rem;
}
.form .props div.value.itemid input {
  flex: 1 1 auto;
}
.form .props div.color {
  flex: 0 0 auto;

  width: 2rem;
  height: 2rem;
  margin-right: 0.8rem;
  border-radius: 25%;
}
.form .props span.unit {
  margin-right: 0.2em;

  font-size: 1rem;
}
.form .select {
  position: relative;
}
.form .select select {
  padding: 0 1.5rem 0 0.5rem;
  border: 1px solid #ccc;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 2rem;
}
.form .select .down-arrow {
  position: absolute;
  top: 0;
  right: 0.5rem;

  height: 2rem;

  font-size: 1rem;
  pointer-events: none;
}
.form input {
  border: 1px solid #ccc;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 2rem;
}
.form .button.edit-cat {
  width: 2rem;
  height: 2rem;
  margin: 0 0 0 1rem;
  padding: 0 0.5rem;
  border-radius: 50%;

  font-size: 1rem;
  line-height: 2rem;
  color: #fff;
  background-color: hsl(222, 100%, 61%);
  text-align: center;
}
.form .button.edit-cat:hover {
  background-color: hsl(222, 100%, 64%);
}
.form .button.edit-cat.disabled {
  background-color: hsl(0, 0%, 72%);
  box-shadow: none;
}
.form .button.edit-cat.disabled:hover {
  background-color: hsl(0, 0%, 72%);
  box-shadow: none;
}
.form .button.add-cat {
  width: 2rem;
  height: 2rem;
  margin: 0 0 0 0.5rem;
  padding: 0 0.5rem;
  border-radius: 50%;

  font-size: 1rem;
  line-height: 2rem;
  color: #fff;
  background-color: hsl(0, 100%, 63%);
  text-align: center;
}
.form .button.add-cat:hover {
  background-color: hsl(0, 100%, 66%);
}
.form .itemid input, .form .itemname input {
  width: 100%;
  padding: 0 0.5rem;
}
.form .price input {
  width: 7rem;
  padding: 0 0 0 0.2rem;
}
.form .actions {
  margin: 1.2rem 0 0 0;

  text-align: center;
}
.form .button.add {
  margin: 0;
  padding-left: 5rem;
  padding-right: 5rem;

  background-color: hsl(0, 100%, 63%);
  box-shadow: 0 3px 0 hsl(0, 100%, 38%);
}
.form .button.add:hover {
  background-color: hsl(0, 100%, 66%);
  box-shadow: 0 3px 0 hsl(0, 100%, 43%);
}
.form .button.add:active {
  box-shadow: none;
}
.form .button.update {
  margin: 0 1rem 0 0;
  padding-left: 5rem;
  padding-right: 5rem;

  background-color: hsl(38, 96%, 53%);
  box-shadow: 0 3px 0 hsl(38, 96%, 38%);
}
.form .button.update:hover {
  background-color: hsl(38, 96%, 60%);
  box-shadow: 0 3px 0 hsl(38, 96%, 43%);
}
.form .button.update:active {
  box-shadow: none;
}
.form .button.delete {
  margin: 0;
  padding-left: 1.5rem;
  padding-right: 1.5rem;

  background-color: hsl(222, 100%, 61%);
  box-shadow: 0 3px 0 hsl(222, 100%, 46%);
}
.form .button.delete:hover {
  background-color: hsl(222, 100%, 66%);
  box-shadow: 0 3px 0 hsl(222, 100%, 51%);
}
.form .button.delete:active {
  box-shadow: none;
}
.form .button.disabled {
  background-color: hsl(0, 0%, 72%);
  box-shadow: 0 3px 0 hsl(0, 0%, 52%);
  cursor: default;
}
.form .button.disabled:hover {
  background-color: hsl(0, 0%, 72%);
  box-shadow: 0 3px 0 hsl(0, 0%, 52%);
}
.form .button.disabled:active {
  top: 0;
}

@media screen and (max-width:600px) {
  .flexbox {
    display: block;
  }

  .modal {
    left: 0;

    width: 100%;
    border-radius: 0;

    transform: translate(0, -50%);
  }

  #manage-pane {
    margin-left: 0;
    margin-top: 1rem;
    border-top: 1px solid #ccc;
    padding-top: 1rem;
  }
}
</style>
