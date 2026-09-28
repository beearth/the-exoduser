// The playable CH1 map uses its chunks/layout, not the large authoring master.
export function isMapAuthoringSource(path) {
  return /^assets\/map\/ch1\/production_finish\/(?:CH1_1_PRODUCTION_MASTER\.png$|(?:outer\d+|skin\d+)_sources\/)/.test(path.replaceAll('\\','/'));
}
