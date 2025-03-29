import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardContent } from '@mui/material';

const VoucherGraph = ({ userId, period }) => {
    const [voucherData, setVoucherData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchVoucher = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/voucher`, {
                params: {
                    userId: userId,
                    period: period
                }
            });
            setVoucherData(response.data);
        } catch (error) {
            console.error('Error fetching turning data:', error);
        }
    }, [userId, period]);

    useEffect(() => {
        if (userId && period) {
            console.log(userId)
            console.log(period)
            fetchVoucher();
        }
    }, [userId, period,fetchVoucher]);


    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {voucherData ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Voucher
                            </Typography>
                            {Array.isArray(voucherData) ? (
                                voucherData.length > 0 ? (
                                    <>
                                        <Typography variant="body1">
                                            <strong>Number of vocuhers</strong> {voucherData.length}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography variant="body1" color="textSecondary">
                                        No service data available
                                    </Typography>
                                )
                            ) : (
                                <>
                                    <Typography variant="body1">
                                        <strong>Number of Data Points:</strong> {voucherData.length}
                                    </Typography>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                        <Typography variant="h6" gutterBottom>
                            Voucher Data
                          </Typography>
                        <Typography variant="h8" gutterBottom>
                          No data available
                        </Typography>
                        </>
                    )}

                </CardContent>
            </Card>
        </Grid>
    );
};

export default VoucherGraph;
