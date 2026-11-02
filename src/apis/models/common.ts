export type Option = {
    id: number,
    code: string,
    name: string,
}
export interface SelectOptionProps<T = string> {
    value: T;
    label: string;
}

export type TempUrlResponse = {
    id: number,
    name: string,
    path: string,
    temp_url: string,
}

export type URLResponse = {
    url: string
}