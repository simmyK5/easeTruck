import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    Button,
} from '@mui/material';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';



const LeadInfo = () => {
    const { user } = useAuth0();
    const [userDetail, setUserDetails] = useState({
        _id: '',
        firstName: '',
        lastName: '',
        email: '',
        userRole: '',
        isLive: '',
    });
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // ✅ Fetch user details
    useEffect(() => {
        if (user) {
            fetchUserDetails(user.email);
        }
    }, [user]);

    const fetchUserDetails = async (email) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
            setUserDetails(res.data);
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };

    // ✅ Fetch support events
    const fetchItems = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/adminAi/getLeadInfo`);
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching support info:', error);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // ✅ Paginated rows
    const paginatedData = useMemo(() => {
        const start = page * rowsPerPage;
        return events.slice(start, start + rowsPerPage);
    }, [events, page, rowsPerPage]);

    // ✅ Handle Mark Complete
    const handleEdit = async (row) => {
        try {
            if (row?._id) {
                console.log('Marking complete for:', row._id);
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/updateAdmin`, {
                    params: {
                        userId: userDetail._id,
                        callId: row._id,
                    },
                });
                // Optionally re-fetch updated data:
                fetchItems();
            }
        } catch (error) {
            console.error('Error updating:', error);
        }
    };

    // ✅ Define columns
    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor((row) => row.timestamp, {
            id: 'timestamp',
            header: 'Timestamp',
            cell: (info) => {
                const value = info.getValue();
                return value ? new Date(value).toLocaleString() : 'N/A';
            },
        }),
        columnHelper.accessor('customerName', {
            header: 'Name',
        }),
        columnHelper.accessor('customerSurname', {
            header: 'Surname',
        }),
        columnHelper.accessor('customerNo', {
            header: 'Phone Number',
        }),
        columnHelper.accessor('callSummary', {
            header: 'Call Summary',
            cell: (info) => {
                const summary = info.getValue();
                return Array.isArray(summary) && summary.length > 0 ? (
                    <div style={{ whiteSpace: 'pre-line' }}>
                        {summary.map((item, idx) => {
                            if (typeof item === 'object') {
                                return (
                                    <div key={idx}>
                                        {`${idx + 1}) ${item.question || ''}: `}
                                        <span style={{ color: 'red', fontWeight: 'bold' }}>
                                            {item.answer || ''}
                                        </span>
                                    </div>
                                );
                            } else {
                                // fallback for plain strings
                                return (
                                    <div key={idx}>
                                        {`${idx + 1}) `}
                                        <span style={{ color: 'red', fontWeight: 'bold' }}>{item}</span>
                                    </div>
                                );
                            }
                        })}
                    </div>
                ) : (
                    'No summary'
                );
            },
        }),
        {
            id: 'audio',
            header: 'Audio',
            accessorKey: 'recordUrl',
            cell: (info) =>
                info.getValue() ? (
                    <audio controls style={{ width: 200 }}>
                        <source src={`http://localhost:8800${info.getValue()}`} type="audio/wav" />
                        Your browser does not support the audio element.
                    </audio>
                ) : (
                    'No recording'
                ),
        }
    ];

    // ✅ Initialize table
    const table = useReactTable({
        data: paginatedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: Math.ceil(events.length / rowsPerPage),
    });

    const handleExportToHubSpot = async () => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/backend/adminAi/exportToHubSpot`,
                {
                    rows: paginatedData, // pass rows to backend
                    exportedBy: `${userDetail._id}}`,
                }
            );

            alert(res.data.message || 'Export successful!');
            fetchItems(); // refresh updated data
        } catch (err) {
            console.error(err);
            alert('Export failed.');
        }
    };

    /*const handleExportToHubSpot = async () => {
        const exportData = paginatedData;

        try {
            for (const row of exportData) {
                // 1️⃣ Prepare HubSpot payload
                const payload = {
                    properties: {
                        firstname: row.customerName || '',
                        lastname: row.customerSurname || '',
                        phone: row.customerNo || '',
                        // Add other properties as needed
                    },
                };

                // 2️⃣ Send to HubSpot
                const res = await axios.post(
                    'https://api.hubapi.com/crm/v3/objects/contacts',
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${HUBSPOT_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                console.log('Exported to HubSpot:', res.data);

                // 3️⃣ ✅ Mark isMoved true in your DB
                await axios.put(
                    `${import.meta.env.VITE_API_BASE_URL}/backend/adminAi/updateIsMoved`,
                    {
                        id: row._id,
                        isMoved: true,
                    }
                );
            }

            // 4️⃣ ✅ Update metadata for the UI
            setExportedWhen(new Date().toLocaleString());
            setExportedBy(`${userDetail.firstName} ${userDetail.lastName}`);
            fetchItems(); // refresh the table to see updated isMoved if needed
        } catch (error) {
            console.error('Error exporting to HubSpot:', error.response?.data || error);
            alert('Failed to export to HubSpot.');
        }
    };*/


    return (
        <Box p={3}>
            <Typography variant="h5" mb={2}>
                Lead Information
            </Typography>

            <Button
                variant="contained"
                color="primary"
                sx={{ mb: 2 }}
                onClick={handleExportToHubSpot}
            >
                Export to HubSpot
            </Button>



            <TableContainer component={Paper} sx={{ maxHeight: 800 }}>
                <Table stickyHeader>
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={events.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Box>
    );
};

export default LeadInfo;
