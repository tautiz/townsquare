<template>
  <div id="controls">
    <span
      class="nomlog-summary"
      v-show="session.voteHistory.length && session.sessionId"
      @click="toggleModal('voteHistory')"
      :title="`${session.voteHistory.length} paskutinės ${
        session.voteHistory.length == 1 ? 'nominacija' : 'nominacijos'
      }`"
    >
      <font-awesome-icon icon="book-dead" />
      {{ session.voteHistory.length }}
    </span>
    <span
      class="session"
      :class="{
        spectator: session.isSpectator,
        reconnecting: session.isReconnecting,
      }"
      v-if="session.sessionId"
      @click="leaveSession"
      :title="`${session.playerCount} kiti žaidėjai šioje sesijoje${
        session.ping ? ' (' + session.ping + 'ms vėlavimas)' : ''
      }`"
    >
      <font-awesome-icon icon="broadcast-tower" />
      {{ session.playerCount }}
    </span>
    <div class="menu" :class="{ open: grimoire.isMenuOpen }">
      <font-awesome-icon icon="cog" @click="toggleMenu" />
      <ul>
        <li class="tabs" :class="tab">
          <font-awesome-icon icon="book-open" @click="tab = 'grimoire'" />
          <font-awesome-icon icon="broadcast-tower" @click="tab = 'session'" />
          <font-awesome-icon
            icon="users"
            v-if="!session.isSpectator"
            @click="tab = 'players'"
          />
          <font-awesome-icon icon="theater-masks" @click="tab = 'characters'" />
          <font-awesome-icon icon="question" @click="tab = 'help'" />
        </li>

        <template v-if="tab === 'grimoire'">
          <!-- Grimoire -->
          <li class="headline">Grimuaras</li>
          <li @click="toggleGrimoire" v-if="players.length">
            <template v-if="!grimoire.isPublic">Slėpti</template>
            <template v-if="grimoire.isPublic">Rodyti</template>
            <em>[G]</em>
          </li>
          <li @click="toggleNight" v-if="!session.isSpectator">
            <template v-if="!grimoire.isNight">Perjungti į Naktį</template>
            <template v-if="grimoire.isNight">Perjungti į Dieną</template>
            <em>[S]</em>
          </li>
          <li @click="toggleNightOrder" v-if="players.length">
            Nakties tvarka
            <em>
              <font-awesome-icon
                :icon="[
                  'fas',
                  grimoire.isNightOrder ? 'check-square' : 'square',
                ]"
              />
            </em>
          </li>
          <li v-if="players.length">
            Mastelis
            <em>
              <font-awesome-icon
                @click="setZoom(grimoire.zoom - 1)"
                icon="search-minus"
              />
              {{ Math.round(100 + grimoire.zoom * 10) }}%
              <font-awesome-icon
                @click="setZoom(grimoire.zoom + 1)"
                icon="search-plus"
              />
            </em>
          </li>
          <li @click="setBackground">
            Fono paveikslėlis
            <em><font-awesome-icon icon="image" /></em>
          </li>
          <li v-if="!edition.isOfficial" @click="imageOptIn">
            <small>Rodyti nestandartinius paveikslėlius</small>
            <em
              ><font-awesome-icon
                :icon="[
                  'fas',
                  grimoire.isImageOptIn ? 'check-square' : 'square',
                ]"
            /></em>
          </li>
          <li @click="toggleStatic">
            Išjungti animacijas
            <em
              ><font-awesome-icon
                :icon="['fas', grimoire.isStatic ? 'check-square' : 'square']"
            /></em>
          </li>
          <li @click="toggleMuted">
            Nutildyti garsus
            <em
              ><font-awesome-icon
                :icon="['fas', grimoire.isMuted ? 'volume-mute' : 'volume-up']"
            /></em>
          </li>
        </template>

        <template v-if="tab === 'session'">
          <!-- Session -->
          <li class="headline" v-if="session.sessionId">
            {{ session.isSpectator ? "Žaidžia" : "Hostina" }}
          </li>
          <li class="headline" v-else>Gyva sesija</li>
          <template v-if="!session.sessionId">
            <li @click="hostSession">Hostinti (Pasakotojas)<em>[H]</em></li>
            <li @click="joinSession">Prisijungti (Žaidėjas)<em>[J]</em></li>
          </template>
          <template v-else>
            <li v-if="session.ping">
              Vėlavimas {{ session.isSpectator ? "hostui" : "žaidėjams" }}
              <em>{{ session.ping }}ms</em>
            </li>
            <li @click="copySessionUrl">
              Kopijuoti žaidėjo nuorodą
              <em><font-awesome-icon icon="copy" /></em>
            </li>
            <li v-if="!session.isSpectator" @click="distributeRoles">
              Siųsti veikėjus
              <em><font-awesome-icon icon="theater-masks" /></em>
            </li>
            <li
              v-if="session.voteHistory.length || !session.isSpectator"
              @click="toggleModal('voteHistory')"
            >
              Balsavimo istorija<em>[V]</em>
            </li>
            <li @click="leaveSession">
              Palikti sesiją
              <em>{{ session.sessionId }}</em>
            </li>
          </template>
        </template>

        <template v-if="tab === 'players' && !session.isSpectator">
          <!-- Users -->
          <li class="headline">Žaidėjai</li>
          <li @click="addPlayer" v-if="players.length < 20">
            Pridėti<em>[A]</em>
          </li>
          <li @click="randomizeSeatings" v-if="players.length > 2">
            Sumaišyti
            <em><font-awesome-icon icon="dice" /></em>
          </li>
          <li @click="clearPlayers" v-if="players.length">
            Pašalinti visus
            <em><font-awesome-icon icon="trash-alt" /></em>
          </li>
        </template>

        <template v-if="tab === 'characters'">
          <!-- Characters -->
          <li class="headline">Veikėjai</li>
          <li v-if="!session.isSpectator" @click="toggleModal('edition')">
            Pasirinkti leidimą
            <em>[E]</em>
          </li>
          <li
            @click="toggleModal('roles')"
            v-if="!session.isSpectator && players.length > 4"
          >
            Pasirinkti ir priskirti
            <em>[C]</em>
          </li>
          <li v-if="!session.isSpectator" @click="toggleModal('fabled')">
            Pridėti Fabled
            <em><font-awesome-icon icon="dragon" /></em>
          </li>
          <li @click="clearRoles" v-if="players.length">
            Pašalinti visus
            <em><font-awesome-icon icon="trash-alt" /></em>
          </li>
        </template>

        <template v-if="tab === 'help'">
          <!-- Help -->
          <li class="headline">Pagalba</li>
          <li @click="toggleModal('reference')">
            Nuorodų lapas
            <em>[R]</em>
          </li>
          <li @click="toggleModal('nightOrder')">
            Nakties tvarkos lapas
            <em>[N]</em>
          </li>
          <li @click="toggleModal('gameState')">
            Žaidimo būsenos JSON
            <em><font-awesome-icon icon="file-code" /></em>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  computed: {
    ...mapState(["grimoire", "session", "edition"]),
    ...mapState("players", ["players"]),
  },
  data() {
    return {
      tab: "grimoire",
    };
  },
  methods: {
    setBackground() {
      const background = prompt("Įveskite nestandartinio fono URL");
      if (background || background === "") {
        this.$store.commit("setBackground", background);
      }
    },
    hostSession() {
      if (this.session.sessionId) return;
      const sessionId = prompt(
        "Įveskite kanalo numerį / pavadinimą savo sesijai",
        Math.round(Math.random() * 10000),
      );
      if (sessionId) {
        this.$store.commit("session/clearVoteHistory");
        this.$store.commit("session/setSpectator", false);
        this.$store.commit("session/setSessionId", sessionId);
        this.copySessionUrl();
      }
    },
    copySessionUrl() {
      const url = window.location.href.split("#")[0];
      const link = url + "#" + this.session.sessionId;
      navigator.clipboard.writeText(link);
    },
    distributeRoles() {
      if (this.session.isSpectator) return;
      const popup =
        "Ar norite išdalinti priskirtus veikėjus visiems SĖDINTIEMS žaidėjams?";
      if (confirm(popup)) {
        this.$store.commit("session/distributeRoles", true);
        setTimeout(
          (() => {
            this.$store.commit("session/distributeRoles", false);
          }).bind(this),
          2000,
        );
      }
    },
    imageOptIn() {
      const popup =
        "Ar tikrai norite leisti nestandartinius paveikslėlius? Kenkėjiško skripto autorius gali sužinoti jūsų IP adresą tokiu būdu.";
      if (this.grimoire.isImageOptIn || confirm(popup)) {
        this.toggleImageOptIn();
      }
    },
    joinSession() {
      if (this.session.sessionId) return this.leaveSession();
      let sessionId = prompt(
        "Įveskite sesijos kanalo numerį / pavadinimą, prie kurio norite prisijungti",
      );
      if (sessionId.match(/^https?:\/\//i)) {
        sessionId = sessionId.split("#").pop();
      }
      if (sessionId) {
        this.$store.commit("session/clearVoteHistory");
        this.$store.commit("session/setSpectator", true);
        this.$store.commit("toggleGrimoire", false);
        this.$store.commit("session/setSessionId", sessionId);
      }
    },
    leaveSession() {
      if (confirm("Ar tikrai norite palikti aktyvų gyvą žaidimą?")) {
        this.$store.commit("session/setSpectator", false);
        this.$store.commit("session/setSessionId", "");
      }
    },
    addPlayer() {
      if (this.session.isSpectator) return;
      if (this.players.length >= 20) return;
      const name = prompt("Žaidėjo vardas");
      if (name) {
        this.$store.commit("players/add", name);
      }
    },
    randomizeSeatings() {
      if (this.session.isSpectator) return;
      if (confirm("Ar tikrai norite sumaišyti vietas?")) {
        this.$store.dispatch("players/randomize");
      }
    },
    clearPlayers() {
      if (this.session.isSpectator) return;
      if (confirm("Ar tikrai norite pašalinti visus žaidėjus?")) {
        // abort vote if in progress
        if (this.session.nomination) {
          this.$store.commit("session/nomination");
        }
        this.$store.commit("players/clear");
      }
    },
    clearRoles() {
      if (confirm("Ar tikrai norite pašalinti visus žaidėjų vaidmenis?")) {
        this.$store.dispatch("players/clearRoles");
      }
    },
    toggleNight() {
      this.$store.commit("toggleNight");
      if (this.grimoire.isNight) {
        this.$store.commit("session/setMarkedPlayer", -1);
      }
    },
    ...mapMutations([
      "toggleGrimoire",
      "toggleMenu",
      "toggleImageOptIn",
      "toggleMuted",
      "toggleNightOrder",
      "toggleStatic",
      "setZoom",
      "toggleModal",
    ]),
  },
};
</script>

<style scoped lang="scss">
@import "../vars.scss";

// success animation
@keyframes greenToWhite {
  from {
    color: green;
  }
  to {
    color: white;
  }
}

// Controls
#controls {
  position: absolute;
  right: 3px;
  top: 3px;
  text-align: right;
  padding-right: 50px;
  z-index: 75;

  svg {
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 1));
    &.success {
      animation: greenToWhite 1s normal forwards;
      animation-iteration-count: 1;
    }
  }

  > span {
    display: inline-block;
    cursor: pointer;
    z-index: 5;
    margin-top: 7px;
    margin-left: 10px;
  }

  span.nomlog-summary {
    color: $townsfolk;
  }

  span.session {
    color: $demon;
    &.spectator {
      color: $townsfolk;
    }
    &.reconnecting {
      animation: blink 1s infinite;
    }
  }
}

@keyframes blink {
  50% {
    opacity: 0.5;
    color: gray;
  }
}

.menu {
  width: 220px;
  transform-origin: 200px 22px;
  transition: transform 500ms cubic-bezier(0.68, -0.55, 0.27, 1.55);
  transform: rotate(-90deg);
  position: absolute;
  right: 0;
  top: 0;

  &.open {
    transform: rotate(0deg);
  }

  > svg {
    cursor: pointer;
    background: rgba(0, 0, 0, 0.5);
    border: 3px solid black;
    width: 40px;
    height: 50px;
    margin-bottom: -8px;
    border-bottom: 0;
    border-radius: 10px 10px 0 0;
    padding: 5px 5px 15px;
  }

  a {
    color: white;
    text-decoration: none;
    &:hover {
      color: red;
    }
  }

  ul {
    display: flex;
    list-style-type: none;
    padding: 0;
    margin: 0;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 10px black;
    border: 3px solid black;
    border-radius: 10px 0 10px 10px;

    li {
      padding: 2px 5px;
      color: white;
      text-align: left;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 30px;

      &.tabs {
        display: flex;
        padding: 0;
        svg {
          flex-grow: 1;
          flex-shrink: 0;
          height: 35px;
          border-bottom: 3px solid black;
          border-right: 3px solid black;
          padding: 5px 0;
          cursor: pointer;
          transition: color 250ms;
          &:hover {
            color: red;
          }
          &:last-child {
            border-right: 0;
          }
        }
        &.grimoire .fa-book-open,
        &.players .fa-users,
        &.characters .fa-theater-masks,
        &.session .fa-broadcast-tower,
        &.help .fa-question {
          background: linear-gradient(
            to bottom,
            $townsfolk 0%,
            rgba(0, 0, 0, 0.5) 100%
          );
        }
      }

      &:not(.headline):not(.tabs):hover {
        cursor: pointer;
        color: red;
      }

      em {
        flex-grow: 0;
        font-style: normal;
        margin-left: 10px;
        font-size: 80%;
      }
    }

    .headline {
      font-family: PiratesBay, sans-serif;
      letter-spacing: 1px;
      padding: 0 10px;
      text-align: center;
      justify-content: center;
      background: linear-gradient(
        to right,
        $townsfolk 0%,
        rgba(0, 0, 0, 0.5) 20%,
        rgba(0, 0, 0, 0.5) 80%,
        $demon 100%
      );
    }
  }
}
</style>
