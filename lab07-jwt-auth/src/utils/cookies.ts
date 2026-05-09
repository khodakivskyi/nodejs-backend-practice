export function getCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
    if (!cookieHeader) return undefined;

    const parts = cookieHeader.split(";").map((p) => p.trim());
    for (const part of parts) {
        const eqIdx = part.indexOf("=");
        if (eqIdx === -1) continue;
        const key = part.slice(0, eqIdx);
        if (key !== name) continue;
        const value = part.slice(eqIdx + 1);
        return decodeURIComponent(value);
    }
    return undefined;
}

