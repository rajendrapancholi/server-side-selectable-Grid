import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Pagination {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
}

interface Data {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: Date;
    date_end: Date;
}

interface ApiResponse {
    data: Data[];
    pagination: Pagination;
}

const TableData = () => {
    const [loading, setLoading] = useState(false);
    const [apiData, setApiData] = useState<Data[]>([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [remainigSelect, setRemainigSelect] = useState<number>(0);

    const [showOverlay, setShowOverlay] = useState(false);

    const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
    const [deselectedRowIds, setDeselectedRowIds] = useState<Set<number>>(new Set());

    const [inputSelectionCount, setInputSelectionCount] = useState<string>('');
    const [desiredSelectionCount, setDesiredSelectionCount] = useState<number | null>(null);

    const rowsPerPage = 12;

    // Fetch a page
    const fetchArtworks = async (pageNumber: number) => {
        setLoading(true);
        try {
            const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNumber}`);
            const json: ApiResponse = await res.json();

            setApiData(json.data);
            if (json.pagination) setPagination(json.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtworks(page);
    }, [page]);

    const truncateText = (text: string, maxLength = 20) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };


    useEffect(() => {
        console.log("Desised: ", desiredSelectionCount);
        if (desiredSelectionCount === null || desiredSelectionCount <= 0 || !pagination || !apiData.length) return;

        const newSelected = new Set(selectedRowIds);
        const newDeselected = new Set(deselectedRowIds);

        // number of rows we can select on current page
        const rowsToSelect = Math.min(desiredSelectionCount, apiData.length);

        for (let i = 0; i < rowsToSelect; i++) {
            newSelected.add(apiData[i].id);
            newDeselected.delete(apiData[i].id);
        }

        setSelectedRowIds(newSelected);
        setDeselectedRowIds(newDeselected);

        // Calculate remaining selection
        const remaining = desiredSelectionCount - rowsToSelect;

        if (remaining > 0) {
            setDesiredSelectionCount(remaining);
            setRemainigSelect(remaining);
        } else {
            // Reset if fully selected
            setDesiredSelectionCount(0);
            setRemainigSelect(0);
        }

    }, [apiData, pagination]);

    const handleSelection = () => {
        const count = parseInt(inputSelectionCount);
        console.log("DEsiredSeleected1: ", desiredSelectionCount);
        if (count === 0) {
            setShowOverlay(false);
            setSelectedRowIds(new Set());
            setDeselectedRowIds(new Set());
            return;
        }
        if (isNaN(count) || count < 0 || !pagination || !apiData.length) return;

        const newSelected = new Set(selectedRowIds);
        const newDeselected = new Set(deselectedRowIds);

        // number of rows we can select on current page
        const rowsToSelect = Math.min(count, apiData.length);

        for (let i = 0; i < rowsToSelect; i++) {
            newSelected.add(apiData[i].id);
            newDeselected.delete(apiData[i].id);
        }

        setSelectedRowIds(newSelected);
        setDeselectedRowIds(newDeselected);

        // Calculate remaining selection
        const remaining = count - rowsToSelect;

        if (remaining > 0) {
            setDesiredSelectionCount(remaining);
            setRemainigSelect(remaining);
            console.log("Remainig: ", remaining);
        } else {
            // Reset if fully selected
            setDesiredSelectionCount(0);
            setRemainigSelect(0);
        }
        console.log("DEsiredSeleected2: ", desiredSelectionCount);
        setShowOverlay(false);
    };

    // Current page selection
    const selectedRowsOnPage = apiData.filter((row) => selectedRowIds.has(row.id) && !deselectedRowIds.has(row.id));

    // Individual row select/deselect
    const onSelectionChange = (e: { value: Data[]; }) => {
        const updatedSelected = new Set(selectedRowIds);
        const updatedDeselected = new Set(deselectedRowIds);

        apiData.forEach((row) => {
            const isSelectedNow = e.value.some((v) => v.id === row.id);
            if (isSelectedNow) {
                updatedSelected.add(row.id);
                updatedDeselected.delete(row.id);
            } else {
                if (selectedRowIds.has(row.id)) updatedDeselected.add(row.id);
            }
        });

        setSelectedRowIds(updatedSelected);
        setDeselectedRowIds(updatedDeselected);
    };

    // Header select all / deselect all
    const onSelectAllChange = (e: { checked: boolean; }) => {
        const updatedSelected = new Set(selectedRowIds);
        const updatedDeselected = new Set(deselectedRowIds);

        if (e.checked) {
            apiData.forEach((row) => {
                updatedSelected.add(row.id);
                updatedDeselected.delete(row.id);
            });
        } else {
            apiData.forEach((row) => {
                if (selectedRowIds.has(row.id)) updatedDeselected.add(row.id);
            });
        }

        setSelectedRowIds(updatedSelected);
        setDeselectedRowIds(updatedDeselected);
    };

    const totalSelected = selectedRowIds.size - deselectedRowIds.size;

    const start = ((pagination?.current_page ?? 1) - 1) * rowsPerPage + 1;
    const end = Math.min((pagination?.current_page ?? 1) * rowsPerPage, pagination?.total ?? 0);

    const getVisiblePages = () => {
        if (!pagination) return [];
        const totalPages = pagination.total_pages;
        const currentPage = pagination.current_page;
        const maxButtons = 5;
        let start = Math.max(currentPage - 2, 1);
        let end = start + maxButtons - 1;
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(end - maxButtons + 1, 1);
        }
        const pages = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="w-full p-3 rounded-2xl">
            <span className="text-gray-500">Selected: {totalSelected + remainigSelect} rows</span>

            <DataTable
                value={apiData}
                loading={loading}
                selectionMode="multiple"
                dataKey="id"
                selection={selectedRowsOnPage}
                onSelectionChange={onSelectionChange}
                selectAll={apiData.length > 0 && apiData.every((r) => selectedRowIds.has(r.id) && !deselectedRowIds.has(r.id))}
                onSelectAllChange={onSelectAllChange}
                className="rounded-4xl"
            >
                <Column selectionMode="multiple" bodyClassName="w-20px" />
                <Column
                    body={null}
                    header={
                        <div className="relative">
                            <ChevronDown onClick={() => setShowOverlay((s) => !s)} className="cursor-pointer" />
                            {showOverlay && (
                                <div className="absolute z-50 top-10 left-3 w-fit p-3 shadow-2xl shadow-gray-700 rounded-md bg-white">
                                    <div className="text-gray-500 mt-2 flex flex-col gap-1 mb-2">
                                        <span className="text-lg">Select multiple rows</span>
                                        <span className="text-xs">Enter number of rows to select across all pages</span>
                                    </div>
                                    <div className="flex gap-2 justify-between items-center">
                                        <input
                                            type="number"
                                            min={1}
                                            placeholder="e.g., 20"
                                            // value={}
                                            onChange={(e) => setInputSelectionCount(e.target.value)}
                                            className="py-2 px-3 border border-gray-500 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600"
                                        />
                                        <button onClick={handleSelection} className="p-button p-button-sm">
                                            Select
                                        </button>
                                    </div>
                                </div>
                            )}
                            {showOverlay && <div className="fixed inset-0 z-40" onClick={() => setShowOverlay(false)} />}
                        </div>
                    }
                />
                <Column field="title" header="Title" body={(rowData) => <span>{truncateText(rowData.title)}</span>} />
                <Column field="place_of_origin" header="Place of Origin" body={(rowData) => <span>{truncateText(rowData.place_of_origin)}</span>} />
                <Column field="artist_display" header="Artist" body={(rowData) => <span>{truncateText(rowData.artist_display)}</span>} />
                <Column field="inscriptions" header="Inscriptions" body={(rowData) => <span>{truncateText(rowData.inscriptions)}</span>} />
                <Column field="date_start" header="Start Date" />
                <Column field="date_end" header="End Date" />
            </DataTable>

            <div className="flex justify-between items-center my-4 text-gray-500">
                <div>
                    Showing <span className="text-gray-800 font-bold">{start}</span> to <span className="text-gray-800 font-bold">{end}</span> of{' '}
                    <span className="text-gray-800 font-bold">{pagination?.total}</span> entries
                </div>
                <div className="flex gap-2">
                    <button disabled={pagination?.current_page === 1} onClick={() => setPage((p) => p - 1)} className="p-button p-button-text">
                        Previous
                    </button>
                    {getVisiblePages().map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`p-button p-button-text px-4 py-2 rounded ${p === page ? 'bg-blue-600! text-white! font-bold' : 'bg-gray-200 text-black'}`}
                        >
                            {p}
                        </button>
                    ))}
                    <button disabled={pagination?.current_page === pagination?.total_pages} onClick={() => setPage((p) => p + 1)} className="p-button p-button-text">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};


export default TableData;
