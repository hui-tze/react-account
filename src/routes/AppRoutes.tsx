import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import LayoutClassic from '@/layout/MainLayout/ClassicLayout';

const AppRoutes = () => {
    return (
        <Suspense
            fallback={
                <div className="preloader-it">
                    <div className="loader-pendulums" />
                </div>
            }>
            <LayoutClassic>
                <Outlet />
            </LayoutClassic>
        </Suspense>
    );
};

export default AppRoutes;
