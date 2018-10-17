<template>
  <div id="coupon-modal">
    <div class="close" @click="$emit('close')">
      <font-awesome-icon :icon="['fas', 'times']"></font-awesome-icon>
    </div>
    <h2 class="title">{{ coupon.name }}</h2>
    <table>
      <tr>
        <th>ID</th>
        <td>{{ coupon.id }}</td>
      </tr>
      <tr>
        <th>{{ coupon.unit === 'yen' ? '値引額' : '値引率' }}</th>
        <td><span class="unit-yen" v-if="coupon.unit === 'yen'">\</span>{{ coupon.value | addComma }}<span class="unit-per" v-if="coupon.unit === 'per'">%</span></td>
      </tr>
      <tr>
        <th>値引方法</th>
        <td>{{ coupon.target === null ? '小計値引' : '単品値引' }}</td>
      </tr>
      <tr>
        <th>対象商品</th>
        <td v-if="coupon.target === null || coupon.target.length === 0">全商品</td>
        <td v-else>
          <ul>
            <li v-for="item in coupon.target" :key="item.id"><span class="icon"><font-awesome-icon :icon="['fas', 'square']"></font-awesome-icon></span><span>{{ item.name }}</span></li>
          </ul>
        </td>
      </tr>
      <tr>
        <th>残り回数</th>
        <td v-if="coupon.limit_times === null">無制限</td>
        <td v-else>{{ coupon.left_times }}<span class="unit">回</span> / {{ coupon.limit_times }}<span class="unit">回</span></td>
      </tr>
      <tr>
        <th>有効期限</th>
        <td v-if="coupon.expire_time === null">なし</td>
        <td v-else>{{ coupon.expire_time_year}}<span class="unit">年</span>{{ coupon.expire_time_month}}<span class="unit">月</span>{{ coupon.expire_time_date}}<span class="unit">日</span>{{ coupon.expire_time_hours}}<span class="unit">時</span>{{ coupon.expire_time_minutes}}<span class="unit">分</span>{{ coupon.expire_time_seconds}}<span class="unit">秒</span></td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    coupon: Object
  },
  filters: {
    addComma (val) {
      return val.toLocaleString()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#coupon-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2;

  padding: 20px 50px;
  border-radius: 5px;

  transform: translate(-50%, -50%);
  background-color: #fff;
}
#coupon-modal .close {
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
#coupon-modal .close svg {
  height: 1.7rem;
}
#coupon-modal .title {
  margin: 0 0 1rem 0;

  font-size: 1.5rem;
  text-align: center;
}
#coupon-modal table {
  width: auto;
  margin: 0 auto;
  border-collapse: collapse;

  line-height: 1.75rem;
}
#coupon-modal th {
  padding-right: 1.5rem;

  text-align: left;
  vertical-align: baseline;
}
#coupon-modal td {
  text-align: left;
  vertical-align: baseline;
}
#coupon-modal ul {
  max-height: 15rem;
  overflow-y: scroll;
}
#coupon-modal li span {
  display: inline-block;

  line-height: 1.75rem;
  vertical-align: middle;
}
#coupon-modal li span.icon {
  margin-right: 0.3rem;

  font-size: 0.6rem;
  color: #3D77FF;
}
#coupon-modal table .unit {
  font-size: 0.9rem;
  margin: 0 0.1rem;
}

@media screen and (max-width:600px) {
  #coupon-modal {
    left: 0;

    width: 100%;
    border-radius: 0;

    transform: translate(0, -50%);
  }
}
</style>
