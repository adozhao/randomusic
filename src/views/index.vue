<template>
  <div class="container">
    <div class="card-box">
      <img class="pic" :class="{ rotate: isRotate }" :src="audio.picurl" />
    </div>
    <audio ref="player" :src="audio.url"></audio>
    <div class="info-box">
      <div class="box">
        <div class="name">{{ audio.name }}</div>
        <div class="text">{{ audio.artistsname }}</div>
      </div>
    </div>
    <div class="play-btn" @click="onPlayBtn()">
      <i v-show="isPlaying" class="iconfont icon-pause"></i>
      <i v-show="!isPlaying" class="iconfont icon-play"></i>
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
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: absolute;
  top: 50%;
  right: 50px;
  width: 300px;
  height: 300px;
  background-color: #ffffff59;
  text-align: center;
  color: #fff;
  border-radius: 100%;
  transform: translateY(-50%);
  .box{
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translate(-50%, -50%);
    .name{
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 22px;
    }
    .text{
      font-size: 24px;
    }
  }
}
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #000;
}
.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  .iconfont {
    font-size: 80px;
    color: rgba(255, 255, 255, 0.4);
  }
}
.card-box{
  position: absolute;
  top: 50%;
  width: 300px;
  height: 300px;
  transform: translate(50px, -50%);
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
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}
</style>