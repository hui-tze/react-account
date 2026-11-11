import {KeyboardEvent, useEffect, useMemo, useRef, useState} from "react";
import {ArrowRight, Clock, Search, X} from "react-feather";
import {useNavigate} from "react-router-dom";
import classNames from "classnames";
import {searchApi} from "@/apis/requests/search-api";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DocumentPreviewModal} from "@/views/Documents/DocumentPreview";
import {
    DocumentResult, flatten, RECORD_KINDS, RECORD_LABEL_KEYS, RecordResult, recordPath, SearchEntry,
} from "@/views/Search/search-ui";

export const SEARCH_PATH = "/search";
const RECENT_KEY = "account-recent-searches";

function loadRecent(): string[] {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    } catch {
        return [];
    }
}

export function rememberSearch(query: string): void {
    const q = query.trim();
    if (q.length < 2) {
        return;
    }
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...loadRecent().filter(r => r.toLowerCase() !== q.toLowerCase())].slice(0, 6)));
    } catch {
        // private mode / blocked storage: no recent list
    }
}

/** The value after the user stops typing for `delay` ms. */
function useDebounced(value: string, delay = 250): string {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

/**
 * Search box in the top bar: documents (by reference, party, references, remarks, memos, line
 * items, totals) and customers / suppliers / items / accounts, as you type. Ctrl+K or "/" jumps
 * here; ↑ ↓ Enter pick a result; documents open in the preview popup.
 */
export function GlobalSearch() {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    // phones: the box opens as a full-screen panel
    const [mobileOpen, setMobileOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [preview, setPreview] = useState<{type: string, id: number} | null>(null);
    const [recent, setRecent] = useState<string[]>(loadRecent);

    const debounced = useDebounced(query);
    const {data, isLoading} = searchApi.useSearch(debounced, 6);
    const stale = debounced !== query.trim() && query.trim() !== debounced;
    const entries = useMemo(() => flatten(data && data.query === debounced.trim() ? data : undefined), [data, debounced]);
    const searching = query.trim().length >= 2 || /^\d$/.test(query.trim());

    useEffect(() => setActive(0), [debounced]);

    // Ctrl+K / ⌘K anywhere, or "/" outside a text field
    useEffect(() => {
        const onKey = (e: globalThis.KeyboardEvent) => {
            const typing = e.target instanceof HTMLElement && (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName) || e.target.isContentEditable);
            if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) {
                e.preventDefault();
                if (window.matchMedia("(max-width: 1199.98px)").matches) {
                    setMobileOpen(true);
                }
                setOpen(true);
                setTimeout(() => inputRef.current?.focus(), 0);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const close = () => {
        setOpen(false);
        setMobileOpen(false);
        inputRef.current?.blur();
    };

    const select = (entry: SearchEntry) => {
        rememberSearch(query);
        setRecent(loadRecent());
        if (entry.kind === "document") {
            setPreview({type: entry.doc.type, id: entry.doc.id});
        } else {
            navigate(recordPath(entry.kind, entry.record.id));
        }
        close();
    };

    const seeAll = () => {
        rememberSearch(query);
        setRecent(loadRecent());
        navigate(`${SEARCH_PATH}?q=${encodeURIComponent(query.trim())}`);
        close();
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive(i => Math.min(i + 1, Math.max(entries.length - 1, 0)));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (entries[active]) {
                select(entries[active]);
            } else if (searching) {
                seeAll();
            }
        } else if (e.key === "Escape") {
            close();
        }
    };

    let index = -1;
    const next = () => ++index;
    const documents = entries.filter((e): e is Extract<SearchEntry, {kind: "document"}> => e.kind === "document");

    return (
        <>
            {/* phones: an icon that opens the full-screen search */}
            <button type="button" className="btn btn-icon btn-rounded btn-flush-dark flush-soft-hover d-xl-none gs-mobile-trigger"
                onClick={() => { setMobileOpen(true); setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }} aria-label={t('search')}>
                <Search size={18} />
            </button>

            <div className={classNames("gs", {"is-open": open, "is-mobile-open": mobileOpen})}>
                <div className="gs-box">
                    <Search size={16} className="gs-box-icon" />
                    <input
                        ref={inputRef}
                        type="search"
                        className="gs-input"
                        value={query}
                        placeholder={t('globalSearchPlaceholder')}
                        aria-label={t('search')}
                        autoComplete="off"
                        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => !mobileOpen && setOpen(false), 150)}
                        onKeyDown={onKeyDown}
                    />
                    {query ? (
                        <button type="button" className="gs-clear" onMouseDown={(e) => e.preventDefault()} onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                            aria-label={t('clear')}><X size={14} /></button>
                    ) : <kbd className="gs-kbd d-none d-xl-inline">Ctrl K</kbd>}
                    <button type="button" className="gs-cancel d-xl-none" onClick={close}>{t('cancel')}</button>
                </div>

                {open && (
                    <div className="gs-panel" role="listbox">
                        {!searching ? (
                            <div className="gs-empty-state">
                                {recent.length > 0 && (
                                    <>
                                        <div className="gs-group-title">{t('recentSearches')}</div>
                                        {recent.map(r => (
                                            <button key={r} type="button" className="gs-recent" onMouseDown={(e) => e.preventDefault()} onClick={() => { setQuery(r); inputRef.current?.focus(); }}>
                                                <Clock size={13} />{r}
                                            </button>
                                        ))}
                                    </>
                                )}
                                <div className="gs-hint">{t('globalSearchHint')}</div>
                            </div>
                        ) : (
                            <>
                                {(isLoading || stale) && !entries.length && <div className="gs-loading"><span className="spinner-border spinner-border-sm me-2" />{t('searching')}</div>}
                                {!isLoading && !stale && entries.length === 0 && (
                                    <div className="gs-none">{t('searchNoResults', {query: query.trim()})}</div>
                                )}
                                {documents.length > 0 && (
                                    <div className="gs-group">
                                        <div className="gs-group-title">{t('documents')}</div>
                                        {documents.map(e => {
                                            const i = next();
                                            return <DocumentResult key={`${e.doc.type}-${e.doc.id}`} doc={e.doc} query={debounced} active={i === active} onSelect={() => select(e)} />;
                                        })}
                                    </div>
                                )}
                                {RECORD_KINDS.map(kind => {
                                    const rows = entries.filter(e => e.kind === kind);
                                    return rows.length > 0 && (
                                        <div key={kind} className="gs-group">
                                            <div className="gs-group-title">{t(RECORD_LABEL_KEYS[kind])}</div>
                                            {rows.map(e => {
                                                const i = next();
                                                const record = (e as Extract<SearchEntry, {kind: typeof kind}>).record;
                                                return <RecordResult key={`${kind}-${record.id}`} kind={kind} record={record} query={debounced} active={i === active} onSelect={() => select(e)} />;
                                            })}
                                        </div>
                                    );
                                })}
                                <button type="button" className="gs-see-all" onMouseDown={(e) => e.preventDefault()} onClick={seeAll}>
                                    {t('searchSeeAll', {query: query.trim()})}<ArrowRight size={14} />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            {mobileOpen && <div className="gs-backdrop d-xl-none" onClick={close} />}

            {preview && <DocumentPreviewModal type={preview.type} id={preview.id} onClose={() => setPreview(null)} />}
        </>
    );
}
