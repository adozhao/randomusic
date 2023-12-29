<template>
  <div class="container">
    <div class="music-box" :class="{ rotate: isRotate }">
      <img class="pic" :src="audio.picurl" />
      <audio ref="player" :src="audio.url"></audio>
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
      audio: {},
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
body {
  background-image: url("../../public/images/bg.jpg");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  overflow: hidden;
}
.music-box {
  user-select: none;
  &.rotate {
    animation: rotate 18s linear infinite;
  }
}
.container {
  border-radius: 100%;
  overflow: hidden;
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
.pic {
  display: block;
  width: 100%;
  height: 100%;
  filter: blur(4px);
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