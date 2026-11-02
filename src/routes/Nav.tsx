import React, {Suspense} from "react";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import LoginClassic from "@/views/Login";
import {useAuth} from "@/providers/auth";
import {ErrorBoundary} from "react-error-boundary";
import {generalFallbackRenderer} from "@/components/Display/ErrorBoundary";
import LayoutClassic from '@/layout/MainLayout/ClassicLayout';

export default function Nav() {
    const location = useLocation();
    const auth = useAuth();

    if(auth?.token == null) {
        if(location.pathname != "/") {
            return <Navigate to="/" />;
        }

        return <LoginClassic />;
    }

    return (
        <>
            {/* <AnimatePresence> */}
            <LayoutClassic>
                <ErrorBoundary fallbackRender={generalFallbackRenderer}>
                    <Suspense
                        fallback={
                            <div className="preloader-it position-fixed">
                                <div className="loader-pendulums" />
                            </div>
                        }>
                        <Outlet/>
                    </Suspense>
                </ErrorBoundary>
            </LayoutClassic>

            {/* </AnimatePresence> */}
        </>
    );
}
