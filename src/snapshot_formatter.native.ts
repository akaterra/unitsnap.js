import { Snapshot, SnapshotNativeEntry, _Snapshot } from './snapshot';

export function formatNativeSnapshotEntries(shapshot: _Snapshot): SnapshotNativeEntry[] {
  const processor = shapshot.env.processor;
  const mapper = shapshot.env.mapper;

  return shapshot.entries.map((entry, ind) => processor.serialize(
    mapper(shapshot, entry),
    `[${ind}]`,
  ));
}
