import { sendWebPush } from './webPush.js';
import { sendWxPusher } from './wxpusher.js';

/**
 * @param subscription { channel: 'web'|'apns'|'fcm', ...channel-specific }
 */
export async function dispatchPush(env, subscription, payload) {
    const channel = subscription?.channel || 'web';

    if (channel === 'web') {
        return sendWebPush(env, subscription.sub || subscription, payload);
    }

    // 废除 APNs 和 FCM，只要不是 Web 推送，且配置了 WxPusher，就走微信
    if (env.WXPUSHER_APP_TOKEN && env.WXPUSHER_UID) {
        return sendWxPusher(env, payload.title, payload.body);
    }

    return { ok: false, reason: `unsupported-channel:${channel}` };
}