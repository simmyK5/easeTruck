import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminHighSpeed = ({ userId, period }) => {
  const [accelerationData, setAccelerationData] = useState(null);

  // Fetch acceleration data based on userId and period
  const fetchAcceleration = useCallback(async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/acceleration`, {
            params: {
                userId: userId,
                period: period
            }
        });

        // Check if the response data is not empty or null
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            setAccelerationData(response.data);
        } else {
            console.warn('No acceleration data found.');
            setAccelerationData([]); // Optionally set to an empty array or a default value
        }
    } catch (error) {
        console.error('Error fetching acceleration data:', error);
        setAccelerationData([]); // Optionally set to an empty array or a default value in case of error
    }
}, [userId, period]);


  useEffect(() => {
    if (userId && period) {
        console.log(userId)
        console.log(period)
      fetchAcceleration();
    }
  }, [userId, period,fetchAcceleration]);

  // Count the items in the data
  const countItems = (data) => {
    return Array.isArray(data) ? data.length : 0;
  };

  return (
    <Grid item xs={12} sm={6} md={12} style={{ height: 300 }}>
      {accelerationData ? (
        <>
          <Typography variant="h6" gutterBottom>
            Acceleration Data - Number of Data Points: {countItems(accelerationData)}
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={accelerationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="speed" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="steeringAngle" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
        <Typography variant="h6" gutterBottom>
            Acceleration Data
          </Typography>
        <Typography variant="h8" gutterBottom>
          No data available
        </Typography>
        </>
        
      )}
    </Grid>
  );
};

export default AdminHighSpeed;


/*import React, { useEffect, useState, useMemo } from 'react';
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
} from '@mui/material';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { getAdminHighSpeed } from '../services/socketService';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const ITEMS_PER_PAGE = 10;

const AdminHighSpeed = () => {
  const { user } = useAuth0();
  const [userDetail, setUserDetails] = useState({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    userRole: '',
    isLive: '',
  });

  const [tab, setTab] = useState(0);
  const [highSpeed, setHighSpeed] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    if (user?.email) {
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

  useEffect(() => {
    if (userDetail._id) {
      getAdminHighSpeed(userDetail.userRole, userDetail._id, (data) => {
        setHighSpeed(data);
      });
    }
  }, [userDetail._id, userDetail.userRole]);

  const columns = useMemo(() => [
    {
      header: 'Time stamp',
      accessorKey: 'timestamp',
      cell: (info) => {
        const date = new Date(info.getValue());
        return date.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
      },
    },
    {
      header: 'Driver',
      cell: (info) => {
        const driver = info.row.original.driverId;
        return driver ? `${driver.firstName} ${driver.lastName}` : 'N/A';
      },
    },
    { header: 'Speed', accessorKey: 'speed' },
    { header: 'Speed Limit', accessorKey: 'speedLimit' },
    { header: 'Street', accessorKey: 'street' },
    {
      header: 'Truck Location',
      cell: (info) => {
        console.log(info)
        const loc = info.row.original.truckLocation;
        console.log(loc)
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
  ], []);

  const table = useReactTable({
    data: highSpeed,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const allRows = table.getRowModel().rows;
  const paginatedRows = allRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box display="flex" p={3} gap={4}>
      <Box sx={{ flexGrow: 1 }}>
        <TableContainer
          component={Paper}
          sx={{ maxHeight: 800, overflowY: 'auto' }}
        >
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
              {paginatedRows.map((row) => (
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
          count={allRows.length}
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
    </Box>
  );
};

export default AdminHighSpeed;
*/