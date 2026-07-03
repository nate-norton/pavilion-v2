/** Three bouncing dots shown while Penny is "typing" (lines 1429-1433). */
export function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-paper border rounded-[18px_18px_18px_6px] px-4 py-[13px] flex gap-1" style={{ borderColor: 'rgba(26,51,82,0.08)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-stonelight" style={{ animation: 'typingBounce 1.1s infinite' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-stonelight" style={{ animation: 'typingBounce 1.1s 0.15s infinite' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-stonelight" style={{ animation: 'typingBounce 1.1s 0.3s infinite' }} />
      </div>
    </div>
  );
}
