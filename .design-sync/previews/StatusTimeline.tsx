import { StatusTimeline } from 'pavilion-v2';

// ARC review flow mid-process: submitted (done), board review (active),
// decision (pending). The done→active→pending state axis, with dot colors
// and connecting segments.
export const ArcReview = () => (
  <div style={{ width: 320 }}>
    <StatusTimeline
      steps={[
        { label: 'Submitted', state: 'done' },
        { label: 'Board\nreview', state: 'active' },
        { label: 'Decision', state: 'pending' },
      ]}
    />
  </div>
);

// A completed flow — every step done, all segments green.
export const Approved = () => (
  <div style={{ width: 320 }}>
    <StatusTimeline
      steps={[
        { label: 'Submitted', state: 'done' },
        { label: 'Reviewed', state: 'done' },
        { label: 'Approved', state: 'done' },
      ]}
    />
  </div>
);
