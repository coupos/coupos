<template>
  <div>
    <div v-if="loadedMapdata" id="map" ref="mapElm"
      :style="{
        height: mapHeight,
        'background-image': 'url(\'' + mapdata.maps[currentMap].src + '\')'
      }">
      <div class="booth"
        v-for="booth in mapdata.booths"
        :key="'c' + booth.name"
        :style="{
          top: booth.coord.y / mapdata.maps[booth.coord.map].svgHeight * 100 + '%',
          left: booth.coord.x / mapdata.maps[booth.coord.map].svgWidth * 100 + '%'
        }">
        <div class="name">
          {{ booth.name }}
        </div>
        <div class="graph">
          <div
            class="block"
            v-for="ind in booth.ratio"
            :key="'c' + ind">
            <font-awesome-icon
              :style="{ color: booth.color }"
              :icon="['fas', 'male']">
            </font-awesome-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'

export default {
  name: 'MapViewer',
  data () {
    return {
      mapdata: {},
      loadedMapdata: false,
      currentMap: 0,
      mapHeight: 0
    }
  },
  created () {
    // this.mapdata = {
    //   'booths': [
    //     {
    //       'name': 'バスケ部',
    //       'description': 'ブース説明',
    //       'coord': {
    //         'map': 0,
    //         'x': 5,
    //         'y': 70.5
    //       },
    //       'color': '#216bff',
    //       'ratio': 1,
    //       'icon': null
    //     },
    //     {
    //       'name': 'とるちぃーや',
    //       'description': 'ブース説明',
    //       'coord': {
    //         'map': 0,
    //         'x': 100,
    //         'y': 70.5
    //       },
    //       'color': '#ff3939',
    //       'ratio': 5,
    //       'icon': null
    //     }
    //   ],
    //   'maps': [
    //     {
    //       'src': 'https://coupos.net/img/maps/613b5923-1a95-4c8d-aea6-cf58981616fb/0.svg',
    //       'imgWidth': 1920,
    //       'imgHeight': 1080,
    //       'svgWidth': 128,
    //       'svgHeight': 72
    //     }
    //   ]
    // }
    // this.loadedMapdata = true
    // this.$nextTick(() => {
    //   this.mapHeight = String(this.$refs.mapElm.clientWidth * (this.mapdata.maps[this.currentMap].imgHeight / this.mapdata.maps[this.currentMap].imgWidth)) + 'px'
    // })

    AwsUtil.get('CouposAPI', 'map/' + this.$route.params.id)
      .then(response => {
        console.log('マップデータを取得 : ' + response.status)
        this.mapdata = response.data
        this.mapdata.maps.push({
          imageWidth: 1920,
          imageHeight: 1080,
          src: 'https://coupos.net/img/maps/613b5923-1a95-4c8d-aea6-cf58981616fb/0.svg'
        })
        this.loadedMapdata = true

        this.$nextTick(() => {
          this.mapHeight = String(this.$refs.mapElm.clientWidth * (this.mapdata.maps[this.currentMap].imageHeight / this.mapdata.maps[this.currentMap].imageWidth)) + 'px'
        })
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
  }
}
</script>

<style scoped>
#map {
  position: relative;

  width: 100%;
  margin: 0 auto;

  background-repeat: no-repeat;
  background-size: contain;
}
#map .booth {
  position: absolute;
}
#map .name {
  font-weight: bold;
  color: #444;
  text-align: center;
}
#map .graph {
  position: relative;

  width: 60px;
  height: 60px;
  margin: 0 auto;

  font-size: 40px;
  text-align: center;
}
#map .graph .block {
  position: absolute;
  display: inline-block;
}
#map .graph .block:nth-child(1) {
  top: 0;
  left: 50%;
  z-index: 3;

  transform: translateX(-50%);
}
#map .graph .block:nth-child(2) {
  top: 0;
  left: 25%;
  z-index: 4;

  transform: translateX(-25%);
}
#map .graph .block:nth-child(3) {
  top: 0;
  left: 75%;
  z-index: 2;

  transform: translateX(-75%);
}
#map .graph .block:nth-child(4) {
  top: 0;
  left: 0;
  z-index: 5;

  transform: translateX(0);
}
#map .graph .block:nth-child(5) {
  top: 0;
  left: 100%;
  z-index: 1;

  transform: translateX(-100%);
}
#map .graph svg {
  height: 60px;

  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 1));
}
</style>
