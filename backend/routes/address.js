const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to the nepaladdress.json file
const nepalAddressPath = path.join(__dirname, '../../src/data/nepaladdress.json');

// Get all provinces
router.get('/provinces', (req, res) => {
  try {
    const nepalAddressData = JSON.parse(fs.readFileSync(nepalAddressPath, 'utf8'));
    res.json({ provinces: nepalAddressData.provinces });
  } catch (error) {
    console.error('Error reading provinces:', error);
    res.status(500).json({ message: 'Error fetching provinces', error: error.message });
  }
});

// Get districts by province ID
router.get('/districts/:provinceId', (req, res) => {
  try {
    const { provinceId } = req.params;
    const nepalAddressData = JSON.parse(fs.readFileSync(nepalAddressPath, 'utf8'));
    
    if (!nepalAddressData.districts[provinceId]) {
      return res.status(404).json({ message: 'Province not found' });
    }
    
    res.json({ districts: nepalAddressData.districts[provinceId] });
  } catch (error) {
    console.error('Error reading districts:', error);
    res.status(500).json({ message: 'Error fetching districts', error: error.message });
  }
});

// Get all districts
router.get('/districts', (req, res) => {
  try {
    const nepalAddressData = JSON.parse(fs.readFileSync(nepalAddressPath, 'utf8'));
    res.json({ districts: nepalAddressData.districts });
  } catch (error) {
    console.error('Error reading all districts:', error);
    res.status(500).json({ message: 'Error fetching all districts', error: error.message });
  }
});

// Get products by province and district
router.get('/products/:provinceId/:districtId', async (req, res) => {
  try {
    const { provinceId, districtId } = req.params;
    const nepalAddressData = JSON.parse(fs.readFileSync(nepalAddressPath, 'utf8'));
    
    // Validate province exists
    const province = nepalAddressData.provinces.find(p => p.id === provinceId);
    if (!province) {
      return res.status(404).json({ message: 'Province not found' });
    }
    
    // Validate district exists in province
    const districts = nepalAddressData.districts[provinceId];
    const district = districts.find(d => d.id === districtId);
    if (!district) {
      return res.status(404).json({ message: 'District not found in this province' });
    }
    
    // Here you would query your database for products available in this province/district
    // For now, we'll return a placeholder response
    res.json({
      province: province.displayName,
      district: district.displayName,
      products: [] // This would be populated from your database
    });
  } catch (error) {
    console.error('Error fetching products by location:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

module.exports = router;