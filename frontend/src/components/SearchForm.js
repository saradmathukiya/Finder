import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";

const SearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    city: "",
    category: "",
    area: "",
  });

  const cityAreas = {
    Surat: [
      "Adajan",
      "Athwa",
      "Vesu",
      "Katargam",
      "Piplod",
      "Pal",
      "Althan",
      "Varachha",
      "Sarthana",
      "Mota Varachha",
    ],
    Vadodara: [
      "Alkapuri",
      "Gotri",
      "Fatehgunj",
      "Akota",
      "Manjalpur",
      "Tandalja",
      "Waghodia Road",
      "Subhanpura",
      "Karelibaug",
      "Harni",
    ],
    Ahmedabad: [
      "Satellite",
      "Vastrapur",
      "Navrangpura",
      "Paldi",
      "Bopal",
      "Ghatlodia",
      "Thaltej",
      "Bodakdev",
      "Sola",
      "S.G. Highway",
    ],
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset area when city changes
      ...(name === "city" && { area: "" }),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.city || !formData.category || !formData.area) {
      alert("Please fill in all fields");
      return;
    }
    onSearch(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: "center",
        }}
      >
        <FormControl fullWidth>
          <InputLabel>City</InputLabel>
          <Select
            name="city"
            value={formData.city}
            onChange={handleChange}
            label="City"
          >
            <MenuItem value="Surat">Surat</MenuItem>
            <MenuItem value="Vadodara">Vadodara</MenuItem>
            <MenuItem value="Ahmedabad">Ahmedabad</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            label="Category"
          >
            <MenuItem value="cafe">Cafe</MenuItem>
            <MenuItem value="school">School</MenuItem>
            <MenuItem value="restaurant">Restaurant</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Area</InputLabel>
          <Select
            name="area"
            value={formData.area}
            onChange={handleChange}
            label="Area"
            disabled={!formData.city}
          >
            {formData.city &&
              cityAreas[formData.city].map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ minWidth: { xs: "100%", sm: "200px" } }}
        >
          Search
        </Button>
      </Box>
    </Paper>
  );
};

export default SearchForm;
