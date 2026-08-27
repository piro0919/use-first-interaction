/**
 * Stands in for the third party you did not want in the first paint: an
 * analytics tag, a chat widget, a heatmap recorder. It is its own chunk, so the
 * browser really does go and fetch it — that is the point of the demo.
 */
export const PAYLOAD = {
  name: "@example/heatmap-recorder",
  started: () => new Date().toLocaleTimeString(),
};
