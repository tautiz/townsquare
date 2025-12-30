<template>
  <div class="show-info-overlay" v-if="modals.showInfo">
    <div class="info-content" @click.stop>
      <div class="header">
        <span class="role-name" v-if="role">{{ role.name }}</span>
        <button class="close-btn" @click="close">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <div class="main-info">
        <div class="info-text" v-if="infoText">{{ infoText }}</div>
        
        <div class="bluffs-section" v-if="role && role.team === 'demon' && bluffs.length">
          <h3>Galimi blefai</h3>
          <div class="bluffs-grid">
            <div v-for="bluff in bluffs" :key="bluff.id" class="bluff-item">
              <div 
                class="role-icon" 
                :style="{ backgroundImage: `url(${getIconUrl(bluff)})` }"
              ></div>
              <span class="bluff-name">{{ bluff.name }}</span>
            </div>
          </div>
        </div>

        <div class="team-info" v-if="teamPlayers.length">
          <h3>{{ teamTitle }}</h3>
          <div class="players-list">
            <div v-for="p in teamPlayers" :key="p.id" class="player-info">
              <div 
                class="role-icon" 
                :style="{ backgroundImage: `url(${getIconUrl(p.role)})` }"
              ></div>
              <div class="player-details">
                <span class="p-name">{{ p.name }}</span>
                <span class="p-role">{{ p.role.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <small>Paspauskite X mygtuką, kad uždarytumėte</small>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  name: "ShowInfoModal",
  computed: {
    ...mapState(["modals", "grimoire", "edition"]),
    ...mapState("players", ["players", "bluffs"]),
    role() {
      return this.$store.state.showInfoRole;
    },
    infoText() {
      if (!this.role) return "";
      if (this.role.team === "minion") {
        return "Tai tavo valdovas ir nakties valgytojai";
      }
      if (this.role.team === "demon") {
        return "Tai tavo pakalikai";
      }
      return this.role.ability || "";
    },
    teamTitle() {
      if (!this.role) return "";
      return this.role.team === "demon" ? "Tavo pakalikai" : "Tavo komanda";
    },
    teamPlayers() {
      if (!this.role) return [];
      if (this.role.team === "demon") {
        return this.players.filter(p => p.role.team === "minion");
      }
      if (this.role.team === "minion") {
        return this.players.filter(p => p.role.team === "demon" || (p.role.team === "minion" && p.role.id !== this.role.id));
      }
      return [];
    }
  },
  methods: {
    ...mapMutations(["toggleModal"]),
    close() {
      this.toggleModal("showInfo");
    },
    getIconUrl(role) {
      if (role.image && this.grimoire.isImageOptIn) {
        return role.image;
      }
      try {
        return require(`../../assets/icons/${role.imageAlt || role.id}.png`);
      } catch (e) {
        return "";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../vars.scss";

.show-info-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.info-content {
  background: #1a1a1a;
  border: 2px solid $townsfolk;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  padding: 30px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba($townsfolk, 0.2);
  color: white;
  text-align: center;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;

  .role-name {
    font-family: PiratesBay, sans-serif;
    font-size: 2.5em;
    color: $townsfolk;
    letter-spacing: 2px;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5em;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.2s;
    &:hover { opacity: 1; }
  }
}

.info-text {
  font-size: 1.8em;
  margin-bottom: 30px;
  font-weight: bold;
  line-height: 1.4;
}

.bluffs-section, .team-info {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;

  h3 {
    font-family: PiratesBay, sans-serif;
    margin-bottom: 15px;
    color: $demon;
    font-size: 1.5em;
  }
}

.bluffs-grid {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.bluff-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;

  .role-icon {
    width: 60px;
    height: 60px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    margin-bottom: 10px;
  }

  .bluff-name {
    font-size: 0.9em;
    opacity: 0.8;
  }
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1.2em;
  
  .role-icon {
    width: 50px;
    height: 50px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    flex-shrink: 0;
  }

  .player-details {
    display: flex;
    flex-direction: column;
    text-align: left;

    .p-name {
      font-weight: bold;
      font-size: 1.1em;
    }

    .p-role {
      opacity: 0.6;
      font-size: 0.85em;
    }
  }
}

.footer {
  margin-top: 30px;
  opacity: 0.3;
  font-size: 0.8em;
}
</style>
