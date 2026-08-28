export async function sendWxPusher(env, title, body) {
    const appToken = env.WXPUSHER_APP_TOKEN;
    const uid = env.WXPUSHER_UID;

    if (!appToken || !uid) return { ok: false, reason: 'no-config' };

    const url = 'https://wxpusher.zjiecode.com/api/send/message';
    
    // 格式：角色名:AI 回复的内容文本...
    const formattedContent = `${title}:${body}`;

    const payload = {
        appToken: appToken,
        content: formattedContent,
        summary: formattedContent.slice(0, 80),
        contentType: 1,
        uids: [uid]
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        return { ok: data.code === 1000, detail: data.msg };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}