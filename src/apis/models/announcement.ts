export type AnnouncementType = {
    id: number,
    branch_id: number,
    name: string,
    color: string,
};

export type Announcement = {
    id: number,
    branch_id: number,
    title: string,
    content_preview: string,
    start_date: string,
    start_time: string|null,
    start_at: string,
    end_date: string|null,
    end_time: string|null,
    end_at: string|null,
};