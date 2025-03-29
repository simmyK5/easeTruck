import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const EmailDialog = ({ open, onClose, emailData, onChange, onSubmit }) => {
    console.log("we trying")
    console.log(emailData)
    console.log(onSubmit)
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Send Email</DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit} className="dialog-form">
                    <TextField
                        label="To"
                        name="to"
                        value={emailData.to}
                        onChange={onChange}
                        fullWidth
                        margin="normal"
                        required
                        data-testid="to"
                    />
                    <TextField
                        label="Subject"
                        name="subject"
                        value={emailData.subject}
                        onChange={onChange}
                        fullWidth
                        margin="normal"
                        required
                        data-testid="subject"
                    />
                    <TextField
                        label="Body"
                        name="body"
                        value={emailData.body}
                        onChange={onChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        required
                        data-testid="emailBody"
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" data-testid="cancelBtn">Cancel</Button>
                <Button onClick={onSubmit} color="primary" data-testid="submitBtn"> Send </Button>

            </DialogActions>
        </Dialog>
    );
};

export default EmailDialog;
