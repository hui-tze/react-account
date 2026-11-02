import React, { useEffect, useReducer, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Inbox, MoreVertical, Star, UserCheck } from 'react-feather';
import { Button, Card, Col, Dropdown, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { reducer } from './CheckboxReducer';
import ContactDetails from './ContactDetails';

//Images
import avatar2 from '../../../assets/img/avatar2.jpg';
import avatar3 from '../../../assets/img/avatar3.jpg';
import avatar5 from '../../../assets/img/avatar5.jpg';
import avatar7 from '../../../assets/img/avatar7.jpg';
import avatar8 from '../../../assets/img/avatar8.jpg';
import avatar9 from '../../../assets/img/avatar9.jpg';
import avatar10 from '../../../assets/img/avatar10.jpg';
import avatar11 from '../../../assets/img/avatar11.jpg';
import avatar13 from '../../../assets/img/avatar13.jpg';
import avatar14 from '../../../assets/img/avatar14.jpg';
import avatar15 from '../../../assets/img/avatar15.jpg';


const ContactCardsBody = () => {
    const initial = false;
    const [multipleSelection, setMultipleSelection] = useState(false);
    const [state, dispatch] = useReducer(reducer, initial);

    const [showDetails, setShowDetails] = useState(false);


    useEffect(() => {
        if (state.check1 === true || state.check2 === true || state.check3 === true || state.check4 === true || state.check5 === true || state.check6 === true || state.check7 === true || state.check8 === true || state.check9 === true || state.check10 === true || state.check11 === true || state.check12 === true || state.check13 === true || state.check14 === true || state.check15 === true) {
            setMultipleSelection(true);
        }
        else {
            setMultipleSelection(false);
        }
    }, [state])


    return (
        <>
            <div className="contact-body">
                <SimpleBar className="nicescroll-bar">
                    <div className="collapse" id="collapseQuick">
                        <div className="quick-access-form-wrap">
                            <Form className="quick-access-form border">
                                <Row className="gx-3">
                                    <Col xxl={10}>
                                        <div className="position-relative">
                                            <div className="dropify-square">
                                                <input type="file" className="dropify-1" />
                                            </div>
                                            <Col md={12}>
                                                <Row className="gx-3">
                                                    <Col lg={4}>
                                                        <Form.Group>
                                                            <Form.Control placeholder="First name*" defaultValue type="text" />
                                                        </Form.Group>
                                                        <Form.Group>
                                                            <Form.Control placeholder="Last name*" defaultValue type="text" />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={4}>
                                                        <Form.Group>
                                                            <Form.Control placeholder="Email Id*" defaultValue type="text" />
                                                        </Form.Group>
                                                        <Form.Group>
                                                            <Form.Control placeholder="Phone" defaultValue type="text" />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={4}>
                                                        <Form.Group>
                                                            <Form.Control placeholder="Department" defaultValue type="text" />
                                                        </Form.Group>
                                                        <Form.Group>
                                                            <Form.Select id="input_tags" multiple >
                                                                <option>Collaborator</option>
                                                                <option>Designer</option>
                                                                <option>Developer</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </div>
                                    </Col>
                                    <Col xxl={2}>
                                        <Form.Group>
                                            <button data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" className="btn btn-block btn-primary ">Create New
                                            </button>
                                        </Form.Group>
                                        <Form.Group>
                                            <button data-bs-toggle="collapse" disabled data-bs-target="#collapseExample" aria-expanded="false" className="btn btn-block btn-secondary">Discard
                                            </button>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </div>
                    <div className={classNames("contact-card-view", { "select-multiple": multipleSelection })}>
                        <Row className="mb-3" >
                            <Col xs={7} mb={3}>
                                <div className="contact-toolbar-left">
                                    <Form.Group className="d-xxl-flex d-none align-items-center mb-0">
                                        <Form.Select size='sm' className="w-120p">
                                            <option value={1}>Bulk actions</option>
                                            <option value={2}>Edit</option>
                                            <option value={3}>Move to trash</option>
                                        </Form.Select>
                                        <Button size="sm" variant="light" className="ms-2">Apply</Button>
                                    </Form.Group>
                                    <Form.Group className="d-xxl-flex d-none align-items-center mb-0">
                                        <label className="flex-shrink-0 mb-0 me-2">Sort by:</label>
                                        <Form.Select size='sm' className="w-130p">
                                            <option value={1}>Date Created</option>
                                            <option value={2}>Date Edited</option>
                                            <option value={3}>Frequent Contacts</option>
                                            <option value={4}>Recently Added</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Select size="sm" className="d-flex align-items-center w-130p">
                                        <option value={1}>Export to CSV</option>
                                        <option value={2}>Export to PDF</option>
                                        <option value={3}>Send Message</option>
                                        <option value={4}>Delegate Access</option>
                                    </Form.Select>
                                </div>
                            </Col>
                            <Col xs={5} mb={3}>
                                <div className="contact-toolbar-right">
                                    <div id="datable_1_filter" className="dataTables_filter">
                                        <label>
                                            <Form.Control size="sm" type="search" placeholder="Search" />
                                        </label>
                                    </div>
                                    <div className="dataTables_length" id="datable_1_length">
                                        <label>
                                            View
                                            <Form.Select size="sm" name="datable_1_length">
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </Form.Select>
                                        </label>
                                    </div>
                                    <div className="dataTables_info" id="datable_1_info" role="status" aria-live="polite">1 - 10 of 11</div>
                                    <div className="dataTables_paginate paging_simple_numbers" id="datable_1_paginate">
                                        <ul className="pagination custom-pagination pagination-simple m-0">
                                            <li className="paginate_button page-item previous disabled" id="datable_1_previous">
                                                <a href="#some" data-dt-idx={0} tabIndex={0} className="page-link">
                                                    <i className="ri-arrow-left-s-line" />
                                                </a>
                                            </li>
                                            <li className="paginate_button page-item active">
                                                <a href="#some" data-dt-idx={1} tabIndex={0} className="page-link">1</a>
                                            </li>
                                            <li className="paginate_button page-item ">
                                                <a href="#some" data-dt-idx={2} tabIndex={0} className="page-link">2</a>
                                            </li>
                                            <li className="paginate_button page-item next" id="datable_1_next">
                                                <a href="#some" data-dt-idx={3} tabIndex={0} className="page-link">
                                                    <i className="ri-arrow-right-s-line" />
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Row className="row-cols-xxl-5 row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-1 mb-5 gx-3">
                            <Col>
                                <Card className="card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check1} onChange={() => dispatch({ type: 'check1' })} id="chk_sel_0" />
                                            <Form.Check.Label htmlFor="chk_sel_0" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar2} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name">
                                            <span className="contact-star">
                                                <span className="feather-icon">
                                                    <Star />
                                                </span>
                                            </span>
                                            Morgan Freeman
                                        </div>
                                        <div className="user-email">morgan@jampack.com</div>
                                        <div className="user-contact">+145 52 5689</div>
                                        <div className="user-desg"><span className="badge badge-primary badge-indicator badge-indicator-lg me-2" /> Design</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2">
                                                <Inbox />
                                            </span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)} >
                                            <span className="feather-icon me-2">
                                                <UserCheck />
                                            </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </Col>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" id="chk_sel_1" checked={state.check2} onChange={() => dispatch({ type: 'check2' })} />
                                            <Form.Check.Label htmlFor="chk_sel_1" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar9} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name"><span className="contact-star">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Huma Therman</div>
                                        <div className="user-email">huma@clariesup.au</div>
                                        <div className="user-contact">+234 48 2365</div>
                                        <div className="user-desg"><span className="badge badge-primary badge-indicator badge-indicator-lg me-2" /> Developer</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" id="chk_sel_2" checked={state.check3} onChange={() => dispatch({ type: 'check3' })} />
                                            <Form.Check.Label htmlFor="chk_sel_2" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-soft-primary avatar-rounded">
                                            <span className="initial-wrap">C</span>
                                        </div>
                                        <div className="user-name"><span className="contact-star marked">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Charlie Chaplin</div>
                                        <div className="user-email">charlie@leernoca.monster</div>
                                        <div className="user-contact">+741 56 1916</div>
                                        <div className="user-desg"><span className="badge badge-danger badge-indicator badge-indicator-lg me-2" /> Inventory</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" id="chk_sel_3" checked={state.check4} onChange={() => dispatch({ type: 'check4' })} />
                                            <Form.Check.Label htmlFor="chk_sel_3" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar10} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name"><span className="contact-star">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Winston Churchil</div>
                                        <div className="user-email">winston@worthniza.ga</div>
                                        <div className="user-contact">+145 52 5463</div>
                                        <div className="user-desg"><span className="badge badge-danger badge-indicator badge-indicator-lg me-2" /> Human Resource</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" id="chk_sel_4" checked={state.check5} onChange={() => dispatch({ type: 'check5' })} />
                                            <Form.Check.Label htmlFor="chk_sel_4" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar3} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name"><span className="contact-star marked">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Jaquiline Joker</div>
                                        <div className="user-email">contact@hencework.com</div>
                                        <div className="user-contact">+91-34-2636-1916</div>
                                        <div className="user-desg"><span className="badge badge-primary badge-indicator badge-indicator-lg me-2" /> Design</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check6} onChange={() => dispatch({ type: 'check6' })} id="chk_sel_5" />
                                            <Form.Check.Label htmlFor="chk_sel_5" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar7} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name"><span className="contact-star">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Tom Cruz</div>
                                        <div className="user-email">tomcz@jampack.com</div>
                                        <div className="user-contact">+456 52 4862</div>
                                        <div className="user-desg"><span className="badge badge-primary badge-indicator badge-indicator-lg me-2" /> Developer</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check7} onChange={() => dispatch({ type: 'check7' })} id="chk_sel_6" />
                                            <Form.Check.Label htmlFor="chk_sel_6" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-soft-danger avatar-rounded">
                                            <span className="initial-wrap">D</span>
                                        </div>
                                        <div className="user-name"><span className="contact-star marked">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Daniel Craig</div>
                                        <div className="user-email">danialc@jampack.com</div>
                                        <div className="user-contact">+145 52 1916</div>
                                        <div className="user-desg"><span className="badge badge-success badge-indicator badge-indicator-lg me-2" /> Design</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check8} onChange={() => dispatch({ type: 'check8' })} id="chk_sel_7" />
                                            <Form.Check.Label htmlFor="chk_sel_7" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar8} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name"><span className="contact-star marked">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Katharine Jones</div>
                                        <div className="user-email">joneskath@jampack.com</div>
                                        <div className="user-contact">+741 56 1916</div>
                                        <div className="user-desg"><span className="badge badge-danger badge-indicator badge-indicator-lg me-2" /> Inventory</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check9} onChange={() => dispatch({ type: 'check9' })} id="chk_sel_8" />
                                            <Form.Check.Label htmlFor="chk_sel_8" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-primary avatar-rounded">
                                            <span className="initial-wrap">H</span>
                                        </div>
                                        <div className="user-name"><span className="contact-star">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Hencework</div>
                                        <div className="user-email">contact@hencework.com</div>
                                        <div className="user-contact">+145 52 5478</div>
                                        <div className="user-desg"><span className="badge badge-primary badge-indicator badge-indicator-lg me-2" /> Design</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check10} onChange={() => dispatch({ type: 'check10' })} id="chk_sel_9" />
                                            <Form.Check.Label htmlFor="chk_sel_9" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar13} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name"><span className="contact-star">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Daniel Raynolds</div>
                                        <div className="user-email">danialraynolds@hencework.com</div>
                                        <div className="user-contact">+145 36 1916</div>
                                        <div className="user-desg"><span className="badge badge-primary badge-indicator badge-indicator-lg me-2" /> Design</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check11} onChange={() => dispatch({ type: 'check11' })} id="chk_sel_10" />
                                            <Form.Check.Label htmlFor="chk_sel_10" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu></Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-light avatar-rounded">
                                            <span className="initial-wrap">J</span>
                                        </div>
                                        <div className="user-name"><span className="contact-star">
                                            <span className="feather-icon">
                                                <Star /> </span></span>John Brother</div>
                                        <div className="user-email">john@cryodrakan.info</div>
                                        <div className="user-contact">+456 52 1916</div>
                                        <div className="user-desg"><span className="badge badge-danger badge-indicator badge-indicator-lg me-2" /> Human Resource</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check12} onChange={() => dispatch({ type: 'check12' })} id="chk_sel_11" />
                                            <Form.Check.Label htmlFor="chk_sel_11" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu></Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar15} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name"><span className="contact-star marked">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Dean Shaw</div>
                                        <div className="user-email">dean-shaw@pown.me</div>
                                        <div className="user-contact">+234 48 1916</div>
                                        <div className="user-desg"><span className="badge badge-primary badge-indicator badge-indicator-lg me-2" /> Design</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check13} onChange={() => dispatch({ type: 'check13' })} id="chk_sel_12" />
                                            <Form.Check.Label htmlFor="chk_sel_12" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu></Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar11} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name"><span className="contact-star marked">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Cavin Spancy</div>
                                        <div className="user-email">cavins11@budgequot.press</div>
                                        <div className="user-contact">+234 48 1916</div>
                                        <div className="user-desg"><span className="badge badge-primary badge-indicator badge-indicator-lg me-2" /> Design</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check14} onChange={() => dispatch({ type: 'check14' })} id="chk_sel_13" />
                                            <Form.Check.Label htmlFor="chk_sel_13" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu></Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar14} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name"><span className="contact-star">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Justin Bieber</div>
                                        <div className="user-email">justin@tulberga.ga</div>
                                        <div className="user-contact">+745 56 1916</div>
                                        <div className="user-desg"><span className="badge badge-danger badge-indicator badge-indicator-lg me-2" /> Inventory</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                            <div className="col">
                                <Card className="card card-border contact-card">
                                    <Card.Body className="text-center">
                                        <Form.Check type="checkbox" className="form-check-lg">
                                            <Form.Check.Input type="checkbox" className="check-select" checked={state.check15} onChange={() => dispatch({ type: 'check15' })} id="chk_sel_14" />
                                            <Form.Check.Label htmlFor="chk_sel_14" />
                                        </Form.Check>
                                        <div className="card-action-wrap">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret ">
                                                    <span className="btn-icon-wrap">
                                                        <span className="feather-icon">
                                                            <MoreVertical />
                                                        </span>
                                                    </span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end">
                                                    <Dropdown.Item><i className="icon wb-reply" aria-hidden="true" />Reply</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-share" aria-hidden="true" />Forward</Dropdown.Item>
                                                    <Dropdown.Item><i className="icon wb-trash" aria-hidden="true" />Delete</Dropdown.Item>
                                                </Dropdown.Menu></Dropdown>
                                        </div>
                                        <div className="avatar avatar-xl avatar-rounded">
                                            <img src={avatar5} alt="user" className="avatar-img" />
                                        </div>
                                        <div className="user-name"><span className="contact-star">
                                            <span className="feather-icon">
                                                <Star /> </span></span>Auston Kutcher</div>
                                        <div className="user-email">auston@cutcher.com</div>
                                        <div className="user-contact">+145 52 1916</div>
                                        <div className="user-desg"><span className="badge badge-warning badge-indicator badge-indicator-lg me-2" /> Human Resource</div>
                                    </Card.Body>
                                    <Card.Footer className="text-muted position-relative">
                                        <Link to="#" className="d-flex align-items-center">
                                            <span className="feather-icon me-2"><Inbox /></span>
                                            <span className="fs-7 lh-1">Message</span>
                                        </Link>
                                        <div className="v-separator-full m-0" />
                                        <Link to="#" className="d-flex align-items-center" onClick={() => setShowDetails(!showDetails)}>
                                            <span className="feather-icon me-2"> <UserCheck /> </span>
                                            <span className="fs-7 lh-1">Profile</span>
                                        </Link>
                                    </Card.Footer>
                                </Card>
                            </div>
                        </Row>
                        <Row>
                            <Col sm={12} md={5} className="d-flex align-items-center justify-content-center justify-content-md-start">
                                <div className="dataTables_info">1 - 10 of 30</div>
                            </Col>
                            <Col sm={12} md={7}>
                                <ul className="pagination custom-pagination pagination-simple mb-0 justify-content-center justify-content-md-end">
                                    <li className="paginate_button page-item previous disabled"><a href="#some" data-dt-idx={0} tabIndex={0} className="page-link"><i className="ri-arrow-left-s-line" /></a></li>
                                    <li className="paginate_button page-item active"><a href="#some" data-dt-idx={1} tabIndex={0} className="page-link">1</a></li>
                                    <li className="paginate_button page-item "><a href="#some" data-dt-idx={2} tabIndex={0} className="page-link">2</a></li>
                                    <li className="paginate_button page-item next"><a href="#some" data-dt-idx={4} tabIndex={0} className="page-link"><i className="ri-arrow-right-s-line" /></a></li>
                                </ul>
                            </Col>
                        </Row>
                    </div>
                </SimpleBar>
            </div>

            <ContactDetails show={showDetails} onHide={() => setShowDetails(!showDetails)} />
        </>
    )
}

export default ContactCardsBody
