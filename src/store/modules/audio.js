const state = () => ({
  playlistId: "PLmHYnYPt5DSlRADaIHYA63eZWJjkIQHhU",
  nightTrackId: "PADoRF6iPx8",
  volume: 100,
  isEnabled: true,
  isPlaying: true,
  showVisual: false,
});

const mutations = {
  setPlaylistId(state, id) {
    state.playlistId = id;
  },
  setNightTrackId(state, id) {
    state.nightTrackId = id;
  },
  setVolume(state, volume) {
    state.volume = volume;
  },
  toggleEnabled(state) {
    state.isEnabled = !state.isEnabled;
  },
  setPlaying(state, playing) {
    state.isPlaying = playing;
  },
  toggleVisual(state) {
    state.showVisual = !state.showVisual;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
