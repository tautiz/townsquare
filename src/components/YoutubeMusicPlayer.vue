<template>
  <div class="youtube-player-container" :class="{ 'is-hidden': !showVisual || !isEnabled }">
    <div id="yt-player"></div>
    <div id="yt-night-player"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "YoutubeMusicPlayer",
  data() {
    return {
      player: null,
      nightPlayer: null,
      apiLoaded: false,
      isFading: false,
      currentActive: 'day', // 'day' arba 'night'
      playlist: [],
      currentTrackIndex: -1,
    };
  },
  computed: {
    ...mapState("audio", ["playlistId", "nightTrackId", "volume", "isEnabled", "isPlaying", "showVisual"]),
    ...mapState(["grimoire"]),
  },
  watch: {
    "grimoire.isNight": function(val) {
      if (this.isEnabled) {
        this.handlePhaseChange(val);
      }
    },
    isEnabled(val) {
      if (!val) {
        this.stopAll();
      } else if (this.isPlaying) {
        this.startPlaying();
      }
    },
    volume(val) {
      if (this.player) this.player.setVolume(val);
      if (this.nightPlayer) this.nightPlayer.setVolume(val);
    }
  },
  mounted() {
    this.loadYoutubeApi();
  },
  methods: {
    loadYoutubeApi() {
      if (window.YT && window.YT.Player) {
        this.onYouTubeIframeAPIReady();
        return;
      }
      const tag = document.createElement("script");
      tag.id = 'yt-api-script';
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      // Globali funkcija, kurią iškviečia YouTube API kai užsikrauna
      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API paruošta");
        this.onYouTubeIframeAPIReady();
      };
    },
    onYouTubeIframeAPIReady() {
      const commonVars = {
        autoplay: 0,
        controls: 1,
        origin: window.location.origin,
        enablejsapi: 1,
        widget_referrer: window.location.origin,
        rel: 0,
        modestbranding: 1,
        host: 'https://www.youtube.com'
      };

      this.player = new window.YT.Player("yt-player", {
        height: "200",
        width: "300",
        playerVars: {
          ...commonVars,
          listType: "playlist",
          list: this.playlistId
        },
        events: {
          onReady: (e) => {
            console.log("Dienos grotuvas paruoštas");
            this.onPlayerReady(e);
          },
          onStateChange: this.onPlayerStateChange,
          onError: (e) => {
            console.error("YT Day Player Error:", e.data);
            if (e.data === 150 || e.data === 101) {
              alert("Šis vaizdo įrašas neleidžia grojimo kitose svetainėse. Pabandykite kitą grojaraštį.");
            }
          }
        },
      });

      this.nightPlayer = new window.YT.Player("yt-night-player", {
        height: "200",
        width: "300",
        playerVars: {
          ...commonVars,
          videoId: this.nightTrackId,
          loop: 1,
          playlist: this.nightTrackId
        },
        events: {
          onReady: (e) => {
            console.log("Nakties grotuvas paruoštas");
            this.onNightPlayerReady(e);
          },
          onError: (e) => console.error("YT Night Player Error:", e.data)
        },
      });
    },
    onPlayerReady(event) {
      this.apiLoaded = true;
      event.target.setVolume(this.volume);
      // Išankstinis užkrovimas (cue)
      event.target.cuePlaylist({
        listType: 'playlist',
        list: this.playlistId
      });
    },
    onNightPlayerReady(event) {
      event.target.setVolume(this.volume);
      event.target.cueVideoById(this.nightTrackId);
    },
    onPlayerStateChange(event) {
      console.log("YT Grotuvo būsena pasikeitė:", event.data);
      
      // Jei grojaraštis užkrautas, bandom gauti dainų sąrašą
      if (event.data === window.YT.PlayerState.CUED || 
          event.data === window.YT.PlayerState.PLAYING || 
          event.data === window.YT.PlayerState.BUFFERING) {
        
        const playlist = event.target.getPlaylist();
        console.log("Bandoma gauti grojaraštį, gauta:", playlist);
        
        if (playlist && playlist.length) {
          this.playlist = playlist;
        }
      }

      if (event.data === window.YT.PlayerState.PLAYING) {
        this.currentTrackIndex = event.target.getPlaylistIndex();
        this.$store.commit('audio/setPlaying', true);
      }

      if (event.data === window.YT.PlayerState.PAUSED || 
          event.data === window.YT.PlayerState.ENDED) {
        setTimeout(() => {
          const dayState = this.player && typeof this.player.getPlayerState === 'function' ? this.player.getPlayerState() : -1;
          const nightState = this.nightPlayer && typeof this.nightPlayer.getPlayerState === 'function' ? this.nightPlayer.getPlayerState() : -1;
          
          if (dayState !== window.YT.PlayerState.PLAYING && 
              nightState !== window.YT.PlayerState.PLAYING) {
            this.$store.commit('audio/setPlaying', false);
          }
        }, 200);
      }
    },
    async fadeOut(player, duration = 2000) {
      if (!player) return;
      const startVolume = player.getVolume();
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = startVolume / steps;

      for (let i = 0; i < steps; i++) {
        const newVol = Math.max(0, startVolume - volumeStep * (i + 1));
        player.setVolume(newVol);
        await new Promise(r => setTimeout(r, stepDuration));
      }
      player.pauseVideo();
    },
    async fadeIn(player, targetVolume, duration = 2000) {
      if (!player) return;
      player.setVolume(0);
      
      try {
        if (typeof player.unMute === 'function') player.unMute();
        const state = player.getPlayerState();
        if (state !== window.YT.PlayerState.PLAYING) {
          player.playVideo();
        }
      } catch (e) {
        console.error("YT play error:", e);
      }

      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = targetVolume / steps;

      for (let i = 0; i < steps; i++) {
        const newVol = Math.min(targetVolume, volumeStep * (i + 1));
        player.setVolume(newVol);
        await new Promise(r => setTimeout(r, stepDuration));
      }
    },
    async handlePhaseChange(isNight) {
      if (isNight) {
        this.currentActive = 'night';
        await this.fadeOut(this.player);
        await this.fadeIn(this.nightPlayer, this.volume);
      } else {
        this.currentActive = 'day';
        await this.fadeOut(this.nightPlayer);
        await this.fadeIn(this.player, this.volume);
      }
    },
    nextTrack() {
      if (this.player && this.currentActive === 'day') {
        this.player.nextVideo();
      }
    },
    prevTrack() {
      if (this.player && this.currentActive === 'day') {
        this.player.previousVideo();
      }
    },
    togglePlay() {
      if (!this.isEnabled) return;
      if (this.isPlaying) {
        this.fadeOut(this.currentActive === 'day' ? this.player : this.nightPlayer);
      } else {
        const p = this.currentActive === 'day' ? this.player : this.nightPlayer;
        if (typeof p.unMute === 'function') p.unMute();
        
        if (this.currentActive === 'day') {
           // Priverstinis užkrovimas su loadPlaylist, bet patikriname būseną
           const state = p.getPlayerState();
           if (state === window.YT.PlayerState.CUED || state === window.YT.PlayerState.UNSTARTED || !this.playlist.length) {
             p.loadPlaylist({
               listType: 'playlist',
               list: this.playlistId,
               index: this.currentTrackIndex >= 0 ? this.currentTrackIndex : 0,
               startSeconds: 0
             });
           } else {
             p.playVideo();
           }
        } else {
          p.playVideo();
        }
      }
      this.$store.commit('audio/setPlaying', !this.isPlaying);
    },
    playTrack(index) {
      if (this.player && this.currentActive === 'day') {
        this.player.playVideoAt(index);
        if (!this.isPlaying) {
          this.$store.commit('audio/setPlaying', true);
        }
      }
    },
    stopAll() {
      if (this.player) this.player.stopVideo();
      if (this.nightPlayer) this.nightPlayer.stopVideo();
      this.$store.commit('audio/setPlaying', false);
    }
  }
};
</script>

<style lang="scss" scoped>
.youtube-player-container {
  position: fixed;
  top: 10px;
  left: 10px;
  width: 220px;
  height: 440px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
  opacity: 1;
  transition: transform 0.3s ease, opacity 0.3s ease;

  &.is-hidden {
    transform: translateX(-250px);
    opacity: 0;
    pointer-events: none;
  }

  iframe {
    width: 100% !important;
    height: 200px !important;
  }
}
</style>
