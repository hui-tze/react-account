import React from 'react';
import SimpleBar from 'simplebar-react';
import {connect, ConnectedProps} from 'react-redux';
import {Link} from 'react-router-dom';

import {
    AlignLeft,
    Bell,
    Calendar,
    Clock,
    Inbox,
    Settings,
} from 'react-feather';

import {
    Button,
    Container,
    Dropdown,
    Nav,
    Navbar,
} from 'react-bootstrap';

// Images
import avatar2 from '../../assets/img/avatar2.jpg';
import avatar3 from '../../assets/img/avatar3.jpg';
import avatar10 from '../../assets/img/avatar10.jpg';

import {toggleCollapsedNav} from '@/redux/action/Theme';
import {HkBadge} from '@/components/@hk-badge/@hk-badge';
import {CompanySwitcher} from './CompanySwitcher';
import {UserMenu} from './UserMenu';
import {GlobalSearch} from './GlobalSearch';
import {LockButton} from './LockButton';

interface RootState {
    theme: {
        navCollapsed: boolean;
    };
}

const mapStateToProps = (state: RootState) => ({
    navCollapsed: state.theme.navCollapsed,
});

const connector = connect(mapStateToProps, {
    toggleCollapsedNav,
});

type Props = ConnectedProps<typeof connector>;

const TopNav: React.FC<Props> = ({
    navCollapsed,
    toggleCollapsedNav,
}) => {
    return (
        <Navbar
            expand="xl"
            className="hk-navbar navbar-light fixed-top"
        >
            <Container fluid>
                {/* Start Nav */}
                <div className="nav-start-wrap">
                    <Button
                        variant="flush-dark"
                        onClick={() =>
                            toggleCollapsedNav(!navCollapsed)
                        }
                        className="btn-icon btn-rounded flush-soft-hover navbar-toggle d-xl-none"
                    >
                        <span className="icon">
                            <span className="feather-icon">
                                <AlignLeft />
                            </span>
                        </span>
                    </Button>

                    {/* Search: documents, lines, memos, customers, items… */}
                    <GlobalSearch />
                </div>

                {/* /Start Nav */}

                {/* End Nav */}
                <div className="nav-end-wrap">
                    <CompanySwitcher />
                    <Nav className="navbar-nav flex-row">
                        {/* Email */}
                        <Nav.Item>
                            <Link
                                to="/apps/email"
                                className="btn btn-flush-dark btn-icon btn-rounded flush-soft-hover"
                            >
                                <span className="icon">
                                    <span className="position-relative">
                                        <span className="feather-icon">
                                            <Inbox />
                                        </span>

                                        <HkBadge
                                            bg="primary"
                                            soft
                                            pill
                                            size="sm"
                                            className="position-top-end-overflow-1"
                                        >
                                            4
                                        </HkBadge>
                                    </span>
                                </span>
                            </Link>
                        </Nav.Item>

                        {/* Notifications */}
                        <Nav.Item>
                            <Dropdown className="dropdown-notifications">
                                <Dropdown.Toggle
                                    variant="flush-dark"
                                    className="btn-icon btn-rounded flush-soft-hover no-caret"
                                >
                                    <span className="icon">
                                        <span className="position-relative">
                                            <span className="feather-icon">
                                                <Bell />
                                            </span>

                                            <HkBadge
                                                bg="success"
                                                indicator
                                                className="position-top-end-overflow-1"
                                            />
                                        </span>
                                    </span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu
                                    align="end"
                                    className="p-0"
                                >
                                    <Dropdown.Header className="px-4 fs-6">
                                        Notifications

                                        <Button
                                            variant="flush-dark"
                                            className="btn-icon btn-rounded flush-soft-hover"
                                        >
                                            <span className="icon">
                                                <span className="feather-icon">
                                                    <Settings />
                                                </span>
                                            </span>
                                        </Button>
                                    </Dropdown.Header>

                                    <SimpleBar className="dropdown-body p-2">
                                        <Dropdown.Item>
                                            <div className="media">
                                                <div className="media-head">
                                                    <div className="avatar avatar-rounded avatar-sm">
                                                        <img
                                                            src={avatar2}
                                                            alt="user"
                                                            className="avatar-img"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="media-body">
                                                    <div>
                                                        <div className="notifications-text">
                                                            Morgan Freeman
                                                            accepted your
                                                            invitation to
                                                            join the team
                                                        </div>

                                                        <div className="notifications-info">
                                                            <HkBadge
                                                                bg="success"
                                                                soft
                                                            >
                                                                Collaboration
                                                            </HkBadge>

                                                            <div className="notifications-time">
                                                                Today, 10:14
                                                                PM
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Item>

                                        <Dropdown.Item>
                                            <div className="media">
                                                <div className="media-head">
                                                    <div className="avatar avatar-icon avatar-sm avatar-success avatar-rounded">
                                                        <span className="initial-wrap">
                                                            <span className="feather-icon">
                                                                <Inbox />
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="media-body">
                                                    <div>
                                                        <div className="notifications-text">
                                                            New message
                                                            received from
                                                            Alan Rickman
                                                        </div>

                                                        <div className="notifications-info">
                                                            <div className="notifications-time">
                                                                Today, 7:51 AM
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Item>

                                        <Dropdown.Item>
                                            <div className="media">
                                                <div className="media-head">
                                                    <div className="avatar avatar-icon avatar-sm avatar-pink avatar-rounded">
                                                        <span className="initial-wrap">
                                                            <span className="feather-icon">
                                                                <Clock />
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="media-body">
                                                    <div>
                                                        <div className="notifications-text">
                                                            You have a follow
                                                            up with Jampack
                                                            Head on Friday,
                                                            Dec 19 at 9:30 am
                                                        </div>

                                                        <div className="notifications-info">
                                                            <div className="notifications-time">
                                                                Yesterday,
                                                                9:25 PM
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Item>

                                        <Dropdown.Item>
                                            <div className="media">
                                                <div className="media-head">
                                                    <div className="avatar avatar-sm avatar-rounded">
                                                        <img
                                                            src={avatar3}
                                                            alt="user"
                                                            className="avatar-img"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="media-body">
                                                    <div>
                                                        <div className="notifications-text">
                                                            Application of
                                                            Sarah Williams is
                                                            waiting for your
                                                            approval
                                                        </div>

                                                        <div className="notifications-info">
                                                            <div className="notifications-time">
                                                                Today 10:14
                                                                PM
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Item>

                                        <Dropdown.Item>
                                            <div className="media">
                                                <div className="media-head">
                                                    <div className="avatar avatar-sm avatar-rounded">
                                                        <img
                                                            src={avatar10}
                                                            alt="user"
                                                            className="avatar-img"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="media-body">
                                                    <div>
                                                        <div className="notifications-text">
                                                            Winston Churchil
                                                            shared a document
                                                            with you
                                                        </div>

                                                        <div className="notifications-info">
                                                            <HkBadge
                                                                bg="violet"
                                                                soft
                                                            >
                                                                File Manager
                                                            </HkBadge>

                                                            <div className="notifications-time">
                                                                2 Oct, 2021
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Item>

                                        <Dropdown.Item>
                                            <div className="media">
                                                <div className="media-head">
                                                    <div className="avatar avatar-icon avatar-sm avatar-danger avatar-rounded">
                                                        <span className="initial-wrap">
                                                            <span className="feather-icon">
                                                                <Calendar />
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="media-body">
                                                    <div>
                                                        <div className="notifications-text">
                                                            Last 2 days left
                                                            for the project to
                                                            be completed
                                                        </div>

                                                        <div className="notifications-info">
                                                            <HkBadge
                                                                bg="orange"
                                                                soft
                                                            >
                                                                Updates
                                                            </HkBadge>

                                                            <div className="notifications-time">
                                                                14 Sep, 2021
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Item>
                                    </SimpleBar>

                                    <div className="dropdown-footer">
                                        <Link to="#">
                                            <u>
                                                View all notifications
                                            </u>
                                        </Link>
                                    </div>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav.Item>

                        {/* Lock screen: same lock as the 15-minute idle timeout */}
                        <Nav.Item>
                            <LockButton />
                        </Nav.Item>

                        {/* User */}
                        <Nav.Item>
                            <UserMenu />
                        </Nav.Item>
                    </Nav>
                </div>

                {/* /End Nav */}
            </Container>
        </Navbar>
    );
};

export default connector(TopNav);