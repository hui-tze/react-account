import {useState} from "react";
import {Button, Col, Row} from "react-bootstrap";
import classNames from "classnames";
import {Check, ChevronDown, HelpCircle} from "react-feather";
import {Link} from "react-router-dom";
import {useSmartTranslation} from "@/hooks/use-translation";
import {BANK_DEPOSIT_CREATE_PATH, BANK_PAYMENT_CREATE_PATH} from "../banking-menu";

const STORAGE_KEY = "bank-reconcile-guide-open";

const readOpen = (): boolean => {
    try {
        return localStorage.getItem(STORAGE_KEY) !== "0";
    } catch {
        return false;
    }
};

const saveOpen = (open: boolean) => {
    try {
        localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {
        // private mode / blocked storage: the guide just reopens next time
    }
};

type ReconcileGuideProps = {
    // a statement balance has been entered
    balanceEntered: boolean,
    // something is ticked on this statement
    anyTicked: boolean,
    // reconciled balance equals the statement balance
    balanced: boolean,
    // this statement was finished
    finished: boolean,
};

/**
 * How to reconcile, as four steps that tick themselves off while the user works, plus tips
 * for the usual snags. It can be folded away (remembered per browser).
 */
export function ReconcileGuide({balanceEntered, anyTicked, balanced, finished}: ReconcileGuideProps) {
    const {t} = useSmartTranslation();
    const [open, setOpen] = useState(readOpen);

    const done = [true, balanceEntered, balanced, finished];
    const current = done.findIndex(d => !d);
    const steps = [
        {title: t('bankGuideStep1'), text: t('bankGuideStep1Text')},
        {title: t('bankGuideStep2'), text: t('bankGuideStep2Text')},
        {title: t('bankGuideStep3'), text: anyTicked && !balanced ? t('bankGuideStep3Working') : t('bankGuideStep3Text')},
        {title: t('bankGuideStep4'), text: t('bankGuideStep4Text')},
    ];

    const toggle = () => {
        saveOpen(!open);
        setOpen(!open);
    };

    return (
        <div className="reconcile-guide mb-3">
            <button type="button" className="reconcile-guide-head" onClick={toggle} aria-expanded={open}>
                <HelpCircle size={16} />
                <span className="fw-semibold">{t('bankGuideTitle')}</span>
                {!open && current >= 0 && <span className="small text-muted">· {t('bankGuideNext', {step: current + 1, title: steps[current].title})}</span>}
                {!open && current < 0 && <span className="small text-success">· {t('bankGuideAllDone')}</span>}
                <ChevronDown size={16} className={classNames("ms-auto reconcile-guide-chevron", {open})} />
            </button>

            {open && (
                <div className="reconcile-guide-body">
                    <ol className="reconcile-guide-steps">
                        {steps.map((step, index) => (
                            <li key={step.title} className={classNames({"is-done": done[index], "is-current": index === current})}>
                                <span className="reconcile-guide-num">{done[index] ? <Check size={13} /> : index + 1}</span>
                                <div>
                                    <div className="fw-semibold text-dark">{step.title}</div>
                                    <div className="small text-muted">{step.text}</div>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <Row className="g-3 reconcile-guide-tips">
                        <Col md={4}>
                            <div className="fw-semibold small text-dark">{t('bankTipMissingTitle')}</div>
                            <div className="small text-muted">
                                {t('bankTipMissingText')}{" "}
                                <Link to={BANK_PAYMENT_CREATE_PATH}>{t('menu_Payment')}</Link> / <Link to={BANK_DEPOSIT_CREATE_PATH}>{t('menu_Deposit')}</Link>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="fw-semibold small text-dark">{t('bankTipExtraTitle')}</div>
                            <div className="small text-muted">{t('bankTipExtraText')}</div>
                        </Col>
                        <Col md={4}>
                            <div className="fw-semibold small text-dark">{t('bankTipDifferenceTitle')}</div>
                            <div className="small text-muted">{t('bankTipDifferenceText')}</div>
                        </Col>
                    </Row>
                    <div className="text-end mt-2">
                        <Button variant="link" size="sm" className="p-0" onClick={toggle}>{t('bankGuideHide')}</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
