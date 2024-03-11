import { Snapshot, SnapshotNativeEntry, _Snapshot } from './snapshot';

export function formatNativeSnapshotEntries(snapshot: _Snapshot): string | SnapshotNativeEntry[] {
  const processor = snapshot.env.processor;
  const mapper = snapshot.env.mapper;

  if (!Array.isArray(snapshot.entries)) {
    return snapshot.entries;
  }

  return snapshot.entries.map((entry, ind) => processor.serialize(
    mapper(snapshot, entry),
    `[${ind}]`,
  ));
}
