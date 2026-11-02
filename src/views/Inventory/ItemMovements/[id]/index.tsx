import {ReactNode} from "react";
import {Alert, Button, Col, Container, Row} from "react-bootstrap";
import {useNavigate, useParams} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {useGetOneInventoryMovement} from "@/apis/requests/inventory-movement-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ITEM_MOVEMENTS_PATH} from "../../inventory-menu";
import {dateOnly, formatDecimal, itemLabel} from "../../shared/options";
import {SignedQuantity} from "../../shared/document";
import {MovementTypeBadge} from "../index";

/** Read-only view of a ledger row posted by a document this module has no screen for. */
export default function ViewItemMovement() {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const {id = ""} = useParams();
    const {data, error} = useGetOneInventoryMovement(id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }

    if (!data) {
        return <div className="loader-pendulums mt-10" />;
    }

    const field = (label: string, value: ReactNode) => (
        <Col md={4} className="mb-3">
            <div className="text-muted small">{label}</div>
            <div className="fw-semibold text-dark">{value}</div>
        </Col>
    );

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <Container fluid className="py-3">
                    <Alert variant="info" className="d-flex align-items-center gap-2">
                        <MovementTypeBadge type={data.trans_type} />
                        {t('movementPostedByDocument')}
                    </Alert>

                    <FormSectionTitle title={t('details')} />
                    <Row>
                        {field(t('referenceNo'), data.reference_no)}
                        {field(t('date'), dateOnly(data.trans_date))}
                        {field(t('status'), <StatusBadge status={data.status} />)}
                        {field(t('item'), itemLabel(data.item))}
                        {field(t('inventoryLocation'), data.inventory_location?.name ?? "-")}
                        {field(t('quantity'), <SignedQuantity value={Number(data.quantity)} />)}
                        {field(t('unitCost'), formatDecimal(data.unit_cost, 4))}
                        {field(t('unitPrice'), formatDecimal(data.unit_price, 4))}
                    </Row>

                    <Button variant="outline-secondary" onClick={() => navigate(ITEM_MOVEMENTS_PATH)}>{t('back')}</Button>
                </Container>
            </SimpleBar>
        </div>
    );
}
