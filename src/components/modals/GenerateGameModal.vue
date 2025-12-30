<template>
  <Modal
    class="generate-game"
    v-if="modals.generateGame"
    @close="toggleModal('generateGame')"
  >
    <h3>Generuoti žaidimą</h3>
    <div class="input-group">
      <label for="playerCount">Kiek bus žaidėjų?</label>
      <input
        id="playerCount"
        type="number"
        v-model.number="count"
        min="1"
        max="20"
        @keyup.enter="generate"
      />
    </div>
    <div class="button-group">
      <div class="button townsfolk" @click="generate">
        <font-awesome-icon icon="plus-circle" /> Generuoti
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from "./Modal";
import { mapMutations, mapState } from "vuex";

export default {
  components: {
    Modal,
  },
  data() {
    return {
      count: 12,
    };
  },
  computed: {
    ...mapState(["modals"]),
  },
  methods: {
    generate() {
      if (this.count > 0) {
        this.$store.dispatch("players/generatePlayers", this.count);
        this.toggleModal("generateGame");
      }
    },
    ...mapMutations(["toggleModal"]),
  },
};
</script>

<style lang="scss" scoped>
@import "../../vars.scss";

h3 {
  margin-bottom: 20px;
}

.input-group {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  label {
    margin-bottom: 10px;
  }

  input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: white;
    padding: 10px;
    border-radius: 5px;
    width: 100px;
    text-align: center;
    font-size: 1.2em;

    &:focus {
      outline: none;
      border-color: $townsfolk;
    }
  }
}
</style>
