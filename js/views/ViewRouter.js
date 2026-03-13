// ── View Router — switches between app views ──
import state from '../state.js';
import bus from '../EventBus.js';
import { $, $$ } from '../utils.js';

let _navFromPopstate = false;

function showView(id) {
  $$('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  state.currentView = id;

  // Notify modules about view enter
  if (id === 'draw')    bus.emit('view:enterDraw');
  if (id === 'gallery') bus.emit('view:enterGallery');
  if (id === 'profile') bus.emit('view:enterProfile');
  if (id === 'inspire') bus.emit('view:enterInspire');
  if (id === 'room')    bus.emit('view:enterRoom');

  // Push history so the Android / browser back button navigates within the app
  if (!_navFromPopstate) {
    history.pushState({ view: id }, '', '');
  }
  _navFromPopstate = false;
}

function initViewRouter() {
  // Handle back button: navigate to parent view or stay on room
  window.addEventListener('popstate', e => {
    const target = e.state && e.state.view;
    if (target) {
      _navFromPopstate = true;
      showView(target);
    } else {
      // At the root of history — go to room if not already there, else re-push to trap
      if (state.currentView !== 'room') {
        _navFromPopstate = true;
        showView('room');
      } else {
        // Push a dummy entry so back doesn't exit the app
        history.pushState({ view: 'room' }, '', '');
      }
    }
  });

  // Seed history so popstate has a root entry
  history.replaceState({ view: 'room' }, '', '');
}

// Allow other modules to trigger view changes via the bus
bus.on('showView', showView);

export { showView, initViewRouter };
export default { showView, initViewRouter };
