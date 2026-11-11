import React, { useState } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router-dom';

import {ModuleSidebar} from './ModuleSidebar';
import ModuleHeader from './ModuleHeader';
import classNames from 'classnames';
import { SettingsModule } from '@/views/Settings/settings-menu';
import { useAccess } from '@/providers/access';
import { NoAccess } from '@/components/Display/NoAccess';

type ModuleHandle = {
    module?: ModuleName;
    headerOptions?: React.ReactNode;
};

type ModuleName =
    | 'blog'
    | 'gallery'
    | 'invoice'
    | 'chat'
    | 'calendar'
    | 'inventory'
    | 'sales'
    | 'purchases'
    | 'einvoice'
    | 'gl'
    | 'banking'
    | 'dimensions'
    | SettingsModule;

const ModuleLayout = () => {
    const [showSidebar, setShowSidebar] = useState(true);
    const matches = useMatches();
    const { pathname } = useLocation();
    const { canPath } = useAccess();

    const moduleMatch = [...matches]
        .reverse()
        .find((match) => {
            const handle = match.handle as ModuleHandle | undefined;

            return handle?.module;
        });

    const module = (
        moduleMatch?.handle as ModuleHandle | undefined
    )?.module;

    const headerOptionsMatch = [...matches]
        .reverse()
        .find((match) => {
            const handle = match.handle as ModuleHandle | undefined;

            return handle?.headerOptions;
        });

    const headerOptions = (
        headerOptionsMatch?.handle as ModuleHandle | undefined
    )?.headerOptions;
    if (!module) {
        return <Outlet />;
    }

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames("app-wrap", "has-sidebar", { "app-sidebar-toggle": !showSidebar })} >

                <ModuleSidebar module={module} />

                <div className="app-content">
                    <div className="app-detail-wrap">
                        <ModuleHeader 
                            toggleSidebar={() => setShowSidebar(!showSidebar)} 
                            showSidebar={showSidebar}
                            appOptions={headerOptions}
                        />
                        {/* a screen opened by its address that the user's role doesn't allow */}
                        {canPath(pathname) ? <Outlet /> : <NoAccess />}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ModuleLayout;