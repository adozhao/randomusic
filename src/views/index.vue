<template>
  <div class="container">
    <div class="left-box">
      <div class="card-box">
        <img class="pic" :class="{ rotate: isRotate }" :src="audio.picurl" />
      </div>
    </div>
    <div class="control-box">
      <div class="play-btn" @click="onPlayBtn()">
        <i v-show="isPlaying" class="iconfont icon-pause"></i>
        <i v-show="!isPlaying" class="iconfont icon-play"></i>
      </div>
      <i class="iconfont icon-next" @click="getMusic"></i>
    </div>
    <audio ref="player" :src="audio.url"></audio>
    <div class="info-box">
      <div class="name">{{ audio.name }}</div>
      <div class="text">{{ audio.artistsname }}</div>
    </div>
    
  </div>
</template>
<script>
import axios from "axios";
import { ipcRenderer, remote } from 'electron'
export default {
  data() {
    return {
      audio: {
        artistsname: '',
        name: '',
        picurl: '',
        url: '',
      },
      isPlaying: false,
      musicType: "热歌榜",
      isRotate: false,
    };
  },
  computed: {
    player() {
      return this.$refs.player;
    },
  },
  watch: {
    isPlaying(val) {
      this.isRotate = val;
    },
    musicType() {
      this.getMusic();
    },
  },
  methods: {
    getMusic() {
      axios
        .get(
          `https://api.uomg.com/api/rand.music?sort=${this.musicType}&format=json`
        )
        .then((res) => {
          this.audio = res.data.data;
          let playerPromise = this.player.play();
          if (playerPromise != undefined) {
            playerPromise
              .then(() => {
                this.player.play();
              })
              .catch(() => {
                this.player.play();
              });
          }
        });
    },
    onPlayBtn() {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.player.play();
        this.isRotate = true;
      } else {
        this.player.pause();
        this.isRotate = false;
      }
    },
    initMenu() {
      const Menu = remote.Menu;
      const MenuItem = remote.MenuItem;
      let menu = new Menu();
      menu.append(
        new MenuItem({
          label: "切歌",
          click: () => {
            this.getMusic();
          },
        })
      );
      menu.append(new MenuItem({ type: "separator" }));
      menu.append(
        new MenuItem({
          label: "热歌榜",
          type: "radio",
          checked: true,
          click: () => {
            this.musicType = "热歌榜";
          },
        })
      );
      menu.append(
        new MenuItem({
          label: "新歌榜",
          type: "radio",
          checked: false,
          click: () => {
            this.musicType = "新歌榜";
          },
        })
      );
      menu.append(
        new MenuItem({
          label: "飙升榜",
          type: "radio",
          checked: false,
          click: () => {
            this.musicType = "飙升榜";
          },
        })
      );
      menu.append(
        new MenuItem({
          label: "抖音榜",
          type: "radio",
          checked: false,
          click: () => {
            this.musicType = "抖音榜";
          },
        })
      );
      menu.append(
        new MenuItem({
          label: "电音榜",
          type: "radio",
          checked: false,
          click: () => {
            this.musicType = "电音榜";
          },
        })
      );
      menu.append(new MenuItem({ type: "separator" }));
      menu.append(
        new MenuItem({
          label: "最小化",
          click: () => {
            ipcRenderer.send("tray-active");
          },
        })
      );
      menu.append(
        new MenuItem({
          label: "退出",
          click: () => {
            ipcRenderer.send("window-close");
          },
        })
      );

      window.addEventListener(
        "contextmenu",
        function (e) {
          e.preventDefault();
          menu.popup(remote.getCurrentWindow());
        },
        false
      );
    },
  },
  mounted() {
    document.onkeydown = (e) => {
      if(e.ctrlKey === true && e.key === 'q') {
        this.getMusic()
      }
      if(e.key === '=') {
        if(this.player.volume == 1) return
        this.player.volume = (this.player.volume + 0.1).toFixed(1)
      }
      if(e.key === '-') {
        if(this.player.volume == 0) return
        this.player.volume = (this.player.volume - 0.1).toFixed(1)
      }
    }

    this.player.addEventListener("ended", () => {
      this.getMusic();
    });
    this.player.addEventListener("play", () => {
      this.isPlaying = true;
    });
    this.player.addEventListener("pause", () => {
      this.isPlaying = false;
    });
  },
  created() {
    this.getMusic();
    this.initMenu();
  },
};
</script>
<style lang="scss">
*{
  margin: 0;
  padding: 0;
}
.info-box{
    writing-mode: tb-rl;
    letter-spacing: 6px;
    .name{
      position: absolute;
      top: 30%;
      right: 40px;
      color: #fff;
      text-align: center;
      transform: translate(-50%, -50%);
      font-size: 36px;
      font-weight: bold;
    }
    .text{
      position: absolute;
      top: 50%;
      right: 100px;
      color: #fff;
      text-align: center;
      transform: translate(-50%, -50%);
      font-size: 24px;
    }
}
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #000;
}
.control-box{
  position: absolute;
  bottom: 30px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .play-btn {
    cursor: pointer;
    .iconfont {
      font-size: 40px;
      color: #fff;
    }
  }
  .icon-next{
    font-size: 48px !important;
    color: #fff;
    padding-left: 20px;
    cursor: pointer;
  }
}
.left-box{
  display: flex;
  flex-direction: column;
  padding-top: 100px;
  padding-left: 50px;
  .card-box{
    width: 300px;
    height: 300px;
    .pic {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 100%;
      &.rotate {
        animation: rotate 18s linear infinite;
      }
    }
  }
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}
</style>