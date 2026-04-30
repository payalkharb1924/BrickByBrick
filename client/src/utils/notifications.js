import api from '../api/client';

const STORAGE_KEY = 'bbb_last_notif';
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour between same-type notifications

function getLastFired() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function setLastFired(key) {
  const map = getLastFired();
  map[key] = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function canFire(key) {
  const map = getLastFired();
  const last = map[key] || 0;
  return Date.now() - last > COOLDOWN_MS;
}

function notify(title, body, key) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!canFire(key)) return;
  new Notification(title, { body, icon: '/vite.svg' });
  setLastFired(key);
}

export async function checkAndNotify() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const notifs = (() => {
    try { return JSON.parse(localStorage.getItem('bbb_notifs')) || {}; } catch { return {}; }
  })();

  try {
    const { data } = await api.get('/dashboard/alerts');
    const alerts = data.data;
    const now = new Date();
    const hour = now.getHours();

    // Revision reminders — fire at 9am and 6pm if revisions are due
    if (notifs.revisions !== false && alerts?.pendingRevisions > 0) {
      if (hour === 9 || hour === 18) {
        notify(
          'BrickByBrick — Revisions Due',
          `You have ${alerts.pendingRevisions} revision(s) pending. Open the app to review them!`,
          `revisions_${hour}`
        );
      }
    }

    // Follow-up alerts — fire at 10am if follow-ups are due
    if (notifs.followups !== false && alerts?.followUpsDue > 0) {
      if (hour === 10) {
        notify(
          'BrickByBrick — Job Follow-ups Due',
          `${alerts.followUpsDue} job follow-up(s) are due today. Don't let them slip!`,
          'followups_10'
        );
      }
    }

    // No activity warning — fire at 8pm if no activity in 3 days
    if (alerts?.noActivityWarning) {
      if (hour === 20) {
        notify(
          'BrickByBrick — No Activity',
          "You haven't logged any DSA problems in 3 days. Get back on track!",
          'inactivity_20'
        );
      }
    }

    // Weekly review — fire Sunday at 8pm
    if (notifs.weekly !== false && now.getDay() === 0) {
      if (hour === 20) {
        notify(
          'BrickByBrick — Weekly Review',
          "It's Sunday evening! Time to complete your weekly review and plan next week.",
          'weekly_review_sunday'
        );
      }
    }

    // Daily DSA reminder — fire at 7pm if no problems solved today
    if (notifs.revisions !== false) {
      if (hour === 19) {
        const todayData = await api.get('/dashboard/today');
        const solved = todayData.data.data?.problemsSolvedToday ?? 0;
        const target = parseInt(localStorage.getItem('bbb_daily_target')) || 4;
        if (solved < target) {
          notify(
            'BrickByBrick — Daily Target',
            `You've solved ${solved}/${target} problems today. Still time to hit your target!`,
            'daily_target_19'
          );
        }
      }
    }

  } catch {
    // silently fail — don't disrupt the app
  }
}
