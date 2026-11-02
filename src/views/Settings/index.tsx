import {CSSProperties, useMemo, useState} from "react";
import {Badge, Col, Container, Form, Row} from "react-bootstrap";
import {ChevronRight, Search, X} from "react-feather";
import {Link} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {SettingsMenuItem, SettingsSection, settingsSections} from "./settings-menu";
import {useSmartTranslation} from "@/hooks/use-translation";
import {translateMenu} from "@/i18n/menu";

type AccentStyle = CSSProperties & {"--hub-accent": string};

/** Settings hub: one card per settings module, searchable, linking to each screen. */
export default function SettingsHome() {
    const {t} = useSmartTranslation();
    const [query, setQuery] = useState("");

    const q = query.trim().toLowerCase();

    // a section matching by title keeps all its items; otherwise keep only matching items
    const sections = useMemo(() => {
        if (!q) {
            return settingsSections;
        }
        // match the English label and the shown (translated) one
        const matches = (text: string) => text.toLowerCase().includes(q) || translateMenu(t, text).toLowerCase().includes(q);

        return settingsSections
            .map((section) => matches(section.title) ? section : {
                ...section,
                items: section.items.filter((item) => matches(item.name) || matches(t(item.descriptionKey))),
            })
            .filter((section) => section.items.length > 0);
    }, [q, t]);

    return (
        <div className="hk-pg-body settings-hub">
            <SimpleBar className="nicescroll-bar">
                <Container fluid className="py-4 px-md-5">
                    <div className="settings-hub-header">
                        <div>
                            <h1 className="settings-hub-title">{t('settings')}</h1>
                            <p className="settings-hub-subtitle">{t('settingsHubSubtitle')}</p>
                        </div>
                        <div className="settings-hub-search">
                            <Search size={16} className="settings-hub-search-icon" />
                            <Form.Control
                                type="search"
                                value={query}
                                placeholder={t('settingsHubSearchPlaceholder')}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label={t('settingsHubSearchPlaceholder')}
                            />
                            {query && (
                                <button type="button" className="settings-hub-search-clear" onClick={() => setQuery("")} title={t('clearSearch')}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {sections.length === 0 ? (
                        <div className="settings-hub-empty">
                            <Search size={28} />
                            <p className="mb-1 fw-medium">{t('settingsHubNoMatch', {query: query.trim()})}</p>
                            <button type="button" className="btn btn-sm btn-link" onClick={() => setQuery("")}>{t('clearSearch')}</button>
                        </div>
                    ) : (
                        <Row className="g-4">
                            {sections.map((section) => (
                                <Col key={section.module} xs={12} md={6} xxl={4}>
                                    <SectionCard section={section} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </Container>
            </SimpleBar>
        </div>
    );
}

function SectionCard({section}: {section: SettingsSection}) {
    const {t} = useSmartTranslation();
    const Icon = section.icon;
    const available = section.items.filter((item) => !item.comingSoon).length;

    return (
        <section className="settings-hub-card" style={{"--hub-accent": section.accentRgb} as AccentStyle}>
            <header className="settings-hub-card-header">
                <span className="settings-hub-card-icon"><Icon size={20} /></span>
                <div className="flex-grow-1 min-w-0">
                    <h2 className="settings-hub-card-title">{translateMenu(t, section.title)}</h2>
                    <p className="settings-hub-card-desc">{t(section.descriptionKey)}</p>
                </div>
                <span className="settings-hub-card-count" title={t('settingsHubScreenCount', {count: available})}>{available}</span>
            </header>

            <ul className="settings-hub-list">
                {section.items.map((item) => (
                    <li key={item.path}>
                        <ItemRow item={item} />
                    </li>
                ))}
            </ul>
        </section>
    );
}

function ItemRow({item}: {item: SettingsMenuItem}) {
    const {t} = useSmartTranslation();
    const Icon = item.icon;

    const content = (
        <>
            <span className="settings-hub-item-icon"><Icon size={16} /></span>
            <span className="settings-hub-item-text">
                <span className="settings-hub-item-name">{translateMenu(t, item.name)}</span>
                <span className="settings-hub-item-desc">{t(item.descriptionKey)}</span>
            </span>
            {item.comingSoon
                ? <Badge bg="light" text="dark" className="fw-normal flex-shrink-0">{t('comingSoon')}</Badge>
                : <ChevronRight size={16} className="settings-hub-item-chevron" />}
        </>
    );

    if (item.comingSoon) {
        return <div className="settings-hub-item is-disabled" aria-disabled="true">{content}</div>;
    }

    return <Link to={item.path} className="settings-hub-item">{content}</Link>;
}
