import { useState } from 'react';
import { SegmentedControl } from 'pavilion-v2';

// Light variant (default): sand track, active segment lifts to a paper card.
// Used on resident-facing screens. 2–4 mutually exclusive views.
export const Light = () => {
  const [v, setV] = useState('feed');
  return (
    <div style={{ width: 320 }}>
      <SegmentedControl
        variant="light"
        value={v}
        onChange={setV}
        options={[
          { key: 'feed', label: 'Feed' },
          { key: 'groups', label: 'Groups' },
          { key: 'people', label: 'People' },
        ]}
      />
    </div>
  );
};

// Dark variant: active segment fills navy with cream text — the higher-contrast
// treatment used on board/admin surfaces.
export const Dark = () => {
  const [v, setV] = useState('board');
  return (
    <div style={{ width: 320 }}>
      <SegmentedControl
        variant="dark"
        value={v}
        onChange={setV}
        options={[
          { key: 'board', label: 'Board' },
          { key: 'residents', label: 'Residents' },
        ]}
      />
    </div>
  );
};
