/**
 * What the learner builds across the research course, kept on this phone: their topic (from the funnel,
 * refined on the topic card) and the sources they saved while searching.
 */

export type SavedTopic = { field?: string; title: string; problem?: string; questions?: string[]; objectives?: string[]; keywords?: string };

const TOPIC = "tsn_research_topic";
const SOURCES = "tsn_research_sources";

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: the lesson still works, it just won't remember.
  }
}

export const loadTopic = () => read<SavedTopic | null>(TOPIC, null);
export const saveTopic = (t: SavedTopic) => write(TOPIC, { ...(loadTopic() ?? {}), ...t });
export const loadSources = () => read<string[]>(SOURCES, []);
export const saveSources = (ids: string[]) => write(SOURCES, ids);
