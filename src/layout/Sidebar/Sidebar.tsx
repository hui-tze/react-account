/* eslint-disable react-hooks/rules-of-hooks */

import React, {ReactNode, useState} from 'react';
import {Button, Card, Nav} from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import {connect, ConnectedProps} from 'react-redux';
import {NavLink, useLocation} from 'react-router-dom';
import {useWindowWidth} from '@react-hook/window-size';
import classNames from 'classnames';

import {toggleCollapsedNav} from '../../redux/action/Theme';
import SidebarHeader from './SidebarHeader';
import {SidebarMenu} from './SidebarMenu';
import {useAccess} from '@/providers/access';
import {useSmartTranslation} from '@/hooks/use-translation';
import {translateMenu} from '@/i18n/menu';

interface MenuItem {
    id: string;
    name: string;
    path: string;
    icon?: ReactNode;
    iconBadge?: ReactNode;
    badgeIndicator?: ReactNode;
    badge?: ReactNode;
    childrens?: MenuItem[];
    // only active on the exact path (e.g. a parent overview page)
    exact?: boolean;
}

interface MenuGroup {
    group?: string;
    contents: MenuItem[];
}

interface ThemeState {
    navCollapsed: boolean;
}

interface RootState {
    theme: ThemeState;
}

const mapStateToProps = ({ theme }: RootState) => ({
    navCollapsed: theme.navCollapsed,
});

const connector = connect(mapStateToProps, {
    toggleCollapsedNav,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

const Sidebar: React.FC<PropsFromRedux> = ({
    navCollapsed,
    toggleCollapsedNav,
}) => {
    const {t} = useSmartTranslation();
    const {canArea} = useAccess();
    const [activeMenu, setActiveMenu] = useState<string | undefined>();
    const [activeSubMenu, setActiveSubMenu] = useState<string | undefined>();

    const windowWidth = useWindowWidth();
    const location = useLocation();

    /**
     * React Router v7 replacement for useRouteMatch()
     */
    const isRouteActive = (path: string, exact = false): boolean => {
        if (!path) {
            return false;
        }

        // Exact match
        if (location.pathname === path) {
            return true;
        }

        // Child route match
        return (
            !exact &&
            path !== '/' &&
            location.pathname.startsWith(`${path}/`)
        );
    };

    const handleClick = (menuName: string) => {
        setActiveMenu(menuName);

        if (windowWidth <= 1199) {
            toggleCollapsedNav(false);
        }
    };

    const backDropToggle = () => {
        toggleCollapsedNav(!navCollapsed);
    };

    return (
        <>
            <div className="hk-menu">
                {/* Brand */}
                <SidebarHeader />

                {/* Main Menu */}
                <SimpleBar className="nicescroll-bar">
                    <div className="menu-content-wrap">
                        {(SidebarMenu as MenuGroup[])
                            // only areas the user's role can open
                            .map((group) => ({...group, contents: group.contents.filter((item) => canArea(item.path ?? ''))}))
                            .filter((group) => group.contents.length > 0)
                            .map((routes, index) => (
                            <React.Fragment key={index}>
                                <div className="menu-group">
                                    {routes.group && (
                                        <div className="nav-header">
                                            <span>{translateMenu(t, routes.group)}</span>
                                        </div>
                                    )}

                                    {routes.contents.map((menus, idx) => (
                                        <Nav
                                            bsPrefix="navbar-nav"
                                            className="flex-column"
                                            key={idx}
                                        >
                                            <Nav.Item
                                                className={classNames({
                                                    active: isRouteActive(menus.path, menus.exact),
                                                })}
                                            >
                                                {menus.childrens ? (
                                                    <>
                                                        {/* Parent menu */}
                                                        <Nav.Link
                                                            data-bs-toggle="collapse"
                                                            data-bs-target={`#${menus.id}`}
                                                            aria-expanded={activeMenu === menus.name}
                                                            onClick={() =>
                                                                setActiveMenu(menus.name)
                                                            }
                                                        >
                                                            <span
                                                                className={classNames(
                                                                    'nav-icon-wrap',
                                                                    {
                                                                        'position-relative': menus.iconBadge,
                                                                    }
                                                                )}
                                                            >
                                                                {menus.iconBadge && (menus.iconBadge)}

                                                                <span className="svg-icon">
                                                                    {menus.icon}
                                                                </span>
                                                            </span>

                                                            <span
                                                                className={classNames(
                                                                    'nav-link-text',
                                                                    {
                                                                        'position-relative': menus.badgeIndicator,
                                                                    }
                                                                )}
                                                            >
                                                                {translateMenu(t, menus.name)}

                                                                {menus.badgeIndicator && menus.badgeIndicator}
                                                            </span>

                                                            {menus.badge && menus.badge}
                                                        </Nav.Link>

                                                        {/* Children */}
                                                        <ul
                                                            id={menus.id}
                                                            className={classNames(
                                                                'nav flex-column nav-children',
                                                                {
                                                                    collapse: activeMenu !== menus.name,
                                                                }
                                                            )}
                                                        >
                                                            <li className="nav-item">
                                                                <ul className="nav flex-column">
                                                                    {menus.childrens.map((subMenu, indx) =>
                                                                        subMenu.childrens ? (
                                                                            <li
                                                                                className="nav-item"
                                                                                key={indx}
                                                                            >
                                                                                {/* Nested parent */}
                                                                                <Nav.Link
                                                                                    as={NavLink}
                                                                                    to={subMenu.path}
                                                                                    data-bs-toggle="collapse"
                                                                                    data-bs-target={`#${subMenu.id}`}
                                                                                    aria-expanded={activeSubMenu === subMenu.name}
                                                                                    onClick={() =>
                                                                                        setActiveSubMenu(subMenu.name)
                                                                                    }
                                                                                >
                                                                                    <span className="nav-link-text">
                                                                                        {translateMenu(t, subMenu.name)}
                                                                                    </span>
                                                                                </Nav.Link>

                                                                                {subMenu.childrens.map((childrenPath, i) => (
                                                                                    <ul id={subMenu.id} key={i}
                                                                                        className={classNames(
                                                                                            'nav flex-column nav-children',
                                                                                            {
                                                                                                collapse: activeSubMenu !== subMenu.name,
                                                                                            }
                                                                                        )}
                                                                                    >
                                                                                        <li className="nav-item">
                                                                                            <ul className="nav flex-column">
                                                                                                <li className="nav-item">
                                                                                                    <NavLink
                                                                                                        to={childrenPath.path}
                                                                                                        onClick={() =>
                                                                                                            handleClick(childrenPath.name)
                                                                                                        }
                                                                                                        className={({ isActive }) =>
                                                                                                            classNames('nav-link', {
                                                                                                                active: isActive,
                                                                                                            })
                                                                                                        }
                                                                                                    >
                                                                                                        <span className="nav-link-text">
                                                                                                            {translateMenu(t, childrenPath.name)}
                                                                                                        </span>
                                                                                                    </NavLink>
                                                                                                </li>
                                                                                            </ul>
                                                                                        </li>
                                                                                    </ul>
                                                                                ))}
                                                                            </li>
                                                                        ) : (
                                                                            <li
                                                                                className="nav-item"
                                                                                key={indx}
                                                                            >
                                                                                <NavLink
                                                                                    to={subMenu.path}
                                                                                    onClick={() =>
                                                                                        handleClick(
                                                                                            subMenu.name
                                                                                        )
                                                                                    }
                                                                                    className={({isActive}) =>
                                                                                        classNames(
                                                                                            'nav-link',
                                                                                            {
                                                                                                active: isActive,
                                                                                            }
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <span className="nav-link-text">
                                                                                        {translateMenu(t, subMenu.name)}
                                                                                    </span>
                                                                                </NavLink>
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </li>
                                                        </ul>
                                                    </>
                                                ) : (
                                                    <>
                                                        {routes.group === 'Documentation' ? (
                                                            <a
                                                                className="nav-link"
                                                                href={menus.path}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <span className="nav-icon-wrap">
                                                                    <span className="svg-icon">
                                                                        {menus.icon}
                                                                    </span>
                                                                </span>

                                                                <span className="nav-link-text">
                                                                    {translateMenu(t, menus.name)}
                                                                </span>

                                                                {menus.badge && menus.badge}
                                                            </a>
                                                        ) : (
                                                            <NavLink
                                                                to={menus.path}
                                                                end={menus.exact}
                                                                onClick={() =>
                                                                    handleClick(
                                                                        menus.name
                                                                    )
                                                                }
                                                                className={({isActive,}) =>
                                                                    classNames(
                                                                        'nav-link',
                                                                        {
                                                                            active: isActive,
                                                                        }
                                                                    )
                                                                }
                                                            >
                                                                <span className="nav-icon-wrap">
                                                                    <span className="svg-icon">
                                                                        {menus.icon}
                                                                    </span>
                                                                </span>

                                                                <span className="nav-link-text">
                                                                    {translateMenu(t, menus.name)}
                                                                </span>

                                                                {menus.badge && menus.badge}
                                                            </NavLink>
                                                        )}
                                                    </>
                                                )}
                                            </Nav.Item>
                                        </Nav>
                                    ))}
                                </div>

                                <div className="menu-gap" />
                            </React.Fragment>
                        ))}

                       {/*  <Card
                            bg="orange-light-5"
                            className="callout card-flush text-center w-220p mx-auto"
                        >
                            <Card.Body>
                                <h5 className="h5">
                                    Quickly Build Applications
                                </h5>

                                <Card.Text className="p-sm">
                                    Exclusively for webapps Based on Bootstrap
                                </Card.Text>

                                <Button
                                    variant="primary"
                                    href="https://nubra-ui-react.netlify.app/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-block"
                                >
                                    Go Nubra-UI
                                </Button>
                            </Card.Body>
                        </Card> */}
                    </div>
                </SimpleBar>
                {/* /Main Menu */}
            </div>

            <div
                onClick={backDropToggle}
                className="hk-menu-backdrop"
            />
        </>
    );
};

export default connector(Sidebar);