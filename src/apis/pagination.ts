export type LaravelPaginationRequest = {
    page: number,
    paginate_size?: number | undefined
}

export type PaginateLinkProps = {
    url: string | null;
    label: string;
    active: boolean;
}

// export type PaginationMeta = {
//     current_page: number;
//     first_page_url: string;
//     from: number;
//     last_page: number;
//     last_page_url: string;
//     links: PaginateLinkProps[];
//     next_page_url: number;
//     path: string;
//     per_page: number;
//     prev_page_url: string;
//     to: number;
//     total: number;
// }

export type PaginationMeta = {
    count: number,
    current_page: number,
    last_page: number,
    from: number,
    to: number,
    total: number
}

export type PaginationResponse<T> = {
    data: T[];
    meta: PaginationMeta
};
