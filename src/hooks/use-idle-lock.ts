import {useCallback, useEffect, useRef, useState} from "react";
import {AuthTokenName} from "@/config";

/** The screen locks after this long without mouse, keyboard, touch or scroll activity. */
export const IDLE_LOCK_MS = 15 * 60 * 1000;

// shared by every tab: activity in one tab keeps the others unlocked, and locking/unlocking applies to all
const LOCKED_KEY = `${AuthTokenName}-screen-locked`;
const ACTIVITY_KEY = `${AuthTokenName}-last-activity`;

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "wheel", "scroll", "touchstart"] as const;
const WRITE_EVERY_MS = 5_000;
const CHECK_EVERY_MS = 15_000;

const read = (key: string) => {
    try { return localStorage.getItem(key); } catch { return null; }
};
const write = (key: string, value: string | null) => {
    try {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
    } catch { /* storage unavailable: the lock still works in this tab */ }
};

const lastActivity = () => Number(read(ACTIVITY_KEY)) || 0;

/** Clears the lock state, e.g. on sign-in or sign-out. */
export function resetIdleLock() {
    write(LOCKED_KEY, null);
    write(ACTIVITY_KEY, String(Date.now()));
}

/**
 * Locks the screen after IDLE_LOCK_MS of inactivity while `enabled` (signed in).
 * A session left idle past the limit (e.g. the browser was closed) opens locked.
 */
export function useIdleLock(enabled: boolean) {
    const [locked, setLocked] = useState<boolean>(() =>
        enabled && (read(LOCKED_KEY) === "1" || (lastActivity() > 0 && Date.now() - lastActivity() >= IDLE_LOCK_MS))
    );
    const lastWrite = useRef(0);

    const lock = useCallback(() => {
        write(LOCKED_KEY, "1");
        setLocked(true);
    }, []);

    const unlock = useCallback(() => {
        resetIdleLock();
        lastWrite.current = Date.now();
        setLocked(false);
    }, []);

    // persist the initial lock so other tabs follow it
    useEffect(() => {
        if (locked) write(LOCKED_KEY, "1");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!enabled) {
            setLocked(false);
            return;
        }
        if (!lastActivity()) write(ACTIVITY_KEY, String(Date.now()));

        const onActivity = () => {
            if (read(LOCKED_KEY) === "1") return; // activity on the lock screen does not count
            const now = Date.now();
            if (now - lastWrite.current >= WRITE_EVERY_MS) {
                lastWrite.current = now;
                write(ACTIVITY_KEY, String(now));
            }
        };

        const check = () => {
            if (read(LOCKED_KEY) !== "1" && Date.now() - lastActivity() >= IDLE_LOCK_MS) lock();
        };

        const onStorage = (e: StorageEvent) => {
            if (e.key === LOCKED_KEY) setLocked(e.newValue === "1");
        };

        ACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, onActivity, {passive: true, capture: true}));
        window.addEventListener("storage", onStorage);
        // timers are throttled in background tabs, so also check when the tab comes back
        document.addEventListener("visibilitychange", check);
        const timer = window.setInterval(check, CHECK_EVERY_MS);
        check();

        return () => {
            ACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, onActivity, {capture: true}));
            window.removeEventListener("storage", onStorage);
            document.removeEventListener("visibilitychange", check);
            window.clearInterval(timer);
        };
    }, [enabled, lock]);

    return {locked, lock, unlock};
}
