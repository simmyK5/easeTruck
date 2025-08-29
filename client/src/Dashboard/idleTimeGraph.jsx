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
import Map, { Marker, Popup } from 'react-map-gl';

const IdleTimeGraph = ({ userId, userRole }) => {
    const [idleTimeData, setIdleTimeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState("line");
    const [groupBy, setGroupBy] = useState("fullName");
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [idleTimeRange, setIdleTimeRange] = useState("0-1000");

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

    const fetchIdleTime = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/idleTime`, {
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
                setIdleTimeData(combinedData);
            } else {
                setIdleTimeData([]);
            }
        } catch (error) {
            console.error('Error fetching acceleration data:', error);
            setIdleTimeData([]);
        } finally {
            setLoading(false);
        }
    }, [userId, userRole, groupBy, customStartDate, customEndDate]);

    useEffect(() => {
        if (userId && userRole && groupBy && customStartDate && customEndDate) {
            fetchIdleTime();
        }
    }, [userId, userRole, groupBy, customStartDate, customEndDate, fetchIdleTime]);

    const filteredData = idleTimeData.filter(item => {
        if (selectedGroup !== "all" && item[groupBy] !== selectedGroup) return false;
        const [minAccel, maxAccel] = idleTimeRange.split("-").map(Number);
        if (item.idleTimeData < minAccel || item.idleTimeData > maxAccel) return false;

        if (customStartDate && customEndDate) {
            const startDate = new Date(customStartDate);
            const endDate = new Date(customEndDate);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            const itemDate = new Date(item.timestamp);
            if (itemDate < startDate || itemDate > endDate) return false;
        }

        return true;
    });



    idleTimeData.forEach(item => {
        item.fullName = `${item.firstName} ${item.lastName}`;
    });


    const uniqueGroups = ["all", ...new Set(idleTimeData.map(item => item.fullName))];


    console.log("accc", idleTimeData)


    const renderChart = () => {
        const commonProps = {
            data: filteredData,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };

        switch (chartType) {
            case "accTable":
                return (
                    <Grid item xs={12} style={{ height: 500 }}>
                        <Typography variant="h6" gutterBottom>All Idle Time Records</Typography>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                        />
                    </Grid>
                );
            case "geolocation":
                return (
                    <Map
                        mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                        initialViewState={{
                            latitude: -26.2041,
                            longitude: 28.0473,
                            zoom: 6,
                        }}
                        style={{ width: '100%' }}
                        mapStyle="mapbox://styles/mapbox/light-v10"
                    >
                        {filteredData.map((point, index) => (
                            <Marker
                                key={index}
                                latitude={point.latitude}
                                longitude={point.longitude}
                                onClick={() => setSelected?.(point)} // optional if setSelected exists
                            >
                                <div
                                    style={{
                                        backgroundColor: '#8884d8',
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                    }}
                                />
                            </Marker>
                        ))}
                    </Map>
                );
            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="idleTime" stroke="#8884d8" />
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "idleTimeData");

        // Trigger file download
        XLSX.writeFile(workbook, "idleTimeReport.xlsx");
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        const headers = [["Driver", "Speed (km/h)", "Idle Time (m/s²)", "Latitude", "Longitude", "Timestamp"]];

        // Convert your data into rows for the table
        const data = filteredData.map(item => [
            item.driverId || "N/A",
            item.idleTime ? `${item.idleTime} m/s²` : "N/A",
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

        doc.save("idleTimeReport.pdf");
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
        { field: 'latitude', headerName: 'Latitude', width: 130 },
        { field: 'longitude', headerName: 'Longitude', width: 130 },
        { field: 'idleTime ', headerName: 'idleTime s', width: 180 },
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
                <Typography variant="h5">Idle Time Dashboard</Typography>
            </Grid>

            <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                    <InputLabel>Chart Type</InputLabel>
                    <Select value={chartType} onChange={e => setChartType(e.target.value)}>
                        <MenuItem value="line">Line</MenuItem>
                        <MenuItem value="geolocation">geolocation</MenuItem>
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
                    label="Idle Time Range (e.g. 0-1000)"
                    value={idleTimeRange}
                    onChange={e => setIdleTimeRange(e.target.value)}
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

export default IdleTimeGraph;