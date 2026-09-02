import { usePavStore } from '../store/store';
import { useDirectory, useDocuments, useLoadState, useMember, useVotes } from '../data/repo';
import { Door, NextStep, PrimaryButton, TextButton } from './shell';

/**
 * The first thing a new member sees after joining: their community as it
 * actually stands, counted from the same repository the app reads. Each next
 * step carries what is honestly there — zero reads as zero, and as "still
 * counting" while the repository loads — because arrival is a fact, not a
 * celebration. Board members are pointed at the Desk, since the setup card
 * that lives there is the next thing that needs them.
 */
export function Arrival({ communityName, role, onDone }: {
  communityName: string; role: 'resident' | 'board'; onDone: () => void;
}) {
  const set = usePavStore((s) => s.set);
  const member = useMember();
  const directory = useDirectory();
  const docs = useDocuments();
  const votes = useVotes();
  const ready = {
    directory: useLoadState('directory') === 'ready',
    docs: useLoadState('docs') === 'ready',
    votes: useLoadState('votes') === 'ready',
  };
  const firstName = (member?.name ?? '').trim().split(/\s+/)[0] || '';
  const isBoard = role === 'board';

  const neighbors = !ready.directory ? 'Still counting…'
    : directory.length === 0 ? 'You’re the first one here'
    : directory.length === 1 ? '1 neighbor has joined'
    : `${directory.length} neighbors have joined`;
  const documents = !ready.docs ? 'Still counting…'
    : docs.length === 0 ? 'Nothing published yet'
    : docs.length === 1 ? '1 document on file'
    : `${docs.length} documents on file`;
  const openVotes = !ready.votes ? 'Still counting…'
    : votes.openAll.length === 0 ? 'No open votes right now'
    : votes.openAll.length === 1 ? '1 open vote'
    : `${votes.openAll.length} open votes`;

  const openDesk = () => { set({ boardMode: true, boardTab: 'desk', boardSetupDismissed: false }); onDone(); };
  const lookAround = () => { set({ boardMode: false, tab: 'today' }); onDone(); };
  const goTo = (tab: string) => () => { set({ boardMode: false, tab }); onDone(); };

  return (
    <Door
      icon="ph-fill ph-house-line"
      title={firstName ? `You’re in, ${firstName}.` : 'You’re in.'}
      lede={isBoard
        ? `Welcome to ${communityName}. You’re on the board, so the Desk is yours too — that’s where you invite neighbors and publish the rules. Nothing there reaches anyone until they’re in.`
        : `Welcome to ${communityName}. Here’s what’s here so far.`}
    >
      <div className="mb-4">
        <NextStep title="Meet your neighbors" meta={neighbors} action="Commons" onClick={goTo('commons')} />
        <NextStep title="Read the rules and documents" meta={documents} action="HOA" onClick={goTo('hoa')} />
        <NextStep title="Weigh in on votes" meta={openVotes} action="HOA" onClick={goTo('hoa')} />
      </div>
      {isBoard ? (
        <>
          <PrimaryButton label="Open the Board Desk" onClick={openDesk} />
          <div className="flex justify-center mt-1">
            <TextButton label="Or look around first" onClick={lookAround} />
          </div>
        </>
      ) : (
        <PrimaryButton label="See what’s happening" onClick={lookAround} />
      )}
    </Door>
  );
}
