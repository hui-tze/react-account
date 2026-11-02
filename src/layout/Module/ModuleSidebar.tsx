import SimpleBar from "simplebar-react";
import { ModuleSidebarMenu } from "./ModuleSidebarMenu";
import { Link, useLocation } from "react-router-dom";
import { Dropdown, Nav } from "react-bootstrap";
import React from "react";
import { useSmartTranslation } from "@/hooks/use-translation";
import { translateMenu } from "@/i18n/menu";

interface ModuleSidebarProps {
    module: string;
}

export const ModuleSidebar = ({ module }: ModuleSidebarProps) => {
    const config = ModuleSidebarMenu[module];
    const { t } = useSmartTranslation();
    const { pathname } = useLocation();

    if (!config) {
        return null;
    }

    const isActive = (path: string) =>
        pathname === path || pathname.startsWith(`${path}/`);

    return (
        <Nav className="app-sidebar">
            <SimpleBar className="nicescroll-bar">
                <div className="menu-content-wrap">

                    {!!config.createMenu?.length && (
                        <Dropdown className="mb-4">
                            <Dropdown.Toggle variant="primary" className="btn-rounded btn-block w-100">
                                {translateMenu(t, "Create")}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="w-100">
                                {config.createMenu.map((action) => (
                                    <Dropdown.Item key={action.name} as={Link} to={action.path}>
                                        {translateMenu(t, action.name)}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    )}

                    {config.actions?.map((action) => (
                        <Link
                            key={action.name}
                            to={action.path}
                            className="btn btn-primary btn-rounded btn-block mb-4"
                        >
                            {translateMenu(t, action.name)}
                        </Link>
                    ))}

                    <div className="menu-group">
                        <Nav
                            as="ul"
                            className="nav-light navbar-nav flex-column"
                        >
                            {config.menus?.map((menu) => {
                                const Icon = menu.icon;

                                return (
                                    <Nav.Item as="li" key={menu.name}>
                                        <Nav.Link
                                            as={Link}
                                            to={menu.path}
                                            active={isActive(menu.path)}
                                        >
                                            <span className="nav-icon-wrap">
                                                <span className="feather-icon">
                                                    <Icon />
                                                </span>
                                            </span>

                                            <span className="nav-link-text">
                                                {translateMenu(t, menu.name)}
                                            </span>
                                        </Nav.Link>
                                    </Nav.Item>
                                );
                            })}
                        </Nav>
                    </div>

                    {config.sections?.map((section) => (
                        <React.Fragment key={section.title}>
                            <div className="menu-gap" />

                            <div className="nav-header">
                                <span>{translateMenu(t, section.title)}</span>
                            </div>

                            <div className="menu-group">
                                <Nav
                                    as="ul"
                                    className="nav-light navbar-nav flex-column"
                                >
                                    {section.menus.map((menu) => {
                                        const Icon = menu.icon;

                                        return (
                                            <Nav.Item
                                                as="li"
                                                key={menu.name}
                                            >
                                                <Nav.Link
                                                    as={Link}
                                                    to={menu.path}
                                                    active={isActive(menu.path)}
                                                >
                                                    <span className="nav-icon-wrap">
                                                        <span className="feather-icon">
                                                            <Icon />
                                                        </span>
                                                    </span>

                                                    <span className="nav-link-text">
                                                        {translateMenu(t, menu.name)}
                                                    </span>
                                                </Nav.Link>
                                            </Nav.Item>
                                        );
                                    })}
                                </Nav>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </SimpleBar>
        </Nav>
    );
};