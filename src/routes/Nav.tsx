import React, {Suspense} from "react";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import LoginClassic from "@/views/Login";
import {useAuth} from "@/providers/auth";
import {ErrorBoundary} from "react-error-boundary";
import {generalFallbackRenderer} from "@/components/Display/ErrorBoundary";
import LayoutClassic from '@/layout/MainLayout/ClassicLayout';
import {DisplayPreferences} from "@/providers/display-preferences";
import {AccessProvider} from "@/providers/access";
import LockScreen from "@/views/Authentication/LockScreen";

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
            <DisplayPreferences>
                <AccessProvider>
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
                </AccessProvider>
            </DisplayPreferences>

            {/* </AnimatePresence> */}

            {/* after 15 minutes idle; the page underneath stays as it was */}
            {auth.locked && <LockScreen />}
        </>
    );
}
