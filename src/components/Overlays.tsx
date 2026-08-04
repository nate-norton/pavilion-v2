import { Suspense, lazy, type ComponentType } from 'react';
import { usePavStore } from '../store/store';

/**
 * Central mount point for the full-screen secondary screens (z 76-96) and the
 * sheets that float above them (z 80+).
 *
 * Every overlay here is code-split. Two things make that work:
 *
 * 1. Each overlay is `lazy()`, so its JavaScript lives in its own chunk.
 * 2. The open-check moved *out* of the component and into the mount below.
 *    That is the part that matters — these components each start with
 *    `if (!state.xOpen) return null`, so if they were always mounted React
 *    would resolve every chunk on first paint and the split would buy
 *    nothing. Gating the mount means a resident downloads Board Desk only
 *    if they actually open Board Desk.
 *
 * Consequence to respect when editing: the flag in `useMount` below must stay
 * in sync with the guard inside the component. The component keeps its own
 * guard (it is still the source of truth for finer conditions like
 * `!state.chatWith`); the flag here is the coarse "could this be visible at
 * all" gate.
 */

const MyPlace = lazy(() => import('../screens/MyPlace').then((m) => ({ default: m.MyPlace })));
const MapScreen = lazy(() => import('../screens/MapScreen').then((m) => ({ default: m.MapScreen })));
const Notifications = lazy(() => import('../screens/Notifications').then((m) => ({ default: m.Notifications })));
const Documents = lazy(() => import('../screens/Documents').then((m) => ({ default: m.Documents })));
const CircleDetail = lazy(() => import('../screens/CircleDetail').then((m) => ({ default: m.CircleDetail })));
const Events = lazy(() => import('../screens/Events').then((m) => ({ default: m.Events })));
const Meeting = lazy(() => import('../screens/Meeting').then((m) => ({ default: m.Meeting })));
const Messages = lazy(() => import('../screens/Messages').then((m) => ({ default: m.Messages })));
const Chat = lazy(() => import('../screens/Chat').then((m) => ({ default: m.Chat })));
const GroupDetail = lazy(() => import('../screens/GroupDetail').then((m) => ({ default: m.GroupDetail })));
const Search = lazy(() => import('../screens/Search').then((m) => ({ default: m.Search })));
const BoardDesk = lazy(() => import('../screens/BoardDesk').then((m) => ({ default: m.BoardDesk })));
const Portfolio = lazy(() => import('../screens/Portfolio').then((m) => ({ default: m.Portfolio })));
const BoardChat = lazy(() => import('../screens/BoardChat').then((m) => ({ default: m.BoardChat })));
const Onboarding = lazy(() => import('../screens/Onboarding').then((m) => ({ default: m.Onboarding })));
const SignIn = lazy(() => import('../screens/SignIn').then((m) => ({ default: m.SignIn })));

const PassSheet = lazy(() => import('../sheets/PassSheet').then((m) => ({ default: m.PassSheet })));
const PaySheet = lazy(() => import('../sheets/PaySheet').then((m) => ({ default: m.PaySheet })));
const SASheet = lazy(() => import('../sheets/SASheet').then((m) => ({ default: m.SASheet })));
const ArcSheet = lazy(() => import('../sheets/ArcSheet').then((m) => ({ default: m.ArcSheet })));
const ReportSheet = lazy(() => import('../sheets/ReportSheet').then((m) => ({ default: m.ReportSheet })));
const ViolSheet = lazy(() => import('../sheets/ViolSheet').then((m) => ({ default: m.ViolSheet })));
const AiSheet = lazy(() => import('../sheets/AiSheet').then((m) => ({ default: m.AiSheet })));
const ExportSheet = lazy(() => import('../sheets/ExportSheet').then((m) => ({ default: m.ExportSheet })));
const ArcDetailSheet = lazy(() => import('../sheets/ArcDetailSheet').then((m) => ({ default: m.ArcDetailSheet })));
const IssueDetailSheet = lazy(() => import('../sheets/IssueDetailSheet').then((m) => ({ default: m.IssueDetailSheet })));
const PaymentDetailSheet = lazy(() => import('../sheets/PaymentDetailSheet').then((m) => ({ default: m.PaymentDetailSheet })));
const DecisionDetailSheet = lazy(() => import('../sheets/DecisionDetailSheet').then((m) => ({ default: m.DecisionDetailSheet })));
const ComposeSheet = lazy(() => import('../sheets/ComposeSheet').then((m) => ({ default: m.ComposeSheet })));
const ManageAmenitiesSheet = lazy(() => import('../sheets/ManageAmenitiesSheet').then((m) => ({ default: m.ManageAmenitiesSheet })));
const CreateGroupSheet = lazy(() => import('../sheets/CreateGroupSheet').then((m) => ({ default: m.CreateGroupSheet })));

/** Mounts `Cmp` only while `on` is true, so its chunk loads on first open. */
function Gate({ on, Cmp }: { on: boolean; Cmp: ComponentType }) {
  if (!on) return null;
  return <Cmp />;
}

export function Overlays() {
  const s = usePavStore();

  return (
    // No fallback: overlays animate in over the current screen, and a spinner
    // between tap and sheet would read as jank. The chunks are small enough
    // that the sheet's own entry animation covers the fetch.
    <Suspense fallback={null}>
      {/* Full-screen overlay screens, layered like the prototype (z 76-96) */}
      <Gate on={s.myPlaceOpen} Cmp={MyPlace} />
      <Gate on={s.mapOpen} Cmp={MapScreen} />
      <Gate on={s.notifOpen} Cmp={Notifications} />
      <Gate on={s.docsOpen} Cmp={Documents} />
      <Gate on={s.circleOpen} Cmp={CircleDetail} />
      <Gate on={s.eventsOpen} Cmp={Events} />
      <Gate on={s.meetingOpen} Cmp={Meeting} />
      <Gate on={s.msgsOpen} Cmp={Messages} />
      <Gate on={!!s.chatWith} Cmp={Chat} />
      <Gate on={!!s.activeGroup} Cmp={GroupDetail} />
      <Gate on={s.searchOpen} Cmp={Search} />
      <Gate on={s.boardMode} Cmp={BoardDesk} />
      <Gate on={s.portfolioOpen} Cmp={Portfolio} />

      {/* Sheets (z 80+) */}
      <Gate on={s.passOpen} Cmp={PassSheet} />
      <Gate on={s.paySheetOpen} Cmp={PaySheet} />
      <Gate on={s.saSheetOpen} Cmp={SASheet} />
      <Gate on={s.arcSheetOpen} Cmp={ArcSheet} />
      <Gate on={s.reportOpen} Cmp={ReportSheet} />
      <Gate on={s.violSheetOpen} Cmp={ViolSheet} />
      <Gate on={s.aiOpen} Cmp={AiSheet} />
      <Gate on={s.exportOpen} Cmp={ExportSheet} />
      <Gate on={!!s.arcDetailId} Cmp={ArcDetailSheet} />
      <Gate on={!!s.issueDetailId} Cmp={IssueDetailSheet} />
      <Gate on={s.paymentDetailIdx != null} Cmp={PaymentDetailSheet} />
      <Gate on={s.decisionDetailIdx != null} Cmp={DecisionDetailSheet} />
      <Gate on={s.composeOpen} Cmp={ComposeSheet} />
      <Gate on={s.manageAmenOpen} Cmp={ManageAmenitiesSheet} />
      <Gate on={s.boardChatOpen} Cmp={BoardChat} />
      <Gate on={s.createGroupOpen} Cmp={CreateGroupSheet} />

      {/* Top-level overlays (z 95-97) */}
      <Gate on={s.obOpen} Cmp={Onboarding} />
      <Gate on={s.loginOpen} Cmp={SignIn} />
    </Suspense>
  );
}
