import { PassSheet } from '../sheets/PassSheet';
import { PaySheet } from '../sheets/PaySheet';
import { SASheet } from '../sheets/SASheet';
import { ArcSheet } from '../sheets/ArcSheet';
import { ReportSheet } from '../sheets/ReportSheet';
import { ViolSheet } from '../sheets/ViolSheet';
import { PennySheet } from '../sheets/PennySheet';
import { MyPlace } from '../screens/MyPlace';
import { MapScreen } from '../screens/MapScreen';
import { Notifications } from '../screens/Notifications';
import { Messages } from '../screens/Messages';
import { Chat } from '../screens/Chat';
import { Documents } from '../screens/Documents';
import { CircleDetail } from '../screens/CircleDetail';
import { Events } from '../screens/Events';
import { Meeting } from '../screens/Meeting';
import { Search } from '../screens/Search';

/**
 * Central mount point for the full-screen secondary screens (z 76-96) and the
 * sheets that float above them (z 80+).
 */
export function Overlays() {
  return (
    <>
      {/* Full-screen overlay screens, layered like the prototype (z 76-96) */}
      <MyPlace />
      <MapScreen />
      <Notifications />
      <Documents />
      <CircleDetail />
      <Events />
      <Meeting />
      <Messages />
      <Chat />
      <Search />

      {/* Sheets (z 80+) */}
      <PassSheet />
      <PaySheet />
      <SASheet />
      <ArcSheet />
      <ReportSheet />
      <ViolSheet />
      <PennySheet />
    </>
  );
}
