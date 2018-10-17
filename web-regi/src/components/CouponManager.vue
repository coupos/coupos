<template>
  <div>
    <ErrorMessage ref="errorMessage"></ErrorMessage>
    <div class="flexbox">
      <div id="coupon-list">
        <CouponList v-if="loadedCouponTypes && loadedCoupons" :couponGroups="couponsGroupedByCouponType" @clone="selectClone($event)" @selectType="selectCouponType($event)" @select="selectCoupon($event)" @add="selectNew()"></CouponList>
        <div v-else class="loading">
          <font-awesome-icon :icon="['fas', 'spinner']" pulse></font-awesome-icon>
        </div>
      </div>
      <div id="manage-pane">
        <div v-if="manageState === 'notselected'" class="message">
          <h2 class="title">クーポンデータ</h2>
          <p>
            クーポンが選択されていません。<br />
            左のリストからクーポンを選択してください。
          </p>
        </div>
        <div v-else-if="manageState === 'clone'" class="selected form">
          <h2 class="title">クーポンを追加</h2>
          <div class="props">
            <div class="name">
              <h4>クーポン名</h4>
            </div>
            <div class="value coupon-name">
              {{ input.name }}
            </div>
            <div class="name">
              <h4>値引値</h4>
            </div>
            <div class="value coupon-value">
              {{ input.value }}
              <span class="unit">{{ input.unit === 'yen' ? '円' : '％' }}</span>
            </div>
            <div class="name">
              <h4>値引方法</h4>
            </div>
            <div class="value">
              {{ input.target === null ? '小計値引' : '単品値引' }}
            </div>
            <div class="name">
              <h4>対象商品</h4>
            </div>
            <div class="value target">
              <span v-if="input.target === null">小計値引に対象商品は設定できません</span>
              <span v-else-if="input.target.length === 0">全商品</span>
              <ul v-else>
                <li v-for="itemId in input.target" :key="itemId"><span class="icon"><font-awesome-icon :icon="['fas', 'square']"></font-awesome-icon></span><span>{{ items[itemId].name }}</span></li>
              </ul>
            </div>
            <div class="name">
              <h4>上限回数</h4>
            </div>
            <div class="value">
              {{ input.limit_times_set ? input.limit_times : '無制限' }}
              <span v-if="input.limit_times_set" class="unit">回</span>
            </div>
            <div class="name">
              <h4>最大同時使用枚数</h4>
            </div>
            <div class="value">
              {{ input.concurrent }}
              <span class="unit">枚</span>
            </div>
            <div class="name">
              <h4>有効期限</h4>
            </div>
            <div class="value expire-time">
              <toggle-button v-model="input.expire_time_set" :height="28" sync />
              <input v-if="input.expire_time_set" v-model="input.expire_time" type="datetime-local" :min="new Date().toJSON().slice(0, 16)" max="2021-01-01T00:00" />
            </div>
          </div>
          <div class="actions">
            <a class="button add" :class="{ 'disabled': !validateForm }" @click="if (validateForm) addCoupon()">追加</a>
          </div>
        </div>
        <div v-else-if="manageState === 'addType'" class="selected form">
          <h2 class="title">クーポンタイプを追加</h2>
          <div class="props">
            <div class="name">
              <h4>クーポン名</h4>
            </div>
            <div class="value coupon-name">
              <input v-model="input.name" type="text" maxlength="30" />
            </div>
            <div class="name">
              <h4>値引値</h4>
            </div>
            <div class="value coupon-value">
              <input v-model.number="input.value" type="number" min="0" :max="input.unit === 'yen' ? null : 100" />
              <div class="select">
                <select v-model="input.unit" @change="if (input.unit === 'per' && input.value > 100) input.value = 100">
                  <option value="yen">円</option>
                  <option value="per">％</option>
                </select>
                <font-awesome-icon class="down-arrow" :icon="['fas', 'caret-down']"></font-awesome-icon>
              </div>
            </div>
            <div class="name">
              <h4>値引方法</h4>
            </div>
            <div class="value">
              <div class="select">
                <select v-model="input.method">
                  <option value="total">小計値引</option>
                  <option value="single">単品値引</option>
                </select>
                <font-awesome-icon class="down-arrow" :icon="['fas', 'caret-down']"></font-awesome-icon>
              </div>
            </div>
            <div class="name">
              <h4>対象商品</h4>
            </div>
            <div v-if="input.method === 'single'" class="value coupon-targets">
              <ItemPicker :items="items" :categories="categories" :selectedItems="input.target"></ItemPicker>
              <span style="margin-left: 0.5rem">{{ input.target.length === 0 ? '全' : input.target.length }}</span><span class="unit">商品</span><span>選択</span>
            </div>
            <div v-else class="value">
              小計値引に対象商品は設定できません
            </div>
            <div class="name">
              <h4>上限回数</h4>
            </div>
            <div class="value">
              <toggle-button v-model="input.limit_times_set" :height="28" sync />
              <div v-if="input.limit_times_set">
                <input v-model.number="input.limit_times" type="number" min="1" @change="if (input.left_times > input.limit_times) input.left_times = input.limit_times" />
                <span class="unit">回</span>
              </div>
              <input v-else type="text" value="無制限" disabled />
            </div>
            <div class="name">
              <h4>最大同時使用枚数</h4>
            </div>
            <div class="value">
              <input v-model.number="input.concurrent" type="number" min="1" />
              <span class="unit">枚</span>
            </div>
            <div class="name">
              <h4>デフォルト有効期限</h4>
            </div>
            <div class="value expire-time">
              <toggle-button v-model="input.expire_time_set" :height="28" sync />
              <input v-if="input.expire_time_set" v-model="input.expire_time" type="datetime-local" :min="new Date().toJSON().slice(0, 16)" max="2021-01-01T00:00" />
            </div>
          </div>
          <div class="actions">
            <a class="button add" :class="{ 'disabled': !validateForm }" @click="if (validateForm) addCouponType()">追加</a>
          </div>
        </div>
        <div v-else-if="manageState === 'selectedType'" class="selected form">
          <h2 class="title">クーポンタイプを編集</h2>
          <div class="props">
            <div class="name">
              <h4>クーポン名</h4>
            </div>
            <div class="value coupon-name">
              <input v-model="input.name" type="text" maxlength="30" />
            </div>
            <div class="name">
              <h4>値引値</h4>
            </div>
            <div class="value coupon-value">
              <input v-model.number="input.value" type="number" min="0" :max="input.unit === 'yen' ? null : 100" />
              <div class="select">
                <select v-model="input.unit" @change="if (input.unit === 'per' && input.value > 100) input.value = 100">
                  <option value="yen">円</option>
                  <option value="per">％</option>
                </select>
                <font-awesome-icon class="down-arrow" :icon="['fas', 'caret-down']"></font-awesome-icon>
              </div>
            </div>
            <div class="name">
              <h4>値引方法</h4>
            </div>
            <div class="value">
              <div class="select">
                <select v-model="input.method">
                  <option value="total">小計値引</option>
                  <option value="single">単品値引</option>
                </select>
                <font-awesome-icon class="down-arrow" :icon="['fas', 'caret-down']"></font-awesome-icon>
              </div>
            </div>
            <div class="name">
              <h4>対象商品</h4>
            </div>
            <div v-if="input.method === 'single'" class="value coupon-targets">
              <ItemPicker :items="items" :categories="categories" :selectedItems="input.target"></ItemPicker>
              <span style="margin-left: 0.5rem">{{ input.target.length === 0 ? '全' : input.target.length }}</span><span class="unit">商品</span><span>選択</span>
            </div>
            <div v-else class="value">
              小計値引に対象商品は設定できません
            </div>
            <div class="name">
              <h4>上限回数</h4>
            </div>
            <div class="value">
              <toggle-button v-model="input.limit_times_set" :height="28" sync />
              <div v-if="input.limit_times_set">
                <input v-model.number="input.limit_times" type="number" min="1" @change="if (input.left_times > input.limit_times) input.left_times = input.limit_times" />
                <span class="unit">回</span>
              </div>
              <input v-else type="text" value="無制限" disabled />
            </div>
            <div class="name">
              <h4>最大同時使用枚数</h4>
            </div>
            <div class="value">
              <input v-model.number="input.concurrent" type="number" min="1" />
              <span class="unit">枚</span>
            </div>
            <div class="name">
              <h4>デフォルト有効期限</h4>
            </div>
            <div class="value expire-time">
              <toggle-button v-model="input.expire_time_set" :height="28" sync />
              <input v-if="input.expire_time_set" v-model="input.expire_time" type="datetime-local" :min="new Date().toJSON().slice(0, 16)" max="2021-01-01T00:00" />
            </div>
          </div>
          <div class="actions">
            <a class="button update" :class="{ 'disabled': !validateForm }" @click="updateCouponType()">更新</a>
            <a class="button delete" @click="deleteCouponType()">削除</a>
          </div>
        </div>
        <div v-else-if="manageState === 'selected'" class="selected form">
          <h2 class="title">クーポンを編集</h2>
          <h3 class="couponName">{{ coupons[selectedCoupon].name }}</h3>
          <p class="itemid">ID {{ selectedCoupon }}</p>
          <div class="props">
            <div class="name">
              <h4>クーポン名</h4>
            </div>
            <div class="value coupon-name">
              {{ input.name }}
            </div>
            <div class="name">
              <h4>値引値</h4>
            </div>
            <div class="value coupon-value">
              {{ input.value }}
              <span class="unit">{{ input.unit === 'yen' ? '円' : '％' }}</span>
            </div>
            <div class="name">
              <h4>対象商品</h4>
            </div>
            <div class="value target">
              <span v-if="input.target === null || input.target.length === 0">全商品</span>
              <ul v-else>
                <li v-for="itemId in input.target" :key="itemId"><span class="icon"><font-awesome-icon :icon="['fas', 'square']"></font-awesome-icon></span><span>{{ items[itemId].name }}</span></li>
              </ul>
            </div>
            <div class="name">
              <h4>残り回数</h4>
            </div>
            <div class="value">
              <div v-if="input.limit_times_set">
                <input v-model.number="input.left_times" type="number" min="1" :max="input.limit_times" />
                <span class="unit">回</span>
              </div>
              <input v-else type="text" value="無制限" disabled />
            </div>
            <div class="name">
              <h4>上限回数</h4>
            </div>
            <div class="value">
              {{ input.limit_times_set ? input.limit_times : '無制限' }}
              <span v-if="input.limit_times_set" class="unit">回</span>
            </div>
            <div class="name">
              <h4>最大同時使用枚数</h4>
            </div>
            <div class="value">
              {{ input.concurrent }}
              <span class="unit">枚</span>
            </div>
            <div class="name">
              <h4>有効期限</h4>
            </div>
            <div class="value expire-time">
              <toggle-button v-model="input.expire_time_set" :height="28" sync />
              <input v-if="input.expire_time_set" v-model="input.expire_time" type="datetime-local" :min="new Date().toJSON().slice(0, 16)" max="2021-01-01T00:00" />
            </div>
          </div>
          <div class="actions">
            <a class="button update" :class="{ 'disabled': !validateForm }" @click="updateCoupon()">更新</a>
            <a class="button delete" @click="deleteCoupon()">削除</a>
          </div>
          <div id="cloned-coupon" style="margin-top: 2rem;">
            <div class="title"><span>QRコード</span></div>
            <div class="qr">
              <qriously :value="'https://coupos.net/coupons/' + selectedCoupon" :size="150"></qriously>
            </div>
            <div class="title"><span>URL</span></div>
            <div class="url">
              <input :value="'https://coupos.net/coupons/' + selectedCoupon" @focus="$event.target.select()" ref="couponUrlElm" spellcheck="false" />
              <div class="copy" @click="copyCouponUrl()">
                <font-awesome-icon :icon="['fas', 'copy']"></font-awesome-icon>コピー
                <div :class="{ show: showCopiedMessage }" id="copied-message">コピーしました</div>
              </div>
            </div>
          </div>
        </div>
        <CouponManagerProcessDisplay v-else :state="manageState">
          <div id="cloned-coupon" v-if="manageState === 'cloned'">
            <div class="title"><span>QRコード</span></div>
            <div class="qr">
              <qriously :value="'https://coupos.net/coupons/' + clonedCouponId" :size="150"></qriously>
            </div>
            <div class="title"><span>URL</span></div>
            <div class="url">
              <input :value="'https://coupos.net/coupons/' + clonedCouponId" @focus="$event.target.select()" ref="couponUrlElm" spellcheck="false" />
              <div class="copy" @click="copyCouponUrl()">
                <font-awesome-icon :icon="['fas', 'copy']"></font-awesome-icon>コピー
                <div :class="{ show: showCopiedMessage }" id="copied-message">コピーしました</div>
              </div>
            </div>
          </div>
        </CouponManagerProcessDisplay>
      </div>
    </div>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'
import ErrorMessage from './ErrorMessage'
import CouponList from './CouponList'
import ItemPicker from './ItemPicker'
import CouponManagerProcessDisplay from './CouponManagerProcessDisplay'

export default {
  name: 'CouponManager',
  components: {
    ErrorMessage,
    CouponList,
    ItemPicker,
    CouponManagerProcessDisplay
  },
  data () {
    return {
      couponTypes: {},
      coupons: {},
      items: {},
      categories: {},
      loadedCouponTypes: false,
      loadedCoupons: false,
      manageState: 'notselected',
      selectedCoupon: undefined,
      input: {
        name: '',
        value: 0,
        unit: 'yen',
        limit_times: 1,
        concurrent: 1,
        expire_time: new Date().toJSON().slice(0, 16),
        expire_time_set: false
      },
      clonedCouponId: null,
      showCopiedMessage: false
    }
  },
  computed: {
    couponsGroupedByCouponType () {
      let types = this.couponTypes

      Object.keys(types).forEach(typeId => {
        let findedCoupons = []

        Object.keys(this.coupons).forEach(couponId => {
          if (this.coupons[couponId].type === Number(typeId)) {
            let coupon = this.coupons[couponId]
            coupon.id = couponId
            findedCoupons.push(coupon)
          }
        })

        types[typeId].bindedCoupons = findedCoupons
        types[typeId].id = typeId
      })

      return types
    },
    validateForm () {
      let message = this.manageState === 'adding' || this.manageState === 'updating'

      if (this.manageState === 'clone' || this.manageState === 'selected') {
        if (!this.input.type) {
          if (message) this.$refs.errorMessage.pushMessage('クーポンタイプが設定されていません')
          return false
        }
        if (this.input.expire_time_set) {
          if (this.input.expire_time.length < 16) {
            if (message) this.$refs.errorMessage.pushMessage('有効期限を入力してください')
            return false
          } else if (new Date(this.input.expire_time).getTime() < new Date().getTime()) {
            if (message) this.$refs.errorMessage.pushMessage('有効期限は現在よりも未来で入力してください')
            return false
          }
        }
      } else if (this.manageState === 'addType' || this.manageState === 'selectedType') {
        if (this.input.name.length < 1) {
          if (message) this.$refs.errorMessage.pushMessage('クーポン名を入力してください')
          return false
        } else if (this.input.name.length > 30) {
          if (message) this.$refs.errorMessage.pushMessage('クーポン名は30文字以内で入力してください')
          return false
        }
        if (this.input.value < 1) {
          if (message) this.$refs.errorMessage.pushMessage('値引値は1以上で入力してください')
          return false
        }
        if (['yen', 'per'].indexOf(this.input.unit) < 0) {
          if (message) this.$refs.errorMessage.pushMessage('単位が不正です')
          return false
        } else if (this.input.unit === 'per' && this.input.value > 100) {
          if (message) this.$refs.errorMessage.pushMessage('値引率は100%以下で入力してください')
          return false
        }
        if (this.input.limit_times_set) {
          if (this.input.left_times < 0) {
            if (message) this.$refs.errorMessage.pushMessage('残り回数は0回以上で入力してください')
            return false
          } else if (this.input.left_times > this.input.limit_times) {
            if (message) this.$refs.errorMessage.pushMessage('残り回数は上限回数以下で入力してください')
            return false
          }
          if (this.input.limit_times < 1) {
            if (message) this.$refs.errorMessage.pushMessage('上限回数は1回以上で入力してください')
            return false
          }
        }
        if (this.input.concurrent < 1) {
          if (message) this.$refs.errorMessage.pushMessage('最大同時使用枚数は1枚以上で入力してください')
          return false
        }
        if (this.input.expire_time_set) {
          if (this.input.expire_time.length < 16) {
            if (message) this.$refs.errorMessage.pushMessage('有効期限を入力してください')
            return false
          } else if (new Date(this.input.expire_time).getTime() < new Date().getTime()) {
            if (message) this.$refs.errorMessage.pushMessage('有効期限は現在よりも未来で入力してください')
            return false
          }
        }
      } else {
        return false
      }
      return true
    }
  },
  methods: {
    selectClone (id) {
      if (!this.couponTypes[id]) {
        console.log('selectClone()で不明なIDが呼ばれました : ' + id)
        return
      }

      this.input = {
        type: id,
        name: this.couponTypes[id].name,
        value: this.couponTypes[id].value,
        unit: this.couponTypes[id].unit,
        target: this.couponTypes[id].target,
        left_times: this.couponTypes[id].limit_times ? this.couponTypes[id].limit_times : null,
        limit_times_set: this.couponTypes[id].limit_times !== null,
        limit_times: this.couponTypes[id].limit_times ? this.couponTypes[id].limit_times : null,
        concurrent: this.couponTypes[id].concurrent,
        expire_time_set: this.couponTypes[id].default_expire_time !== null,
        expire_time: this.couponTypes[id].default_expire_time ? this.couponTypes[id].default_expire_time.slice(0, 16) : new Date(new Date().getTime() + 32400000).toISOString().slice(0, 16)
      }

      this.manageState = 'clone'
    },
    selectCoupon (id) {
      if (!this.coupons[id]) {
        console.log('selectCoupon()で不明なIDが呼ばれました : ' + id)
        return
      }
      if (!this.couponTypes[this.coupons[id].type]) {
        console.log('selectCoupon()で不明なクーポンタイプを含むクーポンが呼ばれました : ' + id)
        return
      }

      this.selectedCoupon = id
      this.input = {
        id,
        type: this.coupons[id].type,
        name: this.couponTypes[this.coupons[id].type].name,
        value: this.couponTypes[this.coupons[id].type].value,
        unit: this.couponTypes[this.coupons[id].type].unit,
        target: this.couponTypes[this.coupons[id].type].target,
        left_times: isNaN(this.coupons[id].left_times) ? null : this.coupons[id].left_times,
        limit_times_set: this.couponTypes[this.coupons[id].type].limit_times !== null,
        limit_times: this.couponTypes[this.coupons[id].type].limit_times ? this.couponTypes[this.coupons[id].type].limit_times : null,
        concurrent: this.couponTypes[this.coupons[id].type].concurrent,
        expire_time_set: this.coupons[id].expire_time !== null,
        expire_time: this.coupons[id].expire_time ? this.coupons[id].expire_time.slice(0, 16) : new Date(new Date().getTime() + 32400000).toISOString().slice(0, 16),
        passed: this.coupons[id].passed
      }

      this.manageState = 'selected'
    },
    selectCouponType (id) {
      if (!this.couponTypes[id]) {
        console.log('selectCouponType()で不明なクーポンタイプIDが呼ばれました : ' + id)
        return
      }

      this.input = {
        id,
        name: this.couponTypes[id].name,
        value: this.couponTypes[id].value,
        unit: this.couponTypes[id].unit,
        method: this.couponTypes[id].target === null ? 'total' : 'single',
        target: this.couponTypes[id].target ? this.couponTypes[id].target : [],
        limit_times_set: this.couponTypes[id].limit_times !== null,
        limit_times: this.couponTypes[id].limit_times ? this.couponTypes[id].limit_times : null,
        concurrent: this.couponTypes[id].concurrent,
        expire_time_set: this.couponTypes[id].default_expire_time !== null,
        expire_time: this.couponTypes[id].default_expire_time ? this.couponTypes[id].default_expire_time.slice(0, 16) : new Date(new Date().getTime() + 32400000).toISOString().slice(0, 16)
      }

      this.manageState = 'selectedType'
    },
    selectNew () {
      this.selectedCoupon = null
      this.input = {
        name: '',
        value: 1,
        unit: 'yen',
        method: 'total',
        target: [],
        limit_times_set: true,
        limit_times: 1,
        concurrent: 1,
        expire_time_set: false,
        expire_time: new Date(new Date().getTime() + 32400000).toISOString().slice(0, 16)
      }

      this.manageState = 'addType'
    },
    async addCouponType () {
      this.manageState = 'addingType'

      if (this.validateForm) {
        this.manageState = 'addType'
        return
      }

      let sendData = this.input
      sendData.target = this.input.method === 'single' ? this.input.target : null
      sendData.default_expire_time = this.input.expire_time_set ? this.input.expire_time : null
      sendData.limit_times = this.input.limit_times_set ? this.input.limit_times : null
      /* クーポンタイプを追加 */
      await AwsUtil.post('CouposAPI', 'coupons/types', sendData)
        .then(response => {
          console.log('クーポンタイプを追加 : ' + response.status)
          this.manageState = 'addedType'
          this.selectedCoupon = null
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('登録に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'addType'
        })

      /* クーポンリストを更新 */
      this.loadedCouponTypes = false
      this.loadedCoupons = false
      AwsUtil.get('CouposAPI', 'coupons/types')
        .then(response => {
          console.log('クーポンタイプを取得 : ' + response.status)
          this.couponTypes = response.data
          this.loadedCouponTypes = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
      AwsUtil.get('CouposAPI', 'coupons')
        .then(response => {
          console.log('クーポンを取得 : ' + response.status)
          this.coupons = response.data
          this.loadedCoupons = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async updateCouponType () {
      this.manageState = 'updatingType'

      if (this.validateForm) {
        this.manageState = 'updateType'
        return
      }

      let sendData = this.input
      sendData.target = this.input.method === 'single' ? this.input.target : null
      sendData.default_expire_time = this.input.expire_time_set ? this.input.expire_time : null
      sendData.limit_times = this.input.limit_times_set ? this.input.limit_times : null
      /* クーポンタイプを更新 */
      await AwsUtil.put('CouposAPI', 'coupons/types/' + sendData.id, sendData)
        .then(response => {
          console.log('クーポンタイプを更新 : ' + response.status)
          this.manageState = 'updatedType'
          this.selectedCoupon = null
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('更新に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'updateType'
        })

      /* クーポンリストを更新 */
      this.loadedCouponTypes = false
      this.loadedCoupons = false
      AwsUtil.get('CouposAPI', 'coupons/types/')
        .then(response => {
          console.log('クーポンタイプを取得 : ' + response.status)
          this.couponTypes = response.data
          this.loadedCouponTypes = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
      AwsUtil.get('CouposAPI', 'coupons')
        .then(response => {
          console.log('クーポンを取得 : ' + response.status)
          this.coupons = response.data
          this.loadedCoupons = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async deleteCouponType () {
      this.manageState = 'deletingType'

      if (this.validateForm) {
        this.manageState = 'deleteType'
        return
      }

      /* クーポンタイプを削除 */
      await AwsUtil.del('CouposAPI', 'coupons/types/' + this.input.id, this.input)
        .then(response => {
          console.log('クーポンタイプを削除 : ' + response.status)
          this.manageState = 'deletedType'
          this.selectedCoupon = null
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('削除に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'deleteType'
        })

      /* クーポンリストを更新 */
      this.loadedCouponTypes = false
      this.loadedCoupons = false
      AwsUtil.get('CouposAPI', 'coupons/types/')
        .then(response => {
          console.log('クーポンタイプを取得 : ' + response.status)
          this.couponTypes = response.data
          this.loadedCouponTypes = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
      AwsUtil.get('CouposAPI', 'coupons')
        .then(response => {
          console.log('クーポンを取得 : ' + response.status)
          this.coupons = response.data
          this.loadedCoupons = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async addCoupon () {
      this.manageState = 'cloning'

      if (this.validateForm) {
        this.manageState = 'clone'
        return
      }

      if (!this.input.expire_time_set) this.input.expire_time = null
      /* クーポンを追加 */
      await AwsUtil.post('CouposAPI', 'coupons', this.input)
        .then(response => {
          console.log('クーポンを追加 : ' + response.status)
          this.manageState = 'cloned'
          this.selectedCoupon = null
          this.clonedCouponId = response.data.id
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('登録に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'clone'
        })

      /* クーポンリストを更新 */
      this.loadedCouponTypes = false
      this.loadedCoupons = false
      AwsUtil.get('CouposAPI', 'coupons/types')
        .then(response => {
          console.log('クーポンタイプを取得 : ' + response.status)
          this.couponTypes = response.data
          this.loadedCouponTypes = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
      AwsUtil.get('CouposAPI', 'coupons')
        .then(response => {
          console.log('クーポンを取得 : ' + response.status)
          this.coupons = response.data
          this.loadedCoupons = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async updateCoupon () {
      this.manageState = 'updating'

      if (this.validateForm) {
        this.manageState = 'selected'
        return
      }

      if (!this.input.expire_time_set) this.input.expire_time = null
      /* クーポンを更新 */
      await AwsUtil.get('CouposAPI', 'coupons/' + this.selectedCoupon, this.input)
        .then(response => {
          console.log('クーポンを更新 ' + this.selectedCoupon + ' : ' + response.status)
          this.manageState = 'updated'
          this.selectedCoupon = null
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('更新に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'selected'
        })

      /* クーポンリストを更新 */
      this.loadedCoupons = false
      AwsUtil.get('CouposAPI', 'coupons')
        .then(response => {
          console.log('クーポンを取得 : ' + response.status)
          this.coupons = response.data
          this.loadedCoupons = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async deleteCoupon () {
      if (!window.confirm(`${this.input.name}を削除しようとしています。よろしいですか？`)) return

      this.manageState = 'deleting'
      /* クーポンを削除 */
      await AwsUtil.del('CouposAPI', 'coupons/' + this.selectedCoupon)
        .then(response => {
          console.log('クーポンを削除 ' + this.selectedCoupon + ' : ' + response.status)
          this.manageState = 'deleted'
          this.selectedCoupon = null
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('削除に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'selected'
        })

      /* クーポンリストを更新 */
      this.loadedCoupons = false
      AwsUtil.get('CouposAPI', 'coupons')
        .then(response => {
          console.log('クーポンを取得 : ' + response.status)
          this.coupons = response.data
          this.loadedCoupons = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    copyCouponUrl () {
      this.$refs.couponUrlElm.select()
      document.execCommand('copy')

      this.showCopiedMessage = true
      setTimeout(() => {
        this.showCopiedMessage = false
      }, 4000)
    }
  },
  filters: {
    addComma (val) {
      return val.toLocaleString()
    }
  },
  created () {
    AwsUtil.get('CouposAPI', 'coupons/types')
      .then(response => {
        console.log('クーポンタイプを取得 : ' + response.status)
        this.couponTypes = response.data
        this.loadedCouponTypes = true
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
    AwsUtil.get('CouposAPI', 'coupons')
      .then(response => {
        console.log('クーポンを取得 : ' + response.status)
        this.coupons = response.data
        this.loadedCoupons = true
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
    AwsUtil.get('CouposAPI', 'categories')
      .then(response => {
        console.log('カテゴリーを取得 : ' + response.status)
        this.categories = response.data
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
    AwsUtil.get('CouposAPI', 'items')
      .then(response => {
        console.log('商品を取得 : ' + response.status)
        this.items = response.data
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

/* クーポンリスト */

#coupon-list {
  flex: 1 1 0;
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
#manage-pane > div {
  margin: 0 0.5rem;
}
#manage-pane p.message {
  margin: 0 0.5rem;
  font-size: 1rem;
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
  grid-auto-rows: minmax(2.5rem, auto);
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
.form .props div.value .vue-js-switch {
  flex: 0 0 auto;

  height: 28px;
  margin-right: 1rem;
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
  width: 4rem;
  border: 1px solid #ccc;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 2rem;
}
.form input[type="number"] {
  width: 4rem;

  text-align: right;
}
.form input[type="text"] {
  width: 5rem;
  padding: 0 0.5rem;
}
.form input[disabled] {
  color: #999;
}
.form .props div.value.coupon-name input {
  width: 100%;

  text-align: left;
}
.form .props div.value.coupon-value input {
  margin-right: 0.5rem;
}
.form .props div.value.expire-time input {
  width: auto;
  padding-left: 0.5rem;

  text-align: inherit;
}
.form .price input {
  width: 7rem;
  padding: 0 0 0 0.2rem;
}
.form .target ul {
  padding-right: 1rem;
  max-height: 10rem;
  overflow-y: scroll;
}
.form .target li span {
  display: inline-block;

  line-height: 1.75rem;
  vertical-align: middle;
}
.form .target li span.icon {
  margin-right: 0.3rem;

  font-size: 0.6rem;
  color: #3D77FF;
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

#cloned-coupon {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-row-gap: 1rem;

  margin-top: 1rem;
}
#cloned-coupon .title {
  display: flex;
  align-items: center;

  font-size: 1rem;
  line-height: 2em;
  font-weight: bold;
  background-color: #EC9E17;
  color: #fff;
  text-align: center;
}
#cloned-coupon .title span {
  width: 100%;
  padding: 0 2rem;
}
#cloned-coupon .qr {
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 1rem;
  border: 1px solid #ccc;
  border-left: none;
  font-size: 0;
}
#cloned-coupon .url {
  display: flex;
  position: relative;
}
#cloned-coupon .url input {
  flex: 1 1 auto;
  padding: 0 0.5rem;
  border: 1px solid #ccc;
  border-left: none;
  border-right: none;

  font-size: 1rem;
  line-height: 2em;
  text-align: center;
}
#cloned-coupon .url .copy {
  flex: 0 0 auto;

  padding: 0 1rem;

  font-size: 1rem;
  line-height: 2rem;
  color: #fff;
  background-color: #3874ff;
  cursor: pointer;
}
#cloned-coupon .url .copy svg {
  margin-right: 0.3rem;
}
#copied-message {
  position: absolute;
  bottom: 0;
  left: 50%;
  opacity: 0;

  width: 70%;
  padding: 0 1rem;
  border-radius: 5px;

  font-size: 1rem;
  line-height: 2rem;
  background-color: #555;
  color: #fff;
  text-align: center;
  transform: translate(-50%, calc(100% + 10px));
  transition: .3s;
}
#copied-message::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;

  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid #555;

  transform: translate(-50%, -100%);
}
#copied-message.show {
  opacity: 1;
}

@media screen and (max-width:600px) {
  .flexbox {
    display: block;
  }

  #manage-pane {
    margin-left: 0;
    margin-top: 1rem;
    border-top: 1px solid #ccc;
    padding-top: 1rem;
  }

  #cloned-coupon .title span {
    padding: 0 1rem;
  }
}
</style>
