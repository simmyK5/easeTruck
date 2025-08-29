import React, { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import {
  Typography, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


const LoadNumGraph = ({ userId, userRole }) => {
  const [loadData, setLoadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line");
  const [groupBy, setGroupBy] = useState("fullName");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [loadRange, setLoadRange] = useState("0-60000");
  const [offLoadRange, setOffLoadRange] = useState("0-60000");

  const today = new Date().toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState(`${today} to ${today}`);
  const [customStartDate, setCustomStartDate] = useState(today);
  const [customEndDate, setCustomEndDate] = useState(today);

  // Update customStartDate and customEndDate when dateRange changes
  useEffect(() => {
    const [startDateStr, endDateStr] = dateRange.split("to").map(s => s.trim());
    if (startDateStr && endDateStr) {
      setCustomStartDate(startDateStr);
      setCustomEndDate(endDateStr);
    }
  }, [dateRange]);

  const fetchLoadData = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/load`, {
        params: {
          userId,
          userRole,
          groupBy,
          customStartDate,
          customEndDate
        }
      });



      const data = response.data;
      if (data && typeof data === "object") {
        // Flatten all driver arrays into a single array
        const combinedData = Object.values(data).flat();
        console.log("it's fine", combinedData)
        const dataWithDifference = combinedData.map(user => ({
          ...user,
          difference: user.onload - user.offload,
        }));

        /*const dataWithDifference = combinedData.map(user => ({
        ...user,
        tasks: user.tasks.map(task => ({
          ...task,
          difference: task.onload - task.offload,
        })),
      }));*/

        console.log(dataWithDifference);
        setLoadData(dataWithDifference);

        return dataWithDifference;
      } else {
        setLoadData([]);
      }
    } catch (error) {
      console.error('Error fetching load data:', error);
      setLoadData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole, groupBy, customStartDate, customEndDate]);

  useEffect(() => {
    if (userId && userRole && groupBy && customStartDate && customEndDate) {
      fetchLoadData();
    }
  }, [userId, userRole, groupBy, customStartDate, customEndDate, fetchLoadData]);

  const filteredData = loadData.filter(item => {
    console.log("see us", selectedGroup)
    console.log("tiye", item[groupBy])
    if (selectedGroup !== "all" && item[groupBy] !== selectedGroup) return false;
    const [minSpeed, maxSpeed] = loadRange.split("-").map(Number);
    if (item.onload < minSpeed || item.onload > maxSpeed) return false;
    const [minAccel, maxAccel] = offLoadRange.split("-").map(Number);
    if (item.offload < minAccel || item.offload > maxAccel) return false;

    if (customStartDate && customEndDate) {
      console.log("yours me")
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      const itemDate = new Date(item.timestamp);
      if (itemDate < startDate || itemDate > endDate) return false;
    }

    return true;
  });



  loadData.forEach(item => {
    item.fullName = `${item.firstName} ${item.lastName}`;
  });


  const uniqueGroups = ["all", ...new Set(loadData.map(item => item.fullName))];


  console.log("accc", loadData)
  /*const uniqueGroups = ["all", ...new Set(loadData.map(item =>item[groupBy]))];
  const uniqueGroups = ["all", ...Object.keys(loadData)];*/


  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="onload" fill="#8884d8" />
            <Bar dataKey="offload" fill="#82ca9d" />
            <Bar dataKey="difference" fill="#ffc658" />
          </BarChart>
        );
      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="onload" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="offload" stroke="#82ca9d" fill="#82ca9d" />
            <Area type="monotone" dataKey="difference" stroke="#ffc658" fill="#ffc658" />

          </AreaChart>
        );
      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid />
            <XAxis dataKey="onload" name="Onload" />
            <YAxis dataKey="offload" name="Offload" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Onload vs Offload" data={filteredData} fill="#8884d8" />
          </ScatterChart>
        );
      case "accTable":
        return (
          <Grid item xs={12} style={{ height: 500 }}>
            <Typography variant="h6" gutterBottom>All Load Records</Typography>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </Grid>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="onload" stroke="#8884d8" />
            <Line type="monotone" dataKey="offload" stroke="#82ca9d" />
            <Line type="monotone" dataKey="difference" stroke="#ffc658" />
          </LineChart>
        );

    }
  };

  const handleDownload = (type) => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data to download.");
      return;
    }

    switch (type) {
      case "csv":
        downloadCSV(filteredData);
        break;
      case "json":
        downloadFile(JSON.stringify(filteredData, null, 2), "report.json", "application/json");
        break;
      case "xlsx":
        downloadExcel(filteredData);
        break;
      case "pdf":
        downloadPDF(filteredData);
        break;
      default:
        break;
    }
  };

  const downloadCSV = (data) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row =>
      Object.values(row).map(val =>
        `"${(val !== null && val !== undefined) ? String(val).replace(/"/g, '""') : ''}"`
      ).join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    downloadFile(csvContent, "report.csv", "text/csv");
  };

  const downloadExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "loadData");

    // Trigger file download
    XLSX.writeFile(workbook, "steeringAngle_report.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    const headers = [["Driver", "Speed (km/h)", "steeringAngle (m/s²)", "Latitude", "Longitude", "Timestamp"]];

    // Convert your data into rows for the table
    const data = filteredData.map(item => [
      item.driverId || "N/A",
      item.steeringAngle ? `${item.steeringAngle} m/s²` : "N/A",
      item.latitude ? `${item.latitude} ` : "N/A",
      item.longitude ? `${item.longitude} ` : "N/A",
      new Date(item.timestamp).toLocaleString()
    ]);

    // Create PDF table
    autoTable(doc, {
      head: headers,
      body: data,
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133] }, // Optional: custom color
    });

    doc.save("steeringAngle_report.pdf");
  }

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };



  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'timestamp', headerName: 'Timestamp', width: 180 },
    { field: 'fullName', headerName: 'fullName', width: 130 },
    { field: 'onload', headerName: 'Onload (kg)', width: 130 },
    { field: 'offload', headerName: 'Offload (kg)', width: 130 },
    { field: 'difference', headerName: 'difference (kg)', width: 180 }
  ];

  const rows = filteredData.map((item, index) => ({
    id: index + 1,
    ...item,
    timestamp: new Date(item.timestamp).toLocaleString()
  }));

  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5">Load Dashboard</Typography>
      </Grid>

      <Grid item xs={6} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Chart Type</InputLabel>
          <Select value={chartType} onChange={e => setChartType(e.target.value)}>
            <MenuItem value="line">Line</MenuItem>
            <MenuItem value="bar">Bar</MenuItem>
            <MenuItem value="area">Area</MenuItem>
            <MenuItem value="scatter">Scatter</MenuItem>
            <MenuItem value="accTable">Table</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Group</InputLabel>
          <Select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
            {uniqueGroups.map((g, i) => <MenuItem key={i} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6} md={3}>
        <TextField
          fullWidth size="small"
          label="Load Range (e.g. 0-60000)"
          value={loadRange}
          onChange={e => setLoadRange(e.target.value)}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <TextField
          fullWidth size="small"
          label="Offload Range (e.g. 0-60000)"
          value={offLoadRange}
          onChange={e => setOffLoadRange(e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth size="small"
          label="Date Range (YYYY-MM-DD to YYYY-MM-DD)"
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
        />
      </Grid>

      <Grid item xs={14} md={6}>
        <FormControl style={{ minWidth: 160, marginBottom: 16 }}>
          <InputLabel>Download Report</InputLabel>
          <Select
            onChange={(e) => handleDownload(e.target.value)}
            defaultValue=""
          >
            <MenuItem value="csv">Download as CSV</MenuItem>
            <MenuItem value="json">Download as JSON</MenuItem>
            <MenuItem value="xlsx">Download as Excel</MenuItem>
            <MenuItem value="pdf">Download as PDF</MenuItem>
          </Select>
        </FormControl>

      </Grid>




      <Grid item xs={12} style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </Grid>


    </Grid>
  );
};

export default LoadNumGraph;

/*import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LoadNumGraph = ({ userId, period, userRole }) => {
  const [loadData, setLoadData] = useState(null);

  // Fetch acceleration data based on userId and period
  const fetchLoadData = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/load`, {
        params: {
          userId: userId,
          period: period,
          userRole: userRole
        },
      });

      // Transform the data to calculate the difference and keep the user structure
      const dataWithDifference = response.data.map(user => ({
        ...user,
        tasks: user.tasks.map(task => ({
          ...task,
          difference: task.onload - task.offload,
        })),
      }));

      console.log(dataWithDifference);
      setLoadData(dataWithDifference);

      return dataWithDifference;
    } catch (error) {
      console.error('Error fetching drive data:', error);
      return [];
    }
  }, [userId, period]);

  useEffect(() => {
    if (userId && period) {
      console.log(userId)
      console.log(period)
      fetchLoadData();
    }
  }, [userId, period, fetchLoadData]);


  const flattenTasks = loadData ? loadData.flatMap(user => user.tasks) : [];
  if (flattenTasks) {
    console.log(flattenTasks)
  }

  // Count the items in the data
  const countItems = (data) => {
    return Array.isArray(data) ? data.length : 0;
  };



  return (
    <Grid item xs={12} sm={6} md={12} style={{ height: 300 }}> 
      {flattenTasks ? (
        <>
          <Typography variant="h6" gutterBottom>
            Load Data - Number of Data Points: {countItems(flattenTasks)}
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flattenTasks} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="createdAt" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="onload" fill="#8884d8" />
              <Bar dataKey="offload" fill="#82ca9d" />
              <Bar dataKey="difference" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Fuel Data
          </Typography>
          <Typography variant="h8" gutterBottom>
            No data available
          </Typography>
        </>
      )}
    </Grid>



  );
};

export default LoadNumGraph;



*/