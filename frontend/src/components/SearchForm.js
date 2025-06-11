import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const SearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    city: "",
    category: "",
    area: "",
  });

  const cityAreas = {
    Surat: [
      "Adajan",
      // "Athwa",
      // "Vesu",
      // "Katargam",
      // "Piplod",
      // "Pal",
      // "Althan",
      // "Varachha",
      // "Sarthana",
      "Mota Varachha",
    ],
    // Vadodara: [
    //   "Alkapuri",
    //   "Gotri",
    //   "Fatehgunj",
    //   "Akota",
    //   "Manjalpur",
    //   "Tandalja",
    //   "Waghodia Road",
    //   "Subhanpura",
    //   "Karelibaug",
    //   "Harni",
    // ],
    // Ahmedabad: [
    //   "Satellite",
    //   "Vastrapur",
    //   "Navrangpura",
    //   "Paldi",
    //   "Bopal",
    //   "Ghatlodia",
    //   "Thaltej",
    //   "Bodakdev",
    //   "Sola",
    //   "S.G. Highway",
    // ],
  };

  const handleChange = (name, value) => {
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
    <Card className="mb-8">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Select
                value={formData.city}
                onValueChange={(value) => handleChange("city", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Surat">Surat</SelectItem>
                  {/* <SelectItem value="Vadodara">Vadodara</SelectItem>
                  <SelectItem value="Ahmedabad">Ahmedabad</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Area</label>
              <Select
                value={formData.area}
                onValueChange={(value) => handleChange("area", value)}
                disabled={!formData.city}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an area" />
                </SelectTrigger>
                <SelectContent>
                  {formData.city &&
                    cityAreas[formData.city].map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full ">
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
