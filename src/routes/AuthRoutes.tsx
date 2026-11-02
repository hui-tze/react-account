import { AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { Suspense } from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import PageAnimate from '../components/Animation/PageAnimate';

const ClassicRoutes = () => {

    const lockScreenAuth = useMatch("/auth/lock-screen");

    return (
        <AnimatePresence>
            <Suspense
                fallback={
                    <div className="preloader-it">
                        <div className="loader-pendulums" />
                    </div>
                }>
                <div className={classNames("hk-wrapper hk-pg-auth", { "bg-primary-dark-3": lockScreenAuth })} data-footer="simple" >
                    <PageAnimate>
                        <Outlet />
                    </PageAnimate>
                </div>
            </Suspense>
        </AnimatePresence>
    );
};

export default ClassicRoutes;
