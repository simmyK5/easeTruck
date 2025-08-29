import React, { useEffect, useState, useCallback } from 'react';
import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import {
    Typography, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, TextField, Card, CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


const AllAds = ({ userEmail, userRole }) => {
    const [adData, setAdData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState("summary");
    const [groupBy, setGroupBy] = useState("adType");
    const [selectedGroup, setSelectedGroup] = useState("all");

    const [totalAmount, setTotalAmount] = useState("0-50000");

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

    const fetchAd = useCallback(async () => {
        try {
            console.log("standwa sami", userEmail)
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/allAd`, {
                params: {
                    userEmail,
                    userRole,
                    customStartDate,
                    customEndDate,
                    groupBy

                }
            });

            const data = response.data;
            if (data && typeof data === "object") {
                // Flatten all driver arrays into a single array
                const combinedData = Object.values(data).flat();
                setAdData(combinedData);
            } else {
                setAdData([]);
            }
        } catch (error) {
            console.error('Error fetching ad data:', error);
            setAdData([]);
        } finally {
            setLoading(false);
        }
    }, [userEmail, userRole, groupBy, customStartDate, customEndDate]);

    useEffect(() => {
        if (userEmail && userRole && groupBy && customStartDate && customEndDate) {
            fetchAd();
        }
    }, [userEmail, userRole, groupBy, customStartDate, customEndDate, fetchAd]);

    const filteredData = adData.filter(item => {
        console.log("see us", selectedGroup)
        console.log("tiye", item[groupBy])
        if (selectedGroup !== "all" && item[groupBy] !== selectedGroup) return false;
        const [minSpeed, maxSpeed] = totalAmount.split("-").map(Number);
        if (item.totalAmount < minSpeed || item.totalAmount > maxSpeed) return false;

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

    console.log("filtered data",adData)

    const uniqueGroups = ["all", ...new Set(adData.map(item => item.adType))];


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
                        <Bar dataKey="totalAmount" fill="#8884d8" />
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
                        <Area type="monotone" dataKey="totalAmount" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                );
            default:
            case "summary":
                return (
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Ads
                                </Typography>

                                {!adData ? (
                                    <CircularProgress />
                                ) : adData.length > 0 ? (
                                    <>
                                    <Typography variant="body1">
                                        <strong>Number of ads:</strong> {adData.length}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Total amount of ads:</strong> {adData[0].combineTotal}

                                    </Typography>
                                    </>
                                ) : (
                                    <Typography variant="body1" color="textSecondary">
                                        No ads data available.
                                    </Typography>
                                )}
                            </CardContent>

                        </Card>
                    </Grid>
                );
            case "accTable":
                return (
                    <Grid item xs={12} style={{ height: 500 }}>
                        <Typography variant="h6" gutterBottom>All Ads Records</Typography>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                        />
                    </Grid>
                );
            case "line":
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="acceleration" stroke="#8884d8" />
                        <Line type="monotone" dataKey="speed" stroke="#82ca9d" />
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "adData");

        // Trigger file download
        XLSX.writeFile(workbook, "acceleration_report.xlsx");
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        const headers = [["Title", "Description", "Ad Type", "Link", "Total Amount", "Active", "Start Date", "End Date"]];

        // Convert your data into rows for the table
        const data = filteredData.map(item => [
            item.title || "N/A",
            item.description ? `${item.description} ` : "N/A",
            item.adType ? `${item.adType} ` : "N/A",
            item.linkUrl ? `${item.linkUrl} ` : "N/A",
            item.totalAmount ? `${item.totalAmount} ` : "N/A",
            item.active ? `${item.active} ` : "N/A",
            new Date(item.startDate).toLocaleString(),
            new Date(item.endDate).toLocaleString()
        ]);

        // Create PDF table
        autoTable(doc, {
            head: headers,
            body: data,
            theme: "striped",
            headStyles: { fillColor: [22, 160, 133] }, // Optional: custom color
        });

        doc.save("acceleration_report.pdf");
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
        { field: 'title', headerName: 'Title', width: 180 },
        { field: 'description', headerName: 'Description', width: 130 },
        { field: 'adType', headerName: 'Ad Type', width: 130 },
        { field: 'linkUrl', headerName: 'Link', width: 130 },
        { field: 'totalAmount', headerName: 'Total Amount', width: 180 },
        { field: 'active', headerName: 'Active', width: 130 },
        { field: 'startDate', headerName: 'Start Date', width: 180 },
        { field: 'endDate', headerName: 'End Date', width: 180 },
    ];

    const rows = filteredData.map((item, index) => ({
        id: index + 1,
        ...item,
        timestamp: new Date(item.timestamp).toLocaleString(),
        startDate: new Date(item.startDate).toLocaleString(),
        endDate: new Date(item.endDate).toLocaleString(),
    }));

    if (loading) return <CircularProgress />;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h5">All Ad</Typography>
            </Grid>

            <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                    <InputLabel>Chart Type</InputLabel>
                    <Select value={chartType} onChange={e => setChartType(e.target.value)}>
                        <MenuItem value="line">Line</MenuItem>
                        <MenuItem value="bar">Bar</MenuItem>
                        <MenuItem value="area">Area</MenuItem>
                        <MenuItem value="summary">Summary</MenuItem>
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
                    label="Total Range (e.g. 0-100000)"
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
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

export default AllAds;



/*import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, CircularProgress, Typography, Card, CardContent } from '@mui/material';

const AllAds = ({ userId, period }) => {
    const [adNumData, setAdNumData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch ad data based on userId and period
    const fetchAdNum =  useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/allAd`, {
                params: { userId, period }
            });
            setAdNumData(response.data);
        } catch (error) {
            console.error('Error fetching ad data:', error);
            setAdNumData(null);
        } finally {
            setLoading(false);
        }
    },[userId, period]);

    useEffect(() => {
        if (userId && period) {
            fetchAdNum();
        }
    }, [userId, period,fetchAdNum]);

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>
                            Number of ads
                            </Typography>
                            {adNumData ? (
                                adNumData.adCount !== undefined ? (
                                    <Typography variant="body1">
                                        <strong>Number of ads:</strong> {adNumData.adCount}
                                    </Typography>
                                ) : (
                                    <Typography variant="body1" color="textSecondary">
                                        No ad data available
                                    </Typography>
                                )
                            ) : (
                                <Typography variant="body1" color="textSecondary">
                                    No ad data available
                                </Typography>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );
};

export default AllAds;
*/