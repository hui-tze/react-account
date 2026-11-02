export type MyNotification = {
    id: number,
    staff_id: number,
    resource_type: 'attendance-reminder'|'task'|'leave-application',
    assoc_id: number|null,
    title: string,
    description: string,
    is_read: boolean,
    created_at: string,
}