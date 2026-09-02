import { useRef, useState } from 'react';
import { reportedByDataLayer } from '../lib/errorBus';
import { Chip } from '../components/Chip';
import { Field } from '../components/Field';
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

const MAX = 2000;

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

  const canPost = text.trim().length > 0 && !busy;
  // A failed post keeps the sheet open with the draft intact; the data layer
  // has already told the member what went wrong.
  const post = () => {
    if (!canPost) return;
    if (demo) {
      setPosted(true);
      setTimeout(close, 1600);
      return;
    }
    setBusy(true);
    void repo.createFeedPost(text, { kind, photos }).then(() => {
      setPosted(true);
      setTimeout(close, 1600);
    }).catch(reportedByDataLayer)
      .finally(() => setBusy(false));
  };

  const photoBtn = 'w-11 h-11 border-none bg-transparent flex items-center justify-center cursor-pointer -ml-1';
  const disc = 'w-9 h-9 rounded-full bg-mist flex items-center justify-center';

  return (
    <Sheet label="Share something with neighbors" open onClose={close}>
      {posted ? (
        <div className="text-center py-6 animate-fadeup" role="status">
          <Confetti />
          <PhIcon name="ph-fill ph-check-circle" size={40} color="rgb(var(--sage))" />
          <h2 className="m-0 mt-3 font-serif font-normal text-[19px] text-navy">Posted!</h2>
          <p className="m-0 mt-1 text-[13px] font-bold text-slate">
            Your neighbors will see this in the feed.
          </p>
        </div>
      ) : (
        <>
          <h2 className="m-0 mb-3 font-serif font-normal text-[19px] text-navy">Share with your neighbors</h2>
          {!demo && (
            <div role="group" aria-label="Kind of post" className="flex gap-1.5 flex-wrap mb-3">
              {KINDS.map((k) => (
                <Chip key={k.key} label={k.label} active={kind === k.key} onClick={() => setKind(k.key)} size="md" />
              ))}
            </div>
          )}
          <Field
            as="textarea"
            label="Your post"
            hideLabel
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={MAX}
            rows={4}
            autoFocus
            style={{ minHeight: 100, border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))', borderRadius: 16, padding: '12px 16px', fontSize: 14 }}
          />
          {/* A cap that silently stops accepting keystrokes reads as a broken
              field. Show the ceiling only once it is close enough to matter. */}
          {text.length > MAX - 300 && (
            <p
              className="m-0 mt-1.5 text-right text-[12px] font-bold"
              style={{ color: text.length >= MAX ? 'rgb(var(--sunsetdeep))' : 'rgb(var(--slate))' }}
              aria-live="polite"
            >
              {text.length >= MAX
                ? `That's the limit (${MAX.toLocaleString()} characters) — trim a little to post`
                : `${(MAX - text.length).toLocaleString()} characters left`}
            </p>
          )}
          <div className="flex items-center justify-between mt-3 gap-2">
            <div className="flex gap-1 items-center min-w-0">
              {demo ? (
                composePhoto ? (
                  <span className="text-[12.5px] font-bold text-sagedark flex items-center gap-1">
                    <PhIcon name="ph-fill ph-check-circle" size={14} color="rgb(var(--sagedark))" />
                    Photo attached
                  </span>
                ) : (
                  <>
                    <button type="button" aria-label="Take a photo" onClick={() => set({ composePhoto: true })} className={photoBtn}>
                      <span className={disc}><PhIcon name="ph-fill ph-camera" size={18} color="rgb(var(--slate))" /></span>
                    </button>
                    <button type="button" aria-label="Add a photo from your library" onClick={() => set({ composePhoto: true })} className={photoBtn}>
                      <span className={disc}><PhIcon name="ph-fill ph-image-square" size={18} color="rgb(var(--slate))" /></span>
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
                    aria-hidden="true"
                    tabIndex={-1}
                    onChange={(e) => setPhotos([...photos, ...Array.from(e.target.files ?? [])].slice(0, 4))}
                  />
                  <button type="button" aria-label={photos.length ? 'Add another photo' : 'Add a photo'} onClick={() => fileRef.current?.click()} className={photoBtn}>
                    <span className={disc}>
                      <PhIcon name="ph-fill ph-image-square" size={18} color={photos.length ? 'rgb(var(--sagedark))' : 'rgb(var(--slate))'} />
                    </span>
                  </button>
                  {photos.length > 0 && (
                    <span className="text-[12.5px] font-bold text-sagedark flex items-center gap-1">
                      <PhIcon name="ph-fill ph-check-circle" size={14} color="rgb(var(--sagedark))" />
                      {photos.length} photo{photos.length > 1 ? 's' : ''}{photos.length >= 4 ? ' (max)' : ''}
                    </span>
                  )}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={post}
              disabled={!canPost}
              className="rounded-full px-5 border-none text-[13.5px] font-extrabold cursor-pointer font-sans min-h-[44px] flex-shrink-0"
              style={{
                background: canPost ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))',
                color: canPost ? 'rgb(var(--mist))' : 'rgb(var(--slatedark))',
                cursor: canPost ? 'pointer' : 'default',
              }}
            >
              {busy ? 'Posting…' : 'Post to the Commons'}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
