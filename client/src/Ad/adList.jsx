import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    TextField,
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Button,
    Menu,
    MenuItem,
    Checkbox,
    ListItemText,
} from "@mui/material";
import "./adList.css";

const MAX_ROWS_PER_CATEGORY = 5;
const ROW_INCREMENT = 2;


const ItemList = ({ navigateToCategory }) => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [rowsToShow, setRowsToShow] = useState({});
    const [viewingCategory, setViewingCategory] = useState(null);

    const categories = ["Transportation Opportunity", "Logistic Event", "Truck", "Head", "Tailor"];

    useEffect(() => {
        const fetchItems = async () => {
            const currentDate = new Date().toISOString().split("T")[0];
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/ad/ads`, {
                    params: { currentDate }
                });
                setItems(response.data);
                setFilteredItems(response.data);

                // Initialize rowsToShow for each category
                const initialRowsToShow = {};
                categories.forEach((category) => {
                    initialRowsToShow[category] = ROW_INCREMENT;
                });
                setRowsToShow(initialRowsToShow);
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        };
        fetchItems();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCategoryToggle = (category) => {
        const currentIndex = selectedCategories.indexOf(category);
        const newSelectedCategories = [...selectedCategories];

        if (currentIndex === -1) {
            newSelectedCategories.push(category);
        } else {
            newSelectedCategories.splice(currentIndex, 1);
        }

        setSelectedCategories(newSelectedCategories);
    };

    const handleSeeMore = (category) => {
        setRowsToShow((prevRows) => ({
            ...prevRows,
            [category]: Math.min(prevRows[category] + ROW_INCREMENT, MAX_ROWS_PER_CATEGORY),
        }));
    };

    const handleViewAll = (category) => {
        setViewingCategory(category); 
    };

    useEffect(() => {
        let filtered = items;

        if (selectedCategories.length > 0) {
            filtered = filtered.filter((item) => selectedCategories.includes(item.adType));
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredItems(filtered);
    }, [searchQuery, selectedCategories, items]);

    console.log("see filtered items", filteredItems)
    //console.log("record me",`${import.meta.env.VITE_API_BASE_URL}${item.imagePath}`)

    return (
        <Box className="container">
            {/* Search and Dropdown */}
            <Box className="search-bar">
                <TextField
                    label="Search Items"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={handleSearchChange}
                    
                />

                <Button
                    variant="contained"
                    onClick={handleCategoryClick}
                   
                >
                    {selectedCategories.length > 0
                        ? `Selected (${selectedCategories.length})`
                        : "Select Categories"}
                </Button>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                >
                    {categories.map((category, index) => (
                        <MenuItem
                            key={index}
                            onClick={() => handleCategoryToggle(category)}
                            dense
                        >
                            <Checkbox
                                checked={selectedCategories.includes(category)}
                                color="primary"
                            />
                            <ListItemText primary={category} />
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            {/* Grouped Items */}
            {/* Grouped Items */}
            {categories
                .filter(category =>
                    viewingCategory ? category === viewingCategory :
                        selectedCategories.length === 0 || selectedCategories.includes(category)
                ) // Show only the viewing category OR selected categories
                .map((category) => {
                    const categoryItems = filteredItems.filter((item) => item.adType === category);

                    return (
                        <Box key={category} className="category-section">
                            <Typography variant="h5" className="category-title">
                                {category}
                            </Typography>
                            <Box className="category-items">
                                {categoryItems.map((item) => ( // Show all items when viewing a category
                                    <Card key={item._id} className="card">
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            src={`${import.meta.env.VITE_API_BASE_URL}${item.imagePath}`} 

                                            alt={item.title}
                                        />
                                        <CardContent>
                                            <Typography variant="h6" noWrap>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {item.content}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                            <Box className="category-buttons">
                                {viewingCategory ? (
                                    <Button variant="text" onClick={() => setViewingCategory(null)}>
                                        Back to All Categories
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="text" onClick={() => handleSeeMore(category)}>
                                            See More
                                        </Button>
                                        <Button variant="text" onClick={() => handleViewAll(category)}>
                                            View All
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                    );
                })}


        </Box>
    );
};

export default ItemList;
