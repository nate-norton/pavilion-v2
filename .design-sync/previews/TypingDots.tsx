import { TypingDots } from 'pavilion-v2';

// The three-dot "composing" bubble shown while the AI assistant is replying.
// A single, animated look (bounce isn't captured in a still) — shown here in
// its natural chat-thread context.
export const Default = () => (
  <div style={{ width: 260, padding: 8 }}>
    <TypingDots />
  </div>
);
