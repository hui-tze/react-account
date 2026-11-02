import React, { ReactNode } from "react";
import {OverlayTrigger, OverlayTriggerProps, Tooltip} from "react-bootstrap";

interface HkTooltipProps extends Omit<OverlayTriggerProps, 'overlay'> {
    id: string;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    title: string|ReactNode;
    show?: boolean;
    bsPrefix?: string;
    className?: string;
    as?: React.ElementType;  // `as` prop can accept any React component or HTML element
}

export default function HkTooltip({
    children,
    id,
    placement = 'auto',
    title,
    show = true,
    bsPrefix,
    className,
    as = 'span',
}: HkTooltipProps) {
    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            placement={placement}
            overlay={(
                <Tooltip
                    className={className}
                    bsPrefix={bsPrefix}
                >
                    <span>{title}</span>
                </Tooltip>
            )}
        >
            {children}
        </OverlayTrigger>
    );
}
