<template>
  <div>
    <ErrorMessage ref="errorMessage"></ErrorMessage>
    <div v-if="staffModal || closed" class="overlay" @click="moveToSelect()"></div>
    <div v-if="staffModal" id="staff-modal">
      <h2>担当スタッフを選択</h2>
      <div class="select" v-if="loadedStaffs">
        <div v-if="Object.keys(staffs).length < 1">
          <p>スタッフがまだ追加されていません。</p>
          <router-link class="button" :to="{ name: 'StaffManager' }">スタッフ管理</router-link>
        </div>
        <div v-else>
          <select v-model="selectedStaff">
            <option disabled :value="null">選択してください</option>
            <!-- <option v-for="(staff, name) in staffs" :disabled="staff.state !== 'offline'" :value="name" :key="name">{{ name }}</option> -->
            <option v-for="(staff, name) in staffs" :value="name" :key="name">{{ name }}</option>
          </select>
          <font-awesome-icon class="down-arrow" :icon="['fas', 'caret-down']"></font-awesome-icon>
        </div>
      </div>
      <div v-else class="loading">
        <font-awesome-icon :icon="['fas', 'spinner']" pulse></font-awesome-icon>
      </div>
      <a class="button select" :class="{ disabled: !loadedStaffs || Object.keys(staffs).length < 1 }" @click="loadedStaffs && Object.keys(staffs).length > 0 && openRegister()"><font-awesome-icon v-if="openingRegister" :icon="['fas', 'spinner']" pulse style="margin-right: 0.5rem"></font-awesome-icon>売上登録へ</a>
    </div>
    <div v-if="closed" id="closed-modal">
      <h2>レジ休止中</h2>
      <p>このレジは現在休止中です。</p>
      <a class="button select" @click="openRegister()">休止状態を解除</a>
    </div>
    <div class="flexbox">
      <div id="item-list">
        <div id="search">
          <img src="../assets/barcode.png" />
          <input v-model="searchStr" @keyup.enter="searchItemOrCoupon(searchStr)" placeholder="クーポンのバーコードをスキャン" />
        </div>
        <ItemGrid v-show="loadedItems && loadedCategories" :items="items" @select="selectItem($event)"></ItemGrid>
        <div v-show="!loadedItems || !loadedCategories" class="loading">
          <font-awesome-icon :icon="['fas', 'spinner']" pulse></font-awesome-icon>
        </div>
      </div>
      <div id="selected-list">
        <div id="staff-bar">
          <div class="staff">
            <span>担当者</span>
            <span style="font-weight: bold">{{ selectedStaff }}</span>
          </div>
          <div class="space"></div>
          <div class="close">
            <div class="btn" :class="{ disabled: this.selectedItems.length > 0 || this.selectedCoupons.length > 0 || this.state !== 'select' }" @click="closeRegister()">レジを休止</div>
          </div>
        </div>
        <div class="item">
          <h2>商品</h2>
          <ul>
            <li v-for="item in selectedItems" :key="item.id">
              <div class="name">{{ item.name }}</div>
              <div class="price">¥{{ item.price * item.num | addComma }}</div>
              <div class="num">
                <input type="number" v-model.number="item.num" min="0" />
              </div>
              <div class="delete" @click="unselectItem(item.id)"><font-awesome-icon :icon="['fas', 'trash-alt']"></font-awesome-icon></div>
            </li>
          </ul>
        </div>
        <div class="coupon">
          <h2>クーポン</h2>
          <ul>
            <li v-for="(coupon, ind) in selectedCoupons" :key="'sc' + ind">
              <div class="name">{{ couponTypes[coupon.type].name }}</div>
              <div class="value">{{ couponTypes[coupon.type].unit === 'yen' ? '¥-' : '-'}}{{ couponTypes[coupon.type].value }}{{ couponTypes[coupon.type].unit === 'per' ? '%' : ''}}</div>
              <div class="effect-type">{{ couponTypes[coupon.type].target === null ? '小計値引' : (couponTypes[coupon.type].target.length > 0 ? ' 指定商品から' : ' 全商品') + '単品値引' }}</div>
              <div class="detail" @click="showCouponDetail(coupon.id)"><font-awesome-icon :icon="['fas', 'info-circle']"></font-awesome-icon></div>
              <div class="delete" @click="unselectCoupon(coupon.id)"><font-awesome-icon :icon="['fas', 'trash-alt']"></font-awesome-icon></div>
            </li>
          </ul>
        </div>
        <div id="sale-button-wrapper">
          <a class="button sale" :class="{ 'disabled': selectedItems.length < 1 }" @click="moveToReceive()">
            <span class="title">お会計</span>
            <span class="total">¥{{ total | addComma }}</span>
          </a>
        </div>
      </div>
      <div class="overlay" v-if="modalCoupon" @click="modalCoupon = null"></div>
      <CouponModal v-if="modalCoupon" :coupon="modalCoupon" @close="modalCoupon = null"></CouponModal>
    </div>
    <div v-if="state === 'receive'" id="receive">
      <div class="overlay" @click="moveToSelect()"></div>
      <div class="modal">
        <div class="value-grid">
          <div class="total title">
            合計
          </div>
          <div class="total value">
            <span>¥</span>{{ total }}
          </div>
          <div class="receive title">
            お預かり
          </div>
          <div class="receive value">
            <span>¥</span>
            <div>
              <input type="number" v-model.number="receiveVal" />
            </div>
          </div>
        </div>
        <div class="buttons">
          <a class="button" id="shortcut-1000" @click="buttonPressed('shortcut-1000')">{{ total % 1000 === 0 ? total : Math.floor(total / 1000) * 1000 + 1000 }}</a>
          <a class="button" id="allclear" @click="buttonPressed('allclear')">AC</a>
          <a class="button" id="backspace" @click="buttonPressed('backspace')"><font-awesome-icon :icon="['fas', 'backspace']"></font-awesome-icon></a>
          <a class="button" id="key7" @click="buttonPressed(7)">7</a>
          <a class="button" id="key8" @click="buttonPressed(8)">8</a>
          <a class="button" id="key9" @click="buttonPressed(9)">9</a>
          <a class="button" id="key4" @click="buttonPressed(4)">4</a>
          <a class="button" id="key5" @click="buttonPressed(5)">5</a>
          <a class="button" id="key6" @click="buttonPressed(6)">6</a>
          <a class="button" id="key1" @click="buttonPressed(1)">1</a>
          <a class="button" id="key2" @click="buttonPressed(2)">2</a>
          <a class="button" id="key3" @click="buttonPressed(3)">3</a>
          <a class="button" id="key0" @click="buttonPressed(0)">0</a>
          <a class="button" id="key00" @click="buttonPressed('00')">00</a>
        </div>
        <div class="actions">
          <a class="cancel" @click="moveToSelect()">キャンセル</a>
          <a class="button register" @click="registerSale()">売上を登録</a>
        </div>
      </div>
    </div>
    <div v-if="state === 'register'" id="register">
      <div class="overlay"></div>
      <div class="loading">
        <font-awesome-icon :icon="['fas', 'spinner']" pulse></font-awesome-icon>
      </div>
    </div>
    <div v-if="state === 'change'" id="change">
      <div class="overlay" @click="moveToSelect()"></div>
      <div class="modal">
        <div class="icon">
          <div class="circle">
            <font-awesome-icon :icon="['fas', 'check']"></font-awesome-icon>
          </div>
        </div>
        <h3 class="changeTitle">お釣り</h3>
        <div class="changeVal"><span>¥</span>{{ receiveVal - total }}</div>
        <div class="wrapper">
          <a class="button complete" @click="completeSale()">完了</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'
import ItemGrid from './ItemGrid'
import CouponModal from './CouponModal'
import ErrorMessage from './ErrorMessage'

export default {
  name: 'Sale',
  components: {
    ItemGrid,
    CouponModal,
    ErrorMessage
  },
  data () {
    return {
      items: {},
      categories: {},
      couponTypes: {},
      loadedItems: false,
      loadedCategories: false,
      searchStr: '',
      selectedItems: [],
      selectedCoupons: [],
      modalCoupon: null,
      receiveVal: 0,
      initReceiveVal: false,
      state: 'select',
      staffs: {},
      loadedStaffs: false,
      selectedStaff: null,
      openingRegister: false,
      staffModal: true,
      closed: false,
      typing: false
    }
  },
  computed: {
    total () {
      let itemsCopy = []
      let couponsCopy = JSON.parse(JSON.stringify(this.selectedCoupons))
      let totalNum = 0
      let subNumFromTotal = 0
      let subPerFromTotal = 1

      /* 商品を展開 */
      this.selectedItems.forEach(item => {
        for (let i = 0; i < item.num; i++) {
          itemsCopy.push({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            effected: false
          })
        }
      })

      /* 商品をソート */
      itemsCopy.sort((a, b) => {
        return b.price - a.price
      })

      /* クーポンをソート */
      couponsCopy.sort((a, b) => {
        if (a.target !== null) return -1
        else if (b.target !== null) return 1
        return 0
      })
      couponsCopy.sort((a, b) => {
        if (a.unit === 'yen' && b.unit === 'per') return -1
        else if (a.unit === 'per' && b.unit === 'yen') return 1
        return 0
      })

      /* クーポン適用値を計算 */
      couponsCopy.forEach(coupon => {
        if (this.couponTypes[coupon.type].target === null) {
          /* 小計値引 */
          if (this.couponTypes[coupon.type].unit === 'yen') {
            subNumFromTotal += this.couponTypes[coupon.type].value
          } else {
            subPerFromTotal *= 1 - this.couponTypes[coupon.type].value / 100
          }
        } else {
          /* 単品値引 */
          for (let i = 0; i < itemsCopy.length; i++) {
            /* 全商品対象もしくは対象商品 かつ未適用商品なら適用 */
            if ((this.couponTypes[coupon.type].target.length < 1 || this.couponTypes[coupon.type].target.indexOf(itemsCopy[i].id) > -1) && !itemsCopy[i].effected) {
              if (this.couponTypes[coupon.type].unit === 'yen') {
                itemsCopy[i].price = itemsCopy[i].price > this.couponTypes[coupon.type].value ? itemsCopy[i].price - this.couponTypes[coupon.type].value : 0
              } else {
                itemsCopy[i].price *= 1 - this.couponTypes[coupon.type].value / 100
              }
              itemsCopy[i].effected = true
              break
            }
          }
        }
      })

      /* クーポン適用後合計値計算 */
      itemsCopy.forEach(item => {
        totalNum += item.price
      })

      /* 小計値引適用 */
      totalNum *= subPerFromTotal
      totalNum -= subNumFromTotal
      return totalNum >= 0 ? Math.ceil(totalNum) : 0
    }
  },
  methods: {
    selectItem (id) {
      let duplicate = false
      let index

      this.selectedItems.forEach((item, ind) => {
        if (item.id === id) {
          duplicate = true
          index = ind
        }
      })

      if (duplicate) {
        this.$set(this.selectedItems[index], 'num', ++this.selectedItems[index].num)
      } else {
        this.selectedItems.push({
          id,
          name: this.items[id].name,
          category: this.items[id].category,
          price: this.items[id].price,
          num: 1
        })
      }

      if (!this.typing) {
        this.changeStateToTyping()
      }
    },
    unselectItem (id) {
      let exist = false
      let index

      this.selectedItems.forEach((item, ind) => {
        if (item.id === id) {
          exist = true
          index = ind
        }
      })

      if (exist) {
        this.selectedItems.splice(index, 1)
      } else {
        console.log('unselectItem(): ' + id + ' は選択されていません')
      }
    },
    unselectCoupon (id) {
      let exist = false
      let index

      this.selectedCoupons.forEach((coupon, ind) => {
        if (coupon.id === id) {
          exist = true
          index = ind
        }
      })

      if (exist) {
        this.selectedCoupons.splice(index, 1)
      } else {
        console.log('unselectCoupon(): ' + id + ' は選択されていません')
      }
    },
    searchItemOrCoupon (string) {
      let flag = false
      let itemId

      string = string.trim()
      this.searchStr = ''

      Object.keys(this.items).forEach(id => {
        if (id === string) {
          flag = true
          itemId = id
        }
      })

      if (flag) {
        /* アイテム */
        this.selectItem(itemId)

        if (!this.typing) {
          this.changeStateToTyping()
        }
      } else {
        /* クーポン */
        AwsUtil.get('CouposAPI', 'coupons/' + string)
          .then(response => {
            console.log('クーポンを取得 : ' + response.status)
            let coupon = response.data

            if (this.couponTypes[coupon.type] === undefined) {
              this.$refs.errorMessage.pushMessage('クーポンタイプが見つかりません')
            }

            if (coupon.left_times !== null && coupon.left_times < 1) {
              this.$refs.errorMessage.pushMessage('このクーポンは既に使用されています')
            } else if (Date.parse(coupon.expire_time) < Date.now() + 32400000) {
              let expire = new Date(coupon.expire_time)
              this.$refs.errorMessage.pushMessage(`このクーポンは使用期限が過ぎています (${expire.getUTCFullYear()}年${expire.getUTCMonth() + 1}月${expire.getUTCDate()}日 ${expire.getUTCHours()}時${expire.getUTCMinutes()}分${expire.getUTCSeconds()}秒)`)
            } else {
              flag = false
              this.selectedCoupons.forEach(c => {
                if (c.concurrent < this.selectedCoupons.length + 1) flag = true
              })
              if (flag || this.couponTypes[coupon.type].concurrent < this.selectedCoupons.length + 1) {
                this.$refs.errorMessage.pushMessage('同時使用可能枚数を超えてしまうため使用できません')
                return
              }

              this.selectedCoupons.push(coupon)

              if (!this.typing) {
                this.changeStateToTyping()
              }
            }
          })
          .catch(error => {
            console.log(JSON.stringify(error))
            if (error.response.status === 404) {
              this.$refs.errorMessage.pushMessage('クーポンが見つかりませんでした')
            } else if (error.response.status === 403) {
              this.$refs.errorMessage.pushMessage('このクーポンショートコードは無効です。クーポンページを再表示してください。')
            } else {
              this.$refs.errorMessage.pushMessage('申し訳ございません、問題が発生しました。もう一度お試しください。')
              console.log(JSON.stringify(error))
            }
          })
      }
    },
    changeStateToTyping () {
      this.typing = true

      AwsUtil.put('CouposAPI', 'staffs/' + this.selectedStaff, {
        state: 'typing'
      })
        .then(response => {
          console.log('レジの状態を更新 : ' + response.status)
          this.staffModal = false
          this.closed = false
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    showCouponDetail (id) {
      console.log(id)
      let coupon
      this.selectedCoupons.forEach(c => {
        if (c.id === id) coupon = c
      })
      if (coupon === undefined) return

      let expire = new Date(coupon.expire_time)
      coupon.expire_time_year = expire.getUTCFullYear()
      coupon.expire_time_month = expire.getUTCMonth() + 1
      coupon.expire_time_date = expire.getUTCDate()
      coupon.expire_time_hours = expire.getUTCHours()
      coupon.expire_time_minutes = expire.getUTCMinutes()
      coupon.expire_time_seconds = expire.getUTCSeconds()

      this.modalCoupon = coupon
    },
    moveToSelect () {
      this.state = 'select'
    },
    moveToReceive () {
      if (this.state !== 'select') return
      if (this.selectedItems.length === 0) return

      let uneffectedCoupon = false
      let totalCoupon = 0
      this.selectedCoupons.forEach(coupon => {
        if (coupon.target === null) {
          totalCoupon++
        } else if (coupon.target.length > 0) {
          let filteredTarget = coupon.target.filter(target => {
            let ret = false
            this.selectedItems.forEach(item => {
              if (item.id === target.id) ret = true
            })
            return ret
          })
          if (filteredTarget.length < 1) {
            uneffectedCoupon = true
          }
        }
      })
      if (uneffectedCoupon) {
        this.$refs.errorMessage.pushMessage('効果が発生しないクーポンがあります')
        return
      } else if (totalCoupon > 1) {
        this.$refs.errorMessage.pushMessage('小計値引クーポンは併用できません')
      }

      this.state = 'receive'
      this.receiveVal = this.total
      this.initReceiveVal = true
    },
    buttonPressed (button) {
      if (button === 'shortcut-1000') this.receiveVal = this.total % 1000 === 0 ? this.total : Math.floor(this.total / 1000) * 1000 + 1000
      else if (button === 'allclear') this.receiveVal = 0
      else if (button === 'backspace') this.receiveVal = Math.floor(this.receiveVal / 10)
      else if (button === '00') this.receiveVal = this.receiveVal > 0 && !this.initReceiveVal ? this.receiveVal * 100 : 0
      else this.receiveVal = this.receiveVal > 0 && !this.initReceiveVal ? this.receiveVal * 10 + button : button

      this.initReceiveVal = false
    },
    registerSale () {
      if (this.selectedItems.length === 0) return
      if (this.total > this.receiveVal) return

      this.state = 'register'

      let items = {}
      this.selectedItems.forEach(item => {
        items[item.id] = item.num
      })

      let coupons = []
      this.selectedCoupons.forEach(coupon => {
        coupons.push(coupon.id)
      })

      AwsUtil.post('CouposAPI', 'sales', {
        items,
        coupons,
        total_val: this.total,
        payment_val: this.receiveVal,
        change_val: this.receiveVal - this.total,
        saled_by: this.selectedStaff
      })
        .then(response => {
          console.log('売上を登録 : ' + response.status)
          this.state = 'change'
          this.typing = false

          AwsUtil.put('CouposAPI', 'staffs/' + this.selectedStaff, {
            state: 'waiting'
          })
            .then(response => {
              console.log('レジの状態を更新 : ' + response.status)
              this.staffModal = false
              this.closed = false
            })
            .catch(error => {
              console.log(JSON.stringify(error))
            })
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.state = 'receive'
        })
    },
    completeSale () {
      this.state = 'select'
      this.selectedItems = []
      this.selectedCoupons = []
    },
    openRegister () {
      this.openingRegister = true
      AwsUtil.put('CouposAPI', 'staffs/' + this.selectedStaff, {
        state: 'waiting'
      })
        .then(response => {
          console.log('レジの状態を更新 : ' + response.status)
          this.staffModal = false
          this.closed = false
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    closeRegister () {
      if (this.selectedItems.length > 0 || this.selectedCoupons.length > 0 || this.state !== 'select') {
        return
      }

      AwsUtil.put('CouposAPI', 'staffs/' + this.selectedStaff, {
        state: 'closed'
      })
        .then(response => {
          console.log('レジを休止 : ' + response.status)
          this.closed = true
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
    window.addEventListener('beforeunload', () => {
      if (!this.selectedStaff) return

      AwsUtil.put('CouposAPI', 'staffs/' + this.selectedStaff, {
        state: 'offline'
      })
        .then(response => {
          console.log('レジをオフライン : ' + response.status)
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    })

    AwsUtil.get('CouposAPI', 'categories')
      .then(response => {
        console.log('カテゴリを取得 : ' + response.status)
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
    AwsUtil.get('CouposAPI', 'coupons/types')
      .then(response => {
        console.log('クーポンタイプを取得 : ' + response.status)
        this.couponTypes = response.data
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
    AwsUtil.get('CouposAPI', 'staffs')
      .then(response => {
        console.log('スタッフを取得 : ' + response.status)
        this.staffs = response.data
        this.loadedStaffs = true
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
  },
  beforeDestroy () {
    if (this.selectedStaff === null) {
      return
    }

    AwsUtil.put('CouposAPI', 'staffs/' + this.selectedStaff, {
      state: 'offline'
    })
      .then(response => {
        console.log('レジをオフライン : ' + response.status)
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

/* スタッフ選択 */

#staff-modal, #closed-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2;

  padding: 1rem 2rem;
  border-radius: 5px;

  background-color: #fff;
  transform: translate(-50%, -50%);
  text-align: center;
}
#staff-modal h2, #closed-modal h2 {
  font-size: 1.7rem;
  color: #444;
}
#closed-modal p {
  font-size: 1rem;
  line-height: 1.75em;
}
#staff-modal .select {
  position: relative;
  display: inline-block;

  margin: 1rem 0;
}
#staff-modal .select select {
  padding: 0 1.5rem 0 0.5rem;
  border: 1px solid #ccc;
  border-radius: 3px;

  color: #444;
  background-color: #fff;
  font-size: 1rem;
  line-height: 2em;
}
#staff-modal .select .down-arrow {
  position: absolute;
  top: 0;
  right: 0.5rem;

  height: 2rem;

  font-size: 1rem;
  pointer-events: none;
}
#staff-modal .button {
  width: 100%;
}
#staff-modal .button.disabled {
  background-color: hsl(0, 0%, 72%);
  box-shadow: 0 3px 0 hsl(0, 0%, 52%);
  cursor: default;
}
#staff-modal .button.disabled:hover {
  background-color: hsl(0, 0%, 72%);
  box-shadow: 0 3px 0 hsl(0, 0%, 52%);
}
#staff-modal .button.disabled:active {
  top: 0;
}

/* 商品リスト */

#item-list {
  flex: 1 1 0;
}

#item-list #search {
  display: flex;
  align-items: center;

  height: 3.2rem;
  margin-bottom: 1rem;
  padding: 0 0.7rem;
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

#selected-list {
  flex: 1 1 0;

  margin-left: 1rem;
}

#staff-bar {
  display: flex;
  align-items: center;

  width: 100%;
  height: 3.2rem;
  margin-bottom: 1rem;
  padding: 0 0.5rem 0.5rem 0.5rem;
  border-bottom: 1px solid #ccc;

  background-color: #fff;
}
#staff-bar .staff {
  position: relative;
}
#staff-bar .staff select {
  padding: 0 1.5rem 0 0.5rem;
  border: 1px solid #ccc;
  border-radius: 3px;

  color: #444;
  background-color: #fff;
  font-size: 1rem;
  line-height: 2em;
}
#staff-bar .staff .down-arrow {
  position: absolute;
  top: 0;
  right: 0.5rem;

  height: 2rem;

  font-size: 1rem;
  pointer-events: none;
}
#staff-bar .space {
  flex: 1 1 0;
}
#staff-bar .close {
  flex: 0 0 auto;
}
#staff-bar .close div {
  padding: 0 1rem;
  border-radius: 1rem;

  color: #fff;
  background-color: #F44336;
  font-size: 1rem;
  line-height: 2rem;
  cursor: pointer;
}
#staff-bar .close div:hover {
  background-color: hsl(4, 89%, 63%);
}
#staff-bar .close div.disabled {
  background-color: #aaa;
  cursor: default;
}

#selected-list h2 {
  width: 100%;
  padding: 0 0.5rem;

  font-size: 1.1rem;
  line-height: 2em;

  color: #fff;
  background-color: #555;
}

#selected-list .item ul {
  padding: 1rem 0.5rem;
}

#selected-list .item li {
  display: flex;

  padding: 0.7rem;
  margin-bottom: 0.5rem;
  border: 3px solid #e0e0e0;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 1.75em;
}
#selected-list .item li:last-child {
  margin-bottom: 0;
}

#selected-list .item li > div {
  margin-right: 0.7rem;
}
#selected-list .item li > div:last-child {
  margin-right: 0;
}

#selected-list .item li .name {
  flex: 1 1 auto;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#selected-list .item li .price {
  flex: 0 0 auto;

  font-weight: bold;
}

#selected-list .item li .num {
  flex: 0 0 auto;
}

#selected-list .item li .num input {
  width: 2.5rem;
  height: 1.75rem;
  padding-right: .3rem;
  border-bottom: 1px solid #ccc;

  text-align: right;
  font-size: 1rem;
  line-height: 1rem;
  font-weight: bold;
}

#selected-list .item li .delete {
  flex: 0 0 1.5rem;

  text-align: center;
  cursor: pointer;
}

#selected-list .coupon ul {
  padding: 1rem 0.5rem;
}

#selected-list .coupon li {
  display: flex;

  padding: 0.7rem;
  margin-bottom: 0.5rem;
  border: 3px solid #e0e0e0;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 1.75em;
}
#selected-list .coupon li:last-child {
  margin-bottom: 0;
}

#selected-list .coupon li > div {
  margin-right: 0.7rem;
}
#selected-list .coupon li > div:last-child {
  margin-right: 0;
}
#selected-list .coupon li .name {
  flex: 1 1 auto;
}
#selected-list .coupon li .value {
  flex: 0 0 auto;

  font-weight: bold;
}
#selected-list .coupon li .effect-type {
  flex: 0 0 auto;

  font-size: 0.95rem;
}
#selected-list .coupon li .detail {
  flex: 0 0 auto;

  font-size: 1rem;
  cursor: pointer;
}
#selected-list .coupon li .delete {
  flex: 0 0 1.5rem;

  text-align: center;
  cursor: pointer;
}

#selected-list .button {
  width: 100%;
  margin: 0;

  font-size: 1.4rem;
  background-color: hsl(0, 100%, 63%);
  box-shadow: 0 3px 0 hsl(0, 100%, 38%);
}
#selected-list .button:hover {
  background-color: hsl(0, 100%, 68%);
  box-shadow: 0 3px 0 hsl(0, 100%, 43%);
}
#selected-list .button:active {
  box-shadow: none;
}
#selected-list .button.disabled {
  font-size: 1.4rem;
  background-color: hsl(0, 0%, 72%);
  box-shadow: 0 3px 0 hsl(0, 0%, 52%);
  cursor: default;
}
#selected-list .button.disabled:active {
  top: 0;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;

  background-color: rgba(0, 0, 0, .7);
}

#receive .modal {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2;

  width: 360px;
  padding: 20px;
  border-radius: 5px;

  transform: translate(-50%, -50%);
  background-color: #fff;
}

#receive .modal .value-grid {
  display: grid;
  grid-column-gap: 1rem;
  grid-row-gap: 0.2rem;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;

  width: 260px;
  margin: 0 auto;
}

.value-grid .total.title, .value-grid .total.value {
  width: auto;

  font-size: 1.1rem;
}
.value-grid .total.value span {
  display: inline-block;

  width: 1rem;
}
.value-grid .receive.title, .value-grid .receive.value {
  width: auto;

  font-size: 1.25rem;
  font-weight: bold;
}
.value-grid .receive.value {
  display: flex;
}
.value-grid .receive.value span {
  display: inline-block;
  flex: 0 0 auto;

  width: 1rem;
}
.value-grid .receive.value div {
  flex: 1 1 50%;
}
.value-grid .receive.value input {
  width: 100%;

  font-size: 1.25rem;
  font-weight: bold;
}

#receive .modal .buttons {
  display: grid;
  grid-template: "sc ac bs" 40px
                 "k7 k8 k9" 60px
                 "k4 k5 k6" 60px
                 "k1 k2 k3" 60px
                 "k0 k0 k00" 60px
                 / 80px 80px 80px;
  grid-gap: 10px;

  width: 260px;
  margin: 1rem auto 2rem auto;
}

#receive .modal .buttons .button {
  padding: 0;
  margin: 0;
}

#shortcut-1000, #allclear, #backspace {
  font-size: 1.1rem;
  line-height: 40px;

  background-color: hsl(222, 100%, 62%);
  box-shadow: 0 3px 0 hsl(222, 100%, 42%);
}
#shortcut-1000:hover, #allclear:hover, #backspace:hover {
  background-color: hsl(222, 100%, 67%);
  box-shadow: 0 3px 0 hsl(222, 100%, 52%);
}
#shortcut-1000:active, #allclear:active, #backspace:active {
  box-shadow: none;
}
#key0, #key00, #key1, #key2, #key3, #key4, #key5, #key6, #key7, #key8, #key9 {
  font-size: 1.45rem;
  line-height: 60px;

  background-color: hsl(38, 97%, 54%);
  box-shadow: 0 3px 0 hsl(38, 97%, 40%);
}
#key0:hover, #key00:hover, #key1:hover, #key2:hover, #key3:hover, #key4:hover, #key5:hover, #key6:hover, #key7:hover, #key8:hover, #key9:hover {
  background-color: hsl(38, 97%, 59%);
  box-shadow: 0 3px 0 hsl(38, 97%, 45%);
}
#key0:active, #key00:active, #key1:active, #key2:active, #key3:active, #key4:active, #key5:active, #key6:active, #key7:active, #key8:active, #key9:active {
  box-shadow: none;
}

#receive .modal .buttons #key0 {
  grid-area: k0;
}

#receive .modal .actions {
  display: flex;
  align-items: center;
}

#receive .modal .actions .cancel {
  display: inline-block;
  flex: 1 1 33.3%;

  padding: 0.5rem 0;

  font-size: 0.9rem;
  color: #417AFF;
  text-align: center;
  cursor: pointer;
}

#receive .modal .actions .button.register {
  flex: 2 2 66.7%;

  margin: 0;
  padding-left: 0;
  padding-right: 0;

  background-color: #FF4747;
  box-shadow: 0 3px 0 hsl(0, 100%, 38%);
}
#receive .modal .actions .button.register:hover {
  background-color: hsl(0, 100%, 68%);
  box-shadow: 0 3px 0 hsl(0, 100%, 43%);
}
#receive .modal .actions .button.register:active {
  box-shadow: none;
}

#register .loading {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2;

  font-size: 3rem;
  text-align: center;
  color: #fff;
  transform: translate(-50%, -50%);
}

#change .modal {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2;

  width: 360px;
  padding: 20px;
  border-radius: 5px;

  transform: translate(-50%, -50%);
  background-color: #fff;
}

#change .icon .circle {
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem auto;
  border-radius: 50%;

  font-size: 50px;
  color: #fff;
  background-color: #FCA919;
  text-align: center;
}
#change .icon .circle svg {
  margin: 25px;
}

#change .changeTitle {
  margin-top: 1rem;

  font-size: 1.2rem;
  text-align: center;
}

#change .changeVal {
  font-size: 2rem;
  text-align: center;
}

#change .changeVal span {
  margin-right: 0.1rem;
}

#change .wrapper {
  text-align: center;
}

#change .button {
  margin: 1rem auto 0 auto;

  background-color: #FF4747;
  box-shadow: 0 3px 0 hsl(0, 100%, 38%);
}
#change .button:hover {
  background-color: hsl(0, 100%, 68%);
  box-shadow: 0 3px 0 hsl(0, 100%, 43%);
}
#change .button:active {
  box-shadow: none;
}

@media screen and (max-width:600px) {
  .flexbox {
    display: block;
  }

  #staff-modal, #closed-modal {
    left: 0;
    right: 0;

    padding: 1rem 2rem;
    border-radius: 0;

    transform: translate(0, -50%);
  }

  #item-list {
    width: 100%;
  }

  #selected-list {
    width: 100%;
    margin-left: 0;
    margin-top: 1rem;
    margin-bottom: 60px;
  }
  #staff-bar {
    height: 3.7rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 2px;
  }
  #sale-button-wrapper {
    position: fixed;
    bottom: 3px;
    left: 10px;

    width: calc(100% - 20px);
  }

  #receive .modal {
    left: 0;

    width: 100%;
    padding: 20px;
    border-radius: 0;

    transform: translate(0, -50%);
    background-color: #fff;
  }
  #receive .modal .value-grid {
    width: 100%;
  }
  #receive .modal .buttons {
    grid-template: "sc ac bs" 50px
                   "k7 k8 k9" 75px
                   "k4 k5 k6" 75px
                   "k1 k2 k3" 75px
                   "k0 k0 k00" 75px
                   / 1fr 1fr 1fr;

    width: 100%;
  }
  #shortcut-1000, #allclear, #backspace {
    line-height: 50px;
  }
  #key0, #key00, #key1, #key2, #key3, #key4, #key5, #key6, #key7, #key8, #key9 {
    line-height: 75px;
  }

  #change .modal {
    left: 0;

    width: 100%;
    border-radius: 0;

    transform: translate(0, -50%);
  }
}
</style>
