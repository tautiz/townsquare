<template>
  <Modal
    class="music-settings"
    v-if="modals.musicSettings"
    @close="toggleModal('musicSettings')"
  >
    <h3>Muzikos nustatymai</h3>
    
    <div class="setting-item">
      <label>Muzika įjungta</label>
      <div class="button townsfolk" @click="toggleEnabled">
        <font-awesome-icon :icon="isEnabled ? 'check-square' : 'square'" />
        {{ isEnabled ? 'Įjungta' : 'Išjungta' }}
      </div>
    </div>

    <div class="setting-item">
      <label>Rodyti vaizdo įrašą</label>
      <div class="button townsfolk" @click="toggleVisual">
        <font-awesome-icon :icon="showVisual ? 'eye' : 'eye-slash'" />
        {{ showVisual ? 'Rodoma' : 'Paslėpta' }}
      </div>
    </div>

    <div class="setting-item">
      <label>Garsumas: {{ volume }}%</label>
      <input type="range" min="0" max="100" v-model.number="localVolume" @input="updateVolume" />
    </div>

    <div class="setting-item">
      <label>Youtube Playlist ID (Dienai)</label>
      <input type="text" v-model="localPlaylistId" @change="updatePlaylist" placeholder="PL..." />
    </div>

    <div class="setting-item">
      <label>Youtube Video ID (Nakčiai)</label>
      <input type="text" v-model="localNightTrackId" @change="updateNightTrack" placeholder="Video ID" />
    </div>

    <div class="player-controls" v-if="isEnabled">
      <h4>Grotuvo valdymas</h4>
      <div class="button-group">
        <div class="button townsfolk" @click="$emit('prev')" title="Ankstesnis kūrinys">
          <font-awesome-icon icon="step-backward" />
          <span>Atgal</span>
        </div>
        <div class="button townsfolk" @click="$emit('toggle')" :title="isPlaying ? 'Sustabdyti' : 'Paleisti'">
          <font-awesome-icon :icon="isPlaying ? 'pause' : 'play'" />
          <span>{{ isPlaying ? 'Pauzė' : 'Groti' }}</span>
        </div>
        <div class="button townsfolk" @click="$emit('next')" title="Kitas kūrinys">
          <span>Pirmyn</span>
          <font-awesome-icon icon="step-forward" />
        </div>
      </div>
    </div>

    <div class="playlist-container" v-if="isEnabled && playlist.length">
      <h4>Grojaraštis</h4>
      <ul class="playlist-tracks">
        <li 
          v-for="(trackId, index) in playlist" 
          :key="trackId + index"
          :class="{ active: currentTrackIndex === index }"
          @click="$emit('play-track', index)"
        >
          <span class="track-number">{{ index + 1 }}.</span>
          <span class="track-id">Kūrinys {{ trackId }}</span>
        </li>
      </ul>
    </div>
  </Modal>
</template>

<script>
import Modal from "./Modal";
import { mapState, mapMutations } from "vuex";

export default {
  components: { Modal },
  props: {
    playlist: {
      type: Array,
      default: () => [],
    },
    currentTrackIndex: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      localVolume: 0,
      localPlaylistId: "",
      localNightTrackId: "",
    };
  },
  computed: {
    ...mapState(["modals"]),
    ...mapState("audio", ["isEnabled", "volume", "playlistId", "nightTrackId", "isPlaying", "showVisual"]),
  },
  mounted() {
    this.localVolume = this.volume;
    this.localPlaylistId = this.playlistId;
    this.localNightTrackId = this.nightTrackId;
  },
  methods: {
    ...mapMutations(["toggleModal"]),
    ...mapMutations("audio", ["toggleEnabled", "setVolume", "setPlaylistId", "setNightTrackId", "toggleVisual"]),
    updateVolume() {
      this.setVolume(this.localVolume);
    },
    updatePlaylist() {
      this.setPlaylistId(this.localPlaylistId);
    },
    updateNightTrack() {
      this.setNightTrackId(this.localNightTrackId);
    },
  }
};
</script>

<style lang="scss" scoped>
@import "../../vars.scss";

.setting-item {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    font-size: 0.9em;
    opacity: 0.8;
  }

  input[type="text"] {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px;
    border-radius: 5px;
  }
}

.player-controls {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;

  h4 {
    margin-bottom: 10px;
    font-size: 1em;
    opacity: 0.9;
  }

  .button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 15px;
    
    span {
      font-size: 0.8em;
    }
  }
}

.playlist-container {
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 10px;

  h4 {
    font-size: 1em;
    margin-bottom: 10px;
    text-align: center;
  }

  .playlist-tracks {
    list-style: none;
    padding: 0;
    
    li {
      padding: 8px 10px;
      cursor: pointer;
      display: flex;
      gap: 10px;
      font-size: 0.9em;
      border-radius: 5px;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.active {
        background: rgba($townsfolk, 0.3);
        color: $townsfolk;
        font-weight: bold;
      }

      .track-number {
        opacity: 0.5;
        min-width: 25px;
      }
    }
  }
}
</style>
