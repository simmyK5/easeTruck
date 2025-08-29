import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography
} from '@mui/material';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { getPuncher, getPeople, getGlassBreak, getWeapon } from '../services/socketService';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const HijackAdmin = () => {
  const { user } = useAuth0();
  const [userDetail, setUserDetails] = useState({ _id: '', firstName: '', lastName: '', email: '', userRole: '', isLive: '' });
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch user details
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

  // Fetch socket data
  useEffect(() => {
    if (!userDetail._id) return;

    const fetchData = async () => {
      try {
        const getData = (fn, label) =>
          new Promise((resolve) => {
            fn(userDetail.userRole, userDetail._id, (data) => {
              resolve(data.map((item) => ({ ...item, type: label })));
            });
          });

        const [punchers, glassBreaks, people, weapons] = await Promise.all([
          getData(getPuncher, 'Puncher'),
          getData(getGlassBreak, 'Glass Break'),
          getData(getPeople, 'People'),
          getData(getWeapon, 'Weapon'),
        ]);

        setEvents([...punchers, ...glassBreaks, ...people, ...weapons]);
      } catch (err) {
        console.error('Error fetching socket data:', err);
      }
    };

    fetchData();
  }, [userDetail]);

  // Paginated rows
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return events.slice(start, start + rowsPerPage);
  }, [events, page, rowsPerPage]);

  // Define columns
  const columnHelper = createColumnHelper();

  const columns = [

    // Timestamp column
    columnHelper.accessor(row => row.timestamp, {
      id: 'timestamp',
      header: 'Timestamp',
      cell: info => {
        const value = info.getValue();
        return value ? new Date(value).toLocaleString() : 'N/A';
      },
    }),

    // Driver name column
    columnHelper.accessor(row => row.driver?.firstName || row.driver?.lastName || 'N/A', {
      id: 'driver',
      header: 'Driver',
      cell: info => info.getValue(),
    }),

    // Truck location column with Google Maps link
    {
      id: 'truckLocation',
      header: 'Truck Location',
      cell: info => {
        const loc = info.row.original.truckLocation;
        if (loc?.coordinates?.length === 2) {
          const [lng, lat] = loc.coordinates;
          return (
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Map
            </a>
          );
        }
        return 'N/A';
      },
    },

    // Audio recording column
    {
      id: 'audio',
      header: 'Audio',
      accessorKey: 'recordUrl',
      cell: info =>
        info.getValue() ? (
          <audio controls style={{ width: 200 }}>
            <source src={`http://localhost:8800${info.getValue()}`} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        ) : (
          'No recording'
        ),
    },

    // Static info columns
    columnHelper.accessor('make', {
      header: 'Make',
    }),
    columnHelper.accessor('model', {
      header: 'Model',
    }),
    columnHelper.accessor('year', {
      header: 'Year',
    }),
    columnHelper.accessor('numberPlate', {
      header: 'Number Plate',
    }),
  ];

  // Initialize react-table
  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(events.length / rowsPerPage),
  });

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Real-Time Hijack Alerts
      </Typography>

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

export default HijackAdmin;


