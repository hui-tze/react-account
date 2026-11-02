import React, { ReactNode, useEffect, useState } from 'react';
import classNames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { useMatch } from 'react-router-dom';
import { useWindowWidth } from '@react-hook/window-size';

import { toggleCollapsedNav } from '@/redux/action/Theme';
import PageFooter from '@/layout/Footer/PageFooter';
import TopNav from '@/layout/Header/TopNav';
import Sidebar from '@/layout/Sidebar/Sidebar';
//import ChatBotInterface from '../../../views/ChatPopup/ChatBot/ChatBotInterface';

interface LayoutClassicProps {
    children?: ReactNode;
}

interface RootState {
    theme: {
        navCollapsed: boolean;
        topNavCollapsed: boolean;
    };
}

const mapStateToProps = (state: RootState) => ({
    navCollapsed: state.theme.navCollapsed,
    topNavCollapsed: state.theme.topNavCollapsed,
});

const connector = connect(mapStateToProps, {
    toggleCollapsedNav,
});

type Props = ConnectedProps<typeof connector> & LayoutClassicProps;

const LayoutClassic = ({
    children,
    navCollapsed,
    topNavCollapsed,
    toggleCollapsedNav,
}: Props) => {
    const [dataHover, setDataHover] = useState(navCollapsed);

    const error404Route = useMatch('/error-404');
    const dashboardRoute = useMatch('/dashboard');
    const appRoutes = 1;
    //const appRoutes = useMatch('/apps/*');

    const windowWidth = useWindowWidth();

    useEffect(() => {
        if (appRoutes && windowWidth >= 1200) {
            toggleCollapsedNav(true);
        }
    }, [appRoutes, windowWidth, toggleCollapsedNav]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDataHover(navCollapsed);
        }, 250);

        return () => {
            window.clearTimeout(timer);
        };
    }, [navCollapsed]);

    return (
        <div
            className={classNames(
                'hk-wrapper',
                {
                    'hk-pg-auth': error404Route !== null,
                }
            )}
            data-layout="vertical"
            data-layout-style={navCollapsed ? 'collapsed' : 'default'}
            data-navbar-style={topNavCollapsed ? 'collapsed' : ''}
            data-menu="light"
            data-footer="simple"
            data-hover={dataHover ? 'active' : ''}
        >
            <TopNav />

            <Sidebar />

            {/* {dashboardRoute && (
                <ChatBotInterface show={false} />
            )} */}

            <div
                className={classNames('hk-pg-wrapper', {
                    'pb-0': appRoutes !== null,
                })}
            >
                {children}

                {appRoutes === null && <PageFooter />}
            </div>
        </div>
    );
};

export default connector(LayoutClassic);