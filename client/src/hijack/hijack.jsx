import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  getPuncher,
  getPeople,
  getGlassBreak,
  getWeapon,
  adminNotification,
} from '../services/socketService';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const columnHelper = createColumnHelper();

const Hijack = () => {
  const { user } = useAuth0();
  const [userDetail, setUserDetails] = useState({});
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch user details
  useEffect(() => {
    if (user?.email) {
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${user.email}`)
        .then((res) => setUserDetails(res.data))
        .catch((err) => console.error('Error fetching user details:', err));
    }
  }, [user]);

  // Real-time event fetching and live updates with notification handling
  useEffect(() => {
    if (!userDetail._id) return;

    const handleSocket = (fn, label) =>
      fn(userDetail.userRole, userDetail._id, (data) => {
        const updated = data.map((item) => ({ ...item, type: label }));
        setEvents((prev) => {
          // Remove old events of this type, add updated ones on top
          const filtered = prev.filter((e) => e.type !== label);
          return [...updated, ...filtered];
        });
      });

    // Initial fetch of all event types
    handleSocket(getPuncher, 'Puncher');
    handleSocket(getGlassBreak, 'Glass Break');
    handleSocket(getPeople, 'People');
    handleSocket(getWeapon, 'Weapon');

    // Subscribe to real-time admin notifications for live updates
    adminNotification(userDetail.userRole, ({ title }) => {
      switch (title) {
        case 'Puncher Detected':
          handleSocket(getPuncher, 'Puncher');
          break;
        case 'Glass Break Detected':
          handleSocket(getGlassBreak, 'Glass Break');
          break;
        case 'People Detected':
          handleSocket(getPeople, 'People');
          break;
        case 'Weapon Detected':
          handleSocket(getWeapon, 'Weapon');
          break;
        default:
          break;
      }
    });

    // Cleanup on unmount if needed
    return () => {
      // If your socket service supports off/unsubscribe for adminNotification, do it here
      // e.g. adminNotificationOff()
    };
  }, [userDetail]);

  // Define table columns
  const columns = [
    columnHelper.accessor((row) => row.timestamp || row.createdAt, {
      id: 'timestamp',
      header: 'Timestamp',
      cell: (info) => {
        const value = info.getValue();
        return value ? new Date(value).toLocaleString() : 'N/A';
      },
    }),
    columnHelper.accessor((row) => {
      const d = row.driver;
      return d ? `${d.firstName || ''} ${d.lastName || ''}`.trim() : 'N/A';
    }, {
      id: 'driver',
      header: 'Driver',
    }),
    {
      id: 'truckLocation',
      header: 'Truck Location',
      cell: (info) => {
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
    {
      id: 'audio',
      header: 'Audio',
      accessorKey: 'recordUrl',
      cell: (info) =>
        info.getValue() ? (
          <audio controls crossOrigin="anonymous" style={{ width: 200 }}>
            <source src={`http://localhost:8800/uploadFile${info.getValue()}`} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        ) : (
          'No recording'
        ),
    },
    columnHelper.accessor('make', { header: 'Make' }),
    columnHelper.accessor('model', { header: 'Model' }),
    columnHelper.accessor('year', { header: 'Year' }),
    columnHelper.accessor('numberPlate', { header: 'Number Plate' }),
    columnHelper.accessor('type', { header: 'Event Type' }),
  ];

  // Initialize react-table instance
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
            {table.getRowModel().rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
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

export default Hijack;
