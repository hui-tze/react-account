import {Pagination as HeadlessPagination} from "@ark-ui/react/pagination";
import React from "react";
import {Col, Pagination, Row} from "react-bootstrap";
import {ChevronLeft, ChevronRight} from "react-feather";
import {PaginationMeta} from "@/apis/pagination";

interface TableFooterProps {
    setPage: (page: number) => void;
    meta: PaginationMeta;
    paginatorSize?: "sm" | "lg"; // Use appropriate Bootstrap size options for pagination
}

export default function PaginatedTableFooter({ setPage, meta, paginatorSize}: TableFooterProps) {
    return (
        <Row className="mt-3">
            <Col>
                {meta.from} - {meta.to} of {meta.total}
            </Col>
            <Col>
                <HeadlessPagination.Root
                    count={meta.total}
                    pageSize={meta.count}
                    siblingCount={2}
                    page={meta.current_page}
                    onPageChange={(detail) => {
                        setPage(detail.page);
                    }}
                    asChild
                >
                    <Pagination size={paginatorSize} className='custom-pagination pagination-filled d-flex justify-content-end'>
                        <HeadlessPagination.PrevTrigger asChild>
                            <Pagination.Prev>
                                <ChevronLeft size={12} />
                            </Pagination.Prev>
                        </HeadlessPagination.PrevTrigger>
                        <HeadlessPagination.Context>
                            {(pagination) =>
                                pagination.pages.map((page, index) =>
                                    page.type === 'page' ? (
                                        <HeadlessPagination.Item key={index} {...page} asChild>
                                            <Pagination.Item>
                                                {page.value}
                                            </Pagination.Item>
                                        </HeadlessPagination.Item>
                                    ) : (
                                        <HeadlessPagination.Ellipsis key={index} index={index}>
                                            &#8230;
                                        </HeadlessPagination.Ellipsis>
                                    ),
                                )
                            }
                        </HeadlessPagination.Context>
                        <HeadlessPagination.NextTrigger asChild>
                            <Pagination.Next>
                                <ChevronRight size={12} />
                            </Pagination.Next>
                        </HeadlessPagination.NextTrigger>
                    </Pagination>
                </HeadlessPagination.Root>

            </Col>
        </Row>
    );
}
