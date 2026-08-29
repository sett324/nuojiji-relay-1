// 推送分发：根据订阅通道选发送器。Phase 1 实做 web，apns/fcm 为 stub。
//
// 订阅由手机通过 /api/push/subscribe 注册，按 inboxId 存（复用 outbox 同一存储后端的
// 一个独立命名空间）。这里只负责「给某 inbox 发叫醒推送」。

import { sendWebPush } from './webPush.js';
import { sendApns } from './apns.js';
import { sendFcm } from './fcm.js';
import { sendWxPusher } from './wxpusher.js';

/**
 * @param subscription { channel: 'web'|'apns'|'fcm', ...channel-specific }
 */
export async function dispatchPush(env, subscription, payload) {
    if (!subscription || !subscription.channel) return { ok: false, reason: 'no-subscription' };
    switch (subscription.channel) {
        case 'web':
            return sendWebPush(env, subscription.sub || subscription, payload);
        case 'apns':
        case 'fcm':
            // 废除 APNs/FCM，只要配置了 WxPusher 就走微信
            if (env.WXPUSHER_APP_TOKEN && env.WXPUSHER_UID) {
                return sendWxPusher(env, payload.title, payload.body);
            }
            return { ok: false, reason: `unsupported-channel:${subscription.channel}` };
        default:
            // 未知通道也尝试微信
            if (env.WXPUSHER_APP_TOKEN && env.WXPUSHER_UID) {
                return sendWxPusher(env, payload.title, payload.body);
            }
            return { ok: false, reason: `unknown-channel:${subscription.channel}` };
    }
}