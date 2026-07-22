import { useRef, useState } from 'react';
import { Sheet } from '../components/Sheet';
import { PhIcon } from '../components/PhIcon';
import { Confetti } from '../components/Confetti';
import { usePavStore } from '../store/store';
import { useRepository } from '../data/repo';

const KINDS = [
  { key: 'post', label: 'Post' },
  { key: 'shoutout', label: 'Shoutout' },
  { key: 'borrow', label: 'Help & Borrow' },
  { key: 'sale', label: 'For Sale & Free' },
];

export function ComposeSheet() {
  const composeOpen = usePavStore((s) => s.composeOpen);
  const composePhoto = usePavStore((s) => s.composePhoto);
  const set = usePavStore((s) => s.set);
  const repo = useRepository();
  const demo = repo.isDemo();
  const [text, setText] = useState('');
  const [kind, setKind] = useState('post');
  const [photos, setPhotos] = useState<File[]>([]);
  const [posted, setPosted] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!composeOpen) return null;

  const close = () => {
    set({ composeOpen: false, composePhoto: false });
    setText(''); setKind('post'); setPhotos([]);
    setPosted(false);
  };

  const post = () => {
    if (!text.trim() || busy) return;
    if (demo) {
      setPosted(true);
      setTimeout(close, 1600);
      return;
    }
    setBusy(true);
    void repo.createFeedPost(text, { kind, photos }).then(() => {
      setPosted(true);
      setTimeout(close, 1600);
    }).catch(() => {}) // failure surfaced via the app toast
      .finally(() => setBusy(false));
  };

  return (
    <Sheet open onClose={close}>
      {posted ? (
        <div className="text-center py-6 animate-fadeup">
          <Confetti />
          <PhIcon name="ph-fill ph-check-circle" size={40} color="rgb(var(--sage))" />
          <p className="m-0 mt-3 font-serif text-[19px] text-navy">Posted!</p>
          <p className="m-0 mt-1 text-[13px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
            Your neighbors will see this in the feed.
          </p>
        </div>
      ) : (
        <>
          <p className="m-0 mb-3 font-serif text-[19px] text-navy">Share with your neighbors</p>
          {!demo && (
            <div className="flex gap-1.5 flex-wrap mb-2.5">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  className="rounded-full px-3 py-1.5 text-[11.5px] font-extrabold cursor-pointer"
                  style={kind === k.key
                    ? { background: 'rgb(var(--navy))', color: 'rgb(var(--cream))', border: '1.5px solid rgb(var(--navy))' }
                    : { background: 'transparent', color: 'rgb(var(--navy))', border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                >
                  {k.label}
                </button>
              ))}
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full rounded-2xl border-none bg-cream px-4 py-3 text-[14px] font-semibold text-navy resize-none font-sans"
            style={{ minHeight: 100, outline: 'none' }}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2 items-center">
              {demo ? (
                composePhoto ? (
                  <span className="text-[11.5px] font-bold text-sage flex items-center gap-1">
                    <PhIcon name="ph-fill ph-check-circle" size={14} color="rgb(var(--sage))" />
                    Photo attached
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => set({ composePhoto: true })}
                      className="w-9 h-9 rounded-full bg-cream flex items-center justify-center border-none cursor-pointer"
                    >
                      <PhIcon name="ph-fill ph-camera" size={18} color="rgb(var(--stone))" />
                    </button>
                    <button
                      type="button"
                      onClick={() => set({ composePhoto: true })}
                      className="w-9 h-9 rounded-full bg-cream flex items-center justify-center border-none cursor-pointer"
                    >
                      <PhIcon name="ph-fill ph-image-square" size={18} color="rgb(var(--stone))" />
                    </button>
                  </>
                )
              ) : (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setPhotos([...photos, ...Array.from(e.target.files ?? [])].slice(0, 4))}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-9 h-9 rounded-full bg-cream flex items-center justify-center border-none cursor-pointer"
                  >
                    <PhIcon name="ph-fill ph-image-square" size={18} color={photos.length ? 'rgb(var(--sage))' : 'rgb(var(--stone))'} />
                  </button>
                  {photos.length > 0 && (
                    <span className="text-[11.5px] font-bold text-sage flex items-center gap-1">
                      <PhIcon name="ph-fill ph-check-circle" size={14} color="rgb(var(--sage))" />
                      {photos.length} photo{photos.length > 1 ? 's' : ''}
                    </span>
                  )}
                </>
              )}
            </div>
            <button
              onClick={post}
              disabled={!text.trim() || busy}
              className="rounded-2xl px-5 py-2.5 border-none text-[14px] font-extrabold cursor-pointer font-sans"
              style={{
                background: text.trim() && !busy ? 'rgb(var(--navy))' : 'rgb(var(--navy) / 0.1)',
                color: text.trim() && !busy ? 'rgb(var(--cream))' : 'rgb(var(--stonelight))',
              }}
            >
              {busy ? 'Posting…' : 'Post'}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
