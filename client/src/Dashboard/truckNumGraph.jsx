import React, { useEffect, useState, useCallback } from 'react';
import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import {
    Typography, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Card, CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


const TruckNumGraph = ({ userId, userRole }) => {
    const [truckData, setTruckData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState("summary");
    // Update customStartDate and customEndDate when dateRange change

    const fetchTruckNum = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/trucks`, {
                params: {
                    userId,
                    userRole
                }
            });

            const data = response.data;
            if (data && typeof data === "object") {
                // Flatten all driver arrays into a single array
                const combinedData = Object.values(data).flat();
                setTruckData(combinedData);
            } else {
                setTruckData([]);
            }
        } catch (error) {
            console.error('Error fetching truck data:', error);
            setTruckData([]);
        } finally {
            setLoading(false);
        }
    }, [userId, userRole]);

    useEffect(() => {
        if (userId && userRole) {
            fetchTruckNum();
        }
    }, [userId, userRole,fetchTruckNum]);

    console.log("accc", truckData)

    const renderChart = () => {
        switch (chartType) {
            case "accTable":
                return (
                    <Grid item xs={12} style={{ height: 500 }}>
                        <Typography variant="h6" gutterBottom>All truck Records</Typography>
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
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Trucks
                                </Typography>

                                {!truckData ? (
                                    <CircularProgress />
                                ) : truckData.length > 0 ? (
                                    <Typography variant="body1">
                                        <strong>Number of trucks:</strong> {truckData.length}
                                    </Typography>
                                ) : (
                                    <Typography variant="body1" color="textSecondary">
                                        No truck data available.
                                    </Typography>
                                )}
                            </CardContent>

                        </Card>
                    </Grid>
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
        downloadFile(csvContent, "truckReport.csv", "text/csv");
    };

    const downloadExcel = (data) => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "truckData");

        // Trigger file download
        XLSX.writeFile(workbook, "truck_report.xlsx");
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        const headers = [["Make", "Model", "Year", "Number Plate", "Full Name", "Timestamp"]];

        // Convert your data into rows for the table
        const data = filteredData.map(item => [
            item.make ? `${item.make}` : "N/A",
            item.model ? `${item.model} ` : "N/A",
            item.year ? `${item.year} ` : "N/A",
            item.numberPlate ? `${item.numberPlate} ` : "N/A",
            item.fullName ? `${item.fullName} ` : "N/A",
            new Date(item.timestamp).toLocaleString()
        ]);

        // Create PDF table
        autoTable(doc, {
            head: headers,
            body: data,
            theme: "striped",
            headStyles: { fillColor: [22, 160, 133] }, // Optional: custom color
        });

        doc.save("truck_report.pdf");
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
        { field: 'make', headerName: 'Make', width: 180 },
        { field: 'model', headerName: 'Model', width: 130 },
        { field: 'year', headerName: 'year', width: 130 },
        { field: 'numberPlate', headerName: 'Number Plate', width: 130 },
        { field: 'fullName', headerName: 'Full Name', width: 180 }
    ];

    const rows = truckData.map((item, index) => ({
        id: index + 1,
        ...item,
        timestamp: new Date(item.timestamp).toLocaleString()
    }));

    if (loading) return <CircularProgress />;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h5">Truck Dashboard</Typography>
            </Grid>

            <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                    <InputLabel>Chart Type</InputLabel>
                    <Select value={chartType} onChange={e => setChartType(e.target.value)}>
                        <MenuItem value="summary">Summary</MenuItem>
                        <MenuItem value="accTable">Table</MenuItem>
                    </Select>
                </FormControl>
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

export default TruckNumGraph;