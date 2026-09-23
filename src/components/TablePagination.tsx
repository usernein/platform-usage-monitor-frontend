import { Group, Pagination, Select, Text } from "@mantine/core"
import classes from "./TablePagination.module.css"

interface TablePaginationProps {
    totalItems: number
    page: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

const pageSizeOptions = ["20", "50", "100"]

export function TablePagination({
    totalItems,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: TablePaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const firstItem = (page - 1) * pageSize + 1
    const lastItem = Math.min(page * pageSize, totalItems)

    return (
        <Group justify="space-between" className={classes.root}>
            <Text size="sm" c="dimmed">
                {totalItems === 0 ? "Nenhum resultado" : `${firstItem}–${lastItem} de ${totalItems}`}
            </Text>
            <Pagination total={totalPages} value={page} onChange={onPageChange} withEdges />
            <Select
                label="Itens por página"
                data={pageSizeOptions}
                value={String(pageSize)}
                onChange={(value) => onPageSizeChange(Number(value ?? 20))}
                allowDeselect={false}
                w={145}
            />
        </Group>
    )
}
