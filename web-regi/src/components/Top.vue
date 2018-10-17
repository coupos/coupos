<template>
  <div>
    <div id="stock" class="box">
      <div class="head">
        <div>
          <h2>ストックしたクーポン</h2>
          <p>クーポンをストックしてあとから簡単に表示</p>
        </div>
      </div>
      <div class="body">
        <ul v-if="stock.length > 0">
          <router-link tag="li" v-for="coupon in stock" :key="coupon.id" :to="{ path: '/coupons/' + coupon.id }">
            <div class="top">
              <span>{{ coupon.name }}</span>
            </div>

            <div class="dotted-line">
              <div class="big left"></div>
              <div class="white left"></div>
              <div class="small" ref="smallCircleElm">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <div class="big right"></div>
              <div class="white right"></div>
            </div>

            <div class="bottom">
              <span>表示する</span>
            </div>
          </router-link>
        </ul>
        <div v-else class="empty">
          <p>まだストックにクーポンが追加されていません。</p>
        </div>
      </div>
    </div>

    <div id="map" class="box">
      <div class="head">
        <div>
          <h2>混雑マップ</h2>
          <p>イベントの混雑状況を売上情報から推測</p>
        </div>
      </div>
      <div class="body">
        <router-link :to="{ path: '/maps/613b5923-1a95-4c8d-aea6-cf58981616fb' }">木更津高専 祇園祭</router-link>
      </div>
    </div>

    <div id="regi" class="box">
      <div class="head">
        <div>
          <h2>Webレジ</h2>
          <p>イベントにちょうどいいレジサービス</p>
        </div>
      </div>
      <div class="body">
        <router-link :to="{ name: 'Dashboard' }">ログインしてダッシュボードへ</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Top',
  data () {
    return {
      stock: []
    }
  },
  created () {
    this.stock = localStorage.getItem('stockedCoupons') ? JSON.parse(localStorage.getItem('stockedCoupons')) : []
  }
}
</script>

<style scoped>
.box {
  margin-top: 20px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;

  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
}
.box .head {
  display: flex;
  align-items: center;

  width: 100%;
  min-height: 5rem;
  padding: 0.5rem 1rem;

  background-color: rgba(0, 0, 0, 0.03);
}
.box .head h2 {
  width: 100%;

  font-weight: bold;
  font-size: 1.3rem;
  line-height: 1.2em;
  color: #444;
}
.box .head p {
  font-size: 0.9rem;
  color: #777;
}
.box .body {
  display: flex;
  align-items: stretch;

  min-height: 5rem;
  padding: 10px 20px 20px 20px;
}

#stock ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, 200px);
  grid-auto-rows: 150px;
  grid-gap: 10px;

  margin-top: 10px;
}
#stock li {
  width: auto;
  padding: 0 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);

  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all .3s;
}
#stock li:hover {
  transform: translateY(-3px);
}
#stock li .top {
  display: flex;
  justify-content: center;
  align-items: center;

  height: 76px;
}
#stock li .top span {
  font-weight: bold;
  font-size: 1.1rem;
  line-height: 1.3em;
  color: #333;
}

#stock li .dotted-line {
  position: relative;

  height: 30px;
  margin: 0 -10px;
}
#stock li .dotted-line .white.left {
  position: absolute;
  top: 0;
  left: -15px;

  width: 15px;
  height: 30px;

  background-color: #fff;
}
#stock li .dotted-line .white.right {
  position: absolute;
  top: 0;
  right: -15px;

  width: 15px;
  height: 30px;

  background-color: #fff;
}
#stock li .dotted-line .big.left {
  position: absolute;
  top: 0;
  left: -15px;

  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, .15);

  box-shadow: 0 0 4px 0px rgba(0, 0, 0, .2) inset;
}
#stock li .dotted-line .big.right {
  position: absolute;
  top: 0;
  right: -15px;

  width: 30px;
  height: 30px;
  border-radius: 15px 0 0 15px;
  border: 1px solid rgba(0, 0, 0, .15);

  box-shadow: 0 0 4px 0px rgba(0, 0, 0, .2) inset;
}
#stock li .dotted-line .small {
  display: flex;
  justify-content: center;

  margin: 0 auto;
  padding: 10px 0
}
#stock li .dotted-line .small div {
  width: 10px;
  height: 10px;
  margin-right: 10px;
  border-radius: 50px;
  border: 1px solid rgba(0, 0, 0, .15);

  box-shadow: 0 0 4px 0px rgba(0, 0, 0, .2) inset;
}
#stock li .dotted-line .small div:last-child {
  margin-right: 0;
}
#stock .bottom {
  display: flex;
  align-items: center;

  height: 44px;
}
#stock .bottom span {
  display: inline-block;

  width: 100%;

  font-size: 0.9rem;
  color: #07f;
  text-align: center;
}

#stock .empty {
  display: flex;
  align-items: center;

  padding-top: 10px;
}
#stock .empty p {
  color: #666;
}

#map .body {
  display: flex;
  align-items: center;
  padding-top: 20px;
}
#map a {
  font-weight: bold;
  font-size: 1.1rem;
  color: #07f;
}

#regi .body {
  display: flex;
  align-items: center;
  padding-top: 20px;
}
#regi a {
  font-weight: bold;
  font-size: 1.1rem;
  color: #07f;
}

@media screen and (max-width:600px) {
  .box .body {
    padding: 10px 15px 15px 15px;
  }
}
</style>
