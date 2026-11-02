import classNames from "classnames";
import type {PropsWithChildren} from "react";
import {Badge} from "react-bootstrap";

export type BadgeProps = {
    as?: string,
    bg: string,
    pill?: boolean,
    outline?: boolean,
    indicator?: boolean,
    text?: string,
    bsPrefix?: string,
    className?: string,
    size?: 'sm' | '',
    soft?: boolean,
    nowrap?: boolean  
}

export function HkBadge({ children, as, bg, pill, outline, indicator, text, bsPrefix, className, size, soft, nowrap, ...rest }: PropsWithChildren<BadgeProps>) {
    return (
        <Badge
            //as={as ?? ''}
            bg={!soft ? bg : `bg-${bg}-light-5`}
            pill={pill}
            text={text}
            bsPrefix={bsPrefix}
            {...rest}
            className={classNames(className, 
                { "badge-sm": size === "sm" },
                { "badge-outline": outline },
                (soft ? `badge-soft-${bg}` : ""),
                { "badge-indicator": indicator },
            )}
            style={nowrap ? { whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" } : undefined}
        >
            {children}
        </Badge>
    )
}

