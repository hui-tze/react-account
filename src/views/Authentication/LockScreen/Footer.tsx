import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {useSmartTranslation} from '@/hooks/use-translation';

const Footer = () => {
    const { t } = useSmartTranslation();

    return (
        <div className="hk-footer border-0 bg-transparent">
            <Container as="footer" className="footer">
                <Row>
                    <Col xl={8} className="text-center mx-auto">
                        <p className="footer-text pb-0">
                            <span className="copy-text text-white opacity-55">{t('accountingSystem')} © {new Date().getFullYear()}</span>
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Footer
