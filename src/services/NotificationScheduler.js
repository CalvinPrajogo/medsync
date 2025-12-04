import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rrulestr } from 'rrule';
import { DateTime } from 'luxon';
import { Platform } from 'react-native';

const STORAGE_KEY_PREFIX = 'scheduled_notifications:';

async function persistNotificationIds(scheduleId, ids) {
  const key = STORAGE_KEY_PREFIX + scheduleId;
  try {
    await AsyncStorage.setItem(key, JSON.stringify(ids));
  } catch (e) {
    console.warn('Failed to persist notification ids', e);
  }
}

async function readPersistedNotificationIds(scheduleId) {
  const key = STORAGE_KEY_PREFIX + scheduleId;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read persisted notification ids', e);
    return [];
  }
}

async function clearPersistedNotificationIds(scheduleId) {
  const key = STORAGE_KEY_PREFIX + scheduleId;
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('Failed to clear persisted notification ids', e);
  }
}

/**
 * Schedule a finite number of recurring notifications computed from an rrule string.
 *
 * @param {Object} params
 * @param {string} params.scheduleId - unique id for this schedule (used to cancel)
 * @param {string} params.title - notification title
 * @param {string} params.body - notification body
 * @param {string} params.dtstartIso - ISO datetime string for start (e.g. 2025-01-01T08:00:00)
 * @param {string} [params.timezone] - IANA timezone name (e.g. 'America/Los_Angeles'). If omitted, system zone is used.
 * @param {string} params.rruleString - rrule string (e.g. 'FREQ=DAILY;INTERVAL=1')
 * @param {number} [params.occurrences=10] - how many future occurrences to schedule
 */
export async function scheduleRecurringNotifications({ scheduleId, title, body, dtstartIso, timezone, rruleString, occurrences = 10 }) {
  if (!scheduleId) throw new Error('scheduleId is required');
  if (!rruleString) throw new Error('rruleString is required');
  if (!dtstartIso) throw new Error('dtstartIso is required');

  // Cancel any previously scheduled notifications 
  await cancelScheduledNotifications(scheduleId);

  // Parse dtstart with luxon 
  const zone = timezone || DateTime.local().zoneName;
  const dtstart = DateTime.fromISO(dtstartIso, { zone });
  if (!dtstart.isValid) throw new Error('Invalid dtstartIso');

  // attach DTSTART with a JS Date in UTC based on the chosen timezone.
  const dtstartUtc = dtstart.toUTC().toJSDate();

  // Compose a full rrule string including DTSTART so rrulestr can parse it in one go.
  let fullRrule = `DTSTART:${dtstart.toUTC().toFormat("yyyyLLdd'T'HHmmss'Z'")}\n${rruleString}`;

  let rule;
  try {
    rule = rrulestr(fullRrule);
  } catch (e) {
    rule = rrulestr(rruleString, { dtstart: dtstartUtc });
  }

  // Compute the next N occurrences  
  const nextDates = rule.all((date, i) => i < occurrences);
  

  const notificationIds = [];

  for (const occurrenceUtc of nextDates) {
    // occurrenceUtc is a JS Date in UTC. Convert to target zone and schedule at local time.
    const occInZone = DateTime.fromJSDate(occurrenceUtc, { zone: 'utc' }).setZone(zone);
    const triggerDate = occInZone.toJSDate();

    

    // Skip any occurrences that are in the past 
    if (triggerDate.getTime() <= Date.now()) {
      console.warn('[NotificationScheduler] skipping past trigger date', triggerDate);
      continue;
    }

    try {
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('medication-reminders', {
            name: 'Medication Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            sound: true,
            enableVibrate: true,
            showBadge: true,
          });
        } catch (e) {
          console.warn('[NotificationScheduler] failed creating Android channel', e);
        }
      }

      const content = {
        title,
        body,
        data: { scheduleId },
        ...(Platform.OS === 'android' ? { channelId: 'medication-reminders' } : {}),
      };

      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: triggerDate,
      });
      notificationIds.push(id);
    } catch (err) {
      console.warn('Failed to schedule notification for', triggerDate, err);
    }
  }

  // Persist ids for cancelling 
  await persistNotificationIds(scheduleId, notificationIds);

  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    void all;
  } catch (e) {
    console.warn('[NotificationScheduler] failed to fetch scheduled notifications', e);
  }

  return notificationIds;
}


//Cancel all scheduled notifications for the given scheduleId
export async function cancelScheduledNotifications(scheduleId) {
  if (!scheduleId) return;
  const ids = await readPersistedNotificationIds(scheduleId);
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) {
      console.warn('Failed to cancel notification', id, e);
    }
  }
  await clearPersistedNotificationIds(scheduleId);
}

export default {
  scheduleRecurringNotifications,
  cancelScheduledNotifications,
};
