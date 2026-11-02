import React, { Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes } from 'react-router-dom';

import PageAnimate from '../components/Animation/PageAnimate';
import LayoutClassic from '@/layout/MainLayout/ClassicLayout';
import { routes } from './RouteList';

const MainRoutes = () => {
    return (
        <AnimatePresence>
            <Suspense fallback={null}>
                <LayoutClassic>
                    <Routes>
                        {routes.map((obj, i) => {
                            if (!obj.component) {
                                return null;
                            }

                            const Component = obj.component;

                            return (
                                <Route
                                    key={i}
                                    path={obj.path}
                                    element={
                                        <PageAnimate>
                                            <Component />
                                        </PageAnimate>
                                    }
                                />
                            );
                        })}

                        <Route
                            path="/"
                            element={<Navigate to="/dashboard" replace />}
                        />
                    </Routes>
                </LayoutClassic>
            </Suspense>
        </AnimatePresence>
    );
};

export default MainRoutes;