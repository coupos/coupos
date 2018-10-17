<template>
  <div>
    <div v-if="status !== 404">
      <div style="text-align: center">
        <p class="breadcrumb">{{ coupon.event ? coupon.event.name : '' }}<span v-if="coupon.event"> > </span>{{ coupon.booth ? coupon.booth.name : '' }}</p><br />
        <h1>{{ coupon.name }}</h1>
      </div>

      <div id="coupon">
        <div class="top">
          <div class="left-times">
            <span v-if="status !== 200" style="width: 5rem; height: 1.75rem;"></span>
            <span v-else-if="!coupon.left_times">何度でも</span>
            <span v-else-if="coupon.left_times === 0">使用不可</span>
            <span v-else>残り<span style="font-weight: bold; font-size: 1.1rem; margin: 0 0.1rem">{{ coupon.left_times}}</span>回</span>
          </div>
          <div class="padding"></div>
          <div class="expire" v-if="status === 200">
            <span class="label">有効期限</span>
            <span class="value" v-if="!coupon.expire_time">なし</span>
            <span class="value" v-else style="margin-left: 0.5rem">{{ coupon.expire_time.slice(0, 16).replace('T', ' ') }}</span>
          </div>
          <div class="expire" v-else style="width: 10rem; height: 1.75rem;"></div>
        </div>

        <div class="body">
          <span class="small" v-if="status !== 200"></span>
          <span class="small" v-else-if="!coupon.target">小計金額から</span>
          <span class="small" v-else>対象商品一個が</span>
          <h2 v-if="status !== 200"></h2>
          <h2 v-else>{{ coupon.value }}{{ coupon.unit === 'yen' ? '円' : '%' }} OFF</h2>
        </div>

        <div class="bottom">
          <div class="target" v-if="status === 200 && coupon.target">
            <span class="label">対象商品 : </span>
            <span v-if="coupon.target.length === 0">全商品</span>
            <ul v-else>
              <li v-for="item in coupon.target" :key="item.id">{{ item.name }}</li>
            </ul>
          </div>

          <ul v-if="status === 200" class="note">
            <li v-if="coupon.concurrent === 1">このクーポンは他のクーポンと併用できません。</li>
            <li v-if="coupon.target === null && coupon.concurrent > 1">このクーポンの他に、{{ coupon.concurrent - 1 }}枚の単品値引クーポンが併用できます。</li>
            <li v-if="coupon.target === null && coupon.concurrent > 1">小計値引クーポンは併用できません。</li>
            <li v-if="coupon.target === null && coupon.concurrent > 1">このクーポンは併用する単品値引クーポンを適用した後の小計金額から、値引を行います。</li>
            <li v-if="coupon.target !== null && coupon.concurrent > 1">このクーポンの他に、{{ coupon.concurrent - 1 }}枚のクーポンが併用できます。</li>
          </ul>
        </div>

        <div class="dotted-line">
          <div class="big left"></div>
          <div class="white left"></div>
          <div class="small" ref="smallCircleElm">
            <div v-for="i in smallCircleNum" :key="i"></div>
          </div>
          <div class="big right"></div>
          <div class="white right"></div>
        </div>

        <div id="shortcode" v-if="!unavailable">
          <span>{{ coupon.shortcode }}</span>
        </div>

        <div id="barcode" ref="barcodeDiv">
          <svg id="bc" :style="{ width: '100%'}"></svg>
        </div>
      </div>

      <div id="stock">
        <a class="button remove" href="#stock" v-if="stocked" @click="unstock">このクーポンをストックから外す</a>
        <a class="button add" href="#stock" v-else @click="stock">このクーポンをストックに追加する</a>
      </div>
    </div>
    <div v-if="status === 404">
      <h1>クーポンが見つかりませんでした</h1>
      <p>ご指定のクーポンは見つかりませんでした。</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import JsBarcode from 'jsbarcode'

export default {
  name: 'CouponViewer',
  data () {
    return {
      coupon: {},
      status: null,
      smallCircleNum: 0,
      unavailable: false,
      stocked: false
    }
  },
  methods: {
    stock () {
      let stockArray = localStorage.getItem('stockedCoupons') ? JSON.parse(localStorage.getItem('stockedCoupons')) : []

      let filteredStock = stockArray.filter(c => {
        return c.id === this.coupon.id
      })

      if (filteredStock.length < 1) {
        stockArray.push({
          id: this.$route.params.id,
          name: this.coupon.name
        })
        localStorage.setItem('stockedCoupons', JSON.stringify(stockArray))
      }

      this.stocked = true
    },
    unstock () {
      let stockArray = localStorage.getItem('stockedCoupons') ? JSON.parse(localStorage.getItem('stockedCoupons')) : []

      let index = -1
      for (let i = 0; i < stockArray.length; i++) {
        if (stockArray[i].id === this.coupon.id) index = i
      }

      if (index >= 0) {
        stockArray.splice(index, 1)
        localStorage.setItem('stockedCoupons', JSON.stringify(stockArray))
      }

      this.stocked = false
    }
  },
  created () {
    let stockArray = localStorage.getItem('stockedCoupons') ? JSON.parse(localStorage.getItem('stockedCoupons')) : []

    if (stockArray.indexOf(this.coupon.id) >= 0) {
      this.stocked = true
    }

    axios.get('https://api.coupos.net/v1/coupons/' + this.$route.params.id + '?shortcode=true')
      .then(response => {
        console.log('クーポンを取得 : ' + response.status)
        this.coupon = response.data
        this.status = 200

        if ((this.coupon.left_times !== null && this.coupon.left_times < 1) || (Date.parse(this.coupon.expire_time) < Date.now() + 32400000)) {
          this.unavailable = true
        } else {
          this.$nextTick(() => {
            /* バーコード描画 */
            JsBarcode('#bc', this.$route.params.id, {
              format: 'code128',
              lineColor: '#444444',
              font: 'Consolas',
              fontSize: 16,
              width: 2,
              height: 80,
              displayValue: true
            })

            /* バーコード横幅修正 */
            this.$refs.barcodeDiv.children[0].style += '; width: 100%'

            /* 円を描画 */
            if (!this.$refs.smallCircleElm) return
            this.smallCircleNum = Math.floor((this.$refs.smallCircleElm.clientWidth - 40) / 20)
          })
        }
      })
      .catch(error => {
        this.status = error.response ? error.response.status : 500
        if (this.status === 400) console.log('クーポンが見つかりませんでした')
        else console.log(JSON.stringify(error))
      })
  }
}
</script>

<style scoped>
.breadcrumb {
  display: inline-block;

  min-width: 500px;
  margin-top: 1rem;

  font-size: 1rem;
  color: #555;
  text-align: left;
}
.breadcrumb span {
  color: #aaa;
}
.breadcrumb:empty {
  border-radius: 5px;

  background-color: #e2e2e2;
}
h1 {
  display: inline-block;

  min-width: 500px;
  min-height: 1.5em;

  font-size: 2rem;
  line-height: 1.5em;
  color: #444;
  text-align: left;
}
h1:empty {
  height: 1.5em;
  border-radius: 5px;

  background-color: #e2e2e2;
}

#coupon {
  width: auto;
  max-width: 500px;
  margin: 1rem auto 0 auto;
  padding: 0 10px;
  border: 1px solid rgba(0, 0, 0, .15);

  box-shadow: 0 2px 6px 0px rgba(0, 0, 0, .2);
}
#coupon .top {
  display: flex;
  align-items: stretch;

  width: 100%;
  margin-bottom: 20px;
}
#coupon .top .left-times {
  flex: 0 0 auto;

  width: auto;
  padding: 0.2rem 1rem;
  border-radius: 0 0 3px 3px;

  font-size: 1rem;
  line-height: 1.75rem;
  background-color: #4E95FF;
  color: #fff;
}
#coupon .top .padding {
  flex: 1 1 0;
}
#coupon .top .expire {
  flex: 0 0 auto;
  display: flex;
  align-items: center;

  padding: 0.2rem 1rem;
  border-radius: 0 0 3px 3px;

  background-color: #FF4747;
  color: #fff;
}
#coupon .top .expire .label {
  font-size: 1rem;
  line-height: 1.75rem;
}
#coupon .body {
  padding-left: 10px;
  margin-bottom: 20px;
  border-left: 10px solid #FFA917;
}
#coupon .body .small {
  display: inline-block;

  margin-top: 0.2em;

  font-size: 1.125rem;
}
#coupon .body .small:empty {
  width: 10em;
  height: 1.7em;
  margin-top: 0;
  border-radius: 5px;

  background-color: #e2e2e2;
}
#coupon .body h2 {
  font-size: 2rem;
}
#coupon .body h2:empty {
  width: 10em;
  height: 1.5em;
  border-radius: 5px;

  background-color: #e2e2e2;
}
#coupon .bottom .target {
  font-size: 1rem;
}
#coupon .bottom .note {
  list-style-type: none;

  font-size: 1rem;
  line-height: 1.75em;
}
#coupon .bottom .note li::before {
  position: absolute;
  top: 0;
  left: 0;
  content: '■';

  color: #4E95FF;
}
#coupon .bottom .note li {
  position: relative;

  padding-left: 1.15rem;
}
#coupon .dotted-line {
  position: relative;

  height: 30px;
  margin: 15px -10px;
}
#coupon .dotted-line .white.left {
  position: absolute;
  top: 0;
  left: -15px;

  width: 15px;
  height: 30px;

  background-color: #fff;
}#coupon .dotted-line .white.right {
  position: absolute;
  top: 0;
  right: -15px;

  width: 15px;
  height: 30px;

  background-color: #fff;
}
#coupon .dotted-line .big.left {
  position: absolute;
  top: 0;
  left: -15px;

  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, .15);

  box-shadow: 0 0 4px 0px rgba(0, 0, 0, .2) inset;
}
#coupon .dotted-line .big.right {
  position: absolute;
  top: 0;
  right: -15px;

  width: 30px;
  height: 30px;
  border-radius: 15px 0 0 15px;
  border: 1px solid rgba(0, 0, 0, .15);

  box-shadow: 0 0 4px 0px rgba(0, 0, 0, .2) inset;
}
#coupon .dotted-line .small {
  display: flex;
  justify-content: center;

  margin: 0 auto;
  padding: 10px 0
}
#coupon .dotted-line .small div {
  width: 10px;
  height: 10px;
  margin-right: 10px;
  border-radius: 50px;
  border: 1px solid rgba(0, 0, 0, .15);

  box-shadow: 0 0 4px 0px rgba(0, 0, 0, .2) inset;
}#coupon .dotted-line .small div:last-child {
  margin-right: 0;
}
#shortcode {
  text-align: center;
}
#shortcode span {
  display: inline-block;

  padding: 0 1rem;

  font-size: 2rem;
  font-family: consolas;
  color: #555;
  transition: .3s;
  cursor: text;
}
#shortcode span:hover {
  font-weight: bold;
  transform: scale(3);
  background-color: #fff;
}
#barcode {
  padding-bottom: 20px;
}
#bc {
  display: block;

  margin: 0 auto;
}

#stock {
  max-width: 500px;
  margin: 1.5rem auto 0 auto;
}
#stock .button {
  width: 100%;
}
#stock .button.add {
  background-color: hsl(38, 96%, 53%);
  box-shadow: 0 3px 0 hsl(38, 96%, 38%);
}
#stock .button:hover {
  background-color: hsl(38, 96%, 60%);
  box-shadow: 0 3px 0 hsl(38, 96%, 43%);
}
#stock .button:active {
  box-shadow: none;
}
#stock .button.remove {
  background-color: hsl(222, 100%, 61%);
  box-shadow: 0 3px 0 hsl(222, 100%, 46%);
}
#stock .button.remove:hover {
  background-color: hsl(222, 100%, 66%);
  box-shadow: 0 3px 0 hsl(222, 100%, 51%);
}
#stock .button.remove:active {
  box-shadow: none;
}
</style>
