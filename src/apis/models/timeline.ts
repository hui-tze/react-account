import { ReactNode } from "react";

export type TimelineItem = {
    title: string|ReactNode;
    description: string|ReactNode;
    footinfo: string|ReactNode;
};
  
export type TimelineEvent = {
    title: string|ReactNode;
    items: TimelineItem[];
};