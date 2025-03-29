import React  from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import {
    TextField,
    Button,
    FormGroup,
    Typography,
    Box, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import Rating from '@mui/material/Rating';
import { useForm, Controller } from 'react-hook-form';


const Feedback = ({ userEmail }) => {
    const { getIdTokenClaims } = useAuth0();
    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors },
        reset
    } = useForm();

    const watchSubject = watch('subject');

    const handleOnSubmit = async (data) => {
        try {
            const token = await getIdTokenClaims();
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/feedback/`, data, {
                headers: {
                    Authorization: `Bearer ${token.__raw}`,
                },
            });
            reset();  // This will reset the form
            // Handle response and possibly open subscription modal
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('An error occurred while submitting your feedback.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(handleOnSubmit)}>
                <FormGroup>
                    <TextField
                        label="Full Name"
                        name="fullname"
                        margin="normal"
                        variant="outlined"
                        data-testid="fullname"
                        {...register('fullname', { required: 'Full Name is required' })}
                        error={!!errors.fullname}
                        helperText={errors.fullname?.message}
                    />

                    <TextField
                        label="Email"
                        type="email"
                        name="email"
                        margin="normal"
                        variant="outlined"
                        data-testid="email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Invalid email address'
                            }
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="subject-label">Subject</InputLabel>
                        <Controller
                            name="subject"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <Select
                                    labelId="subject-label"
                                    id="subject"
                                    label="Subject"
                                    data-testid="subject"
                                    {...field}
                                    error={!!errors.subject}
                                >
                                    <MenuItem value="Compliment" data-testid="compliment">
                                        Compliment
                                    </MenuItem>
                                    <MenuItem value="Complaint" data-testid="complaint">
                                        Complaint
                                    </MenuItem>
                                    <MenuItem value="Enquiry" data-testid="enquiry">
                                        Enquiry
                                    </MenuItem>
                                </Select>
                            )}
                            rules={{ required: 'Subject is required' }}
                        />
                        {errors.subject && (
                            <Typography variant="body2" color="error">
                                {errors.subject.message}
                            </Typography>
                        )}
                    </FormControl>
                    <TextField
                        label="Description"
                        name="description"
                        margin="normal"
                        variant="outlined"
                        multiline // Enables multiline input
                        rows={4} // Sets the number of visible rows
                        data-testid="description"
                        {...register('description', { required: 'Description is required' })}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                    />

                    {watchSubject === 'Complaint' && (
                        <>
                            <Typography variant="h4" gutterBottom>
                                Rate Your Experience
                            </Typography>
                            <Box mb={3}>
                                <Typography component="legend">Overall Experience:</Typography>
                                <Controller
                                    name="overallExperience"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field }) => (
                                        <Rating
                                            {...field}
                                            onChange={(event, newValue) => field.onChange(newValue)}
                                            data-testid="overallExperience"
                                        />
                                    )}
                                />
                                <TextField
                                    label="How can we improve"
                                    name="overallExperienceInfo"
                                    margin="normal"
                                    variant="outlined"
                                    data-testid="overallExperienceInfo"
                                    {...register('overallExperienceInfo')}
                                />
                            </Box>
                            <Box mb={3}>
                                <Typography component="legend">Usability:</Typography>
                                <Controller
                                    name="usability"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field }) => (
                                        <Rating
                                            {...field}
                                            onChange={(event, newValue) => field.onChange(newValue)}
                                            data-testid="usability"
                                        />
                                    )}
                                />
                                <TextField
                                    label="How can we improve"
                                    name="usabilityInfo"
                                    margin="normal"
                                    variant="outlined"
                                    data-testid="usabilityInfo"
                                    {...register('usabilityInfo')}
                                />
                            </Box>
                            <Box mb={3}>
                                <Typography component="legend">Performance:</Typography>
                                <Controller
                                    name="performance"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field }) => (
                                        <Rating
                                            {...field}
                                            onChange={(event, newValue) => field.onChange(newValue)}
                                            data-testid="performance"
                                        />
                                    )}
                                />
                                <TextField
                                    label="How can we improve"
                                    name="performanceInfo"
                                    margin="normal"
                                    variant="outlined"
                                    data-testid="performanceInfo"
                                    {...register('performanceInfo')}
                                />
                            </Box>
                            <Box mb={3}>
                                <Typography component="legend">Design:</Typography>
                                <Controller
                                    name="design"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field }) => (
                                        <Rating
                                            {...field}
                                            onChange={(event, newValue) => field.onChange(newValue)}
                                            data-testid="design"
                                        />
                                    )}
                                />
                                <TextField
                                    label="How can we improve"
                                    name="designInfo"
                                    margin="normal"
                                    variant="outlined"
                                    data-testid="designInfo"
                                    {...register('designInfo')}
                                />
                            </Box>
                            <Box mb={3}>
                                <Typography component="legend">Features:</Typography>
                                <Controller
                                    name="features"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field }) => (
                                        <Rating
                                            {...field}
                                            onChange={(event, newValue) => field.onChange(newValue)}
                                            data-testid="features"
                                        />
                                    )}
                                />
                                <TextField
                                    label="How can we improve"
                                    name="featuresInfo"
                                    margin="normal"
                                    variant="outlined"
                                    data-testid="featuresInfo"
                                    {...register('featuresInfo')}
                                />
                            </Box>
                            <Box mb={3}>
                                <Typography component="legend">Support:</Typography>
                                <Controller
                                    name="support"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field }) => (
                                        <Rating
                                            {...field}
                                            onChange={(event, newValue) => field.onChange(newValue)}
                                            data-testid="support"
                                        />
                                    )}
                                />
                                <TextField
                                    label="How can we improve"
                                    name="supportInfo"
                                    margin="normal"
                                    variant="outlined"
                                    data-testid="supportInfo"
                                    {...register('supportInfo')}
                                />
                            </Box>
                        </>
                    )}
                    <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px' }} data-testid="submitBtn">
                        Submit Feedback
                    </Button>
                </FormGroup>
            </form>
        </div>
    );
}

export default Feedback