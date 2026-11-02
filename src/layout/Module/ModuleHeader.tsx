import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { Breadcrumb, Button } from 'react-bootstrap';
import { ChevronDown, ChevronUp } from 'react-feather';
import { connect } from 'react-redux';
import { useMatches } from 'react-router-dom';

import HkTooltip from '@/components/@hk-tooltip/HkTooltip';
import { useSmartTranslation } from '@/hooks/use-translation';
import { translateMenu } from '@/i18n/menu';
import { RootState } from '@/redux/reducer';
import {
    toggleCollapsedNav,
    toggleTopNav,
} from '@/redux/action/Theme';

type ModuleHeaderProps = {
    topNavCollapsed: boolean;
    toggleTopNav: (collapsed: boolean) => void;
    showSidebar: boolean;
    toggleSidebar: () => void;
    appOptions?: ReactNode;
};

type CustomHandle = {
    title?: string;
    hide?: boolean;
    canNavigate?: boolean;
    module?: string;
};

function generateTitle(pathName: string) {
    const words = pathName.split('/');
    const lastWord = words.pop();

    if (lastWord) {
        return decodeURIComponent(lastWord);
    }

    return null;
}

const ModuleHeader = ({
    topNavCollapsed,
    toggleTopNav,
    showSidebar,
    toggleSidebar,
    appOptions,
}: ModuleHeaderProps) => {
    const { t } = useSmartTranslation();

    const matches = useMatches();

    const crumbs = matches.filter((match) => {
        const handle = match.handle as CustomHandle | undefined;

        return !handle?.hide;
    });

    return (
        <header className="app-header">
            <div className="d-flex align-items-center flex-grow-1">
                <Breadcrumb className="mt-3 mb-0">
                    {crumbs.map((match, index) => {
                        const handle = match.handle as CustomHandle | undefined;

                        // route titles are menu labels; a bare path segment (e.g. a record id) is shown as is
                        const title = handle?.title ? translateMenu(t, handle.title) : generateTitle(match.pathname);

                        if (handle?.canNavigate == null || handle.canNavigate) {
                            return (
                                <Breadcrumb.Item href={match.pathname} className="fs-5" key={index}>
                                    {title}
                                </Breadcrumb.Item>
                            );
                        }

                        return (
                            <Breadcrumb.Item href="#" className="fs-5" key={index}>
                                {title}
                            </Breadcrumb.Item>
                        );
                    })}

                </Breadcrumb>
            </div>

            <div className="app-options-wrap align-items-center">

                {appOptions}

                <Button
                    as="a"
                    variant="flush-dark"
                    className="btn-icon btn-rounded flush-soft-hover hk-navbar-togglable d-sm-inline-block d-none"
                    onClick={() =>
                        toggleTopNav(!topNavCollapsed)
                    }
                >
                    <HkTooltip
                        id="collapse-header"
                        placement={topNavCollapsed ? 'bottom' : 'top'}
                        title="Collapse"
                    >
                        <span className="icon">
                            <span className="feather-icon">
                                {topNavCollapsed ? (
                                    <ChevronDown />
                                ) : (
                                    <ChevronUp />
                                )}
                            </span>
                        </span>
                    </HkTooltip>
                </Button>

            </div>

            <div className={classNames('hk-sidebar-togglable', {active: !showSidebar})} onClick={toggleSidebar}/>

        </header>
    );
};

const mapStateToProps = (state: RootState) => {
    const {
        navCollapsed,
        topNavCollapsed,
        dataHover,
    } = state.theme;

    return {
        navCollapsed,
        topNavCollapsed,
        dataHover,
    };
};

const mapDispatchToProps = {
    toggleCollapsedNav,
    toggleTopNav,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ModuleHeader);