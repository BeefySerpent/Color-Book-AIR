# Virtual Color Library for Pantone FHI, Coloro and H&M Color Master

## Visit
Visit: https://beefyserpent.github.io/Color-Book-AIR/

---

## Data Credit
This Library is a product of large scale data scraping using Python and Selenium.
- The Pantone TCX data were collected from **ColorBook** (https://www.colorbook.online/) and **Pantone Connect** (https://connect.pantone.com/).
- The Pantone TSX, TPM and TN data were collected from **Pantone Connect** (https://connect.pantone.com/).
- The Coloro Data were collected from **Coloro Workspace** (https://shop.coloro.com/eu/coloro-workspace).

**Python 3.14 and Selenium 4.44.0 was used for Data Scraping**

---

## Overview

This virtual library is a web-based tool designed to browse, explore, and analyze a structured color database built by gathering data from numerous sources. It contain around **10,500+** Color data of different identifying standard. It provides an interface similar to a spreadsheet application while enhancing usability for color reference, design exploration, and digital color matching.

- Pantone FHI (TCX): 2801 Individual Pantone TCX (Textile Cotton eXtended) Color Details.
- Pantone FHI (TSX): 203 Individual Pantone TSX (Textile Polyester eXtended) Color Details.
- Pantone FHI (TPM): 200 Individual Pantone TPM (Textile Paper Metallic) Color Details.
- Pantone FHI (TN): 21 Individual Pantone TN (Textile Nylon) Color Details.
- Coloro: 3500 Individual Coloro Color Details.
- H&M Color Master: 3859 Individual Color Details following H&M Group Color Coding System.

The application is built to make large-scale color systems easily searchable, filterable, and visually understandable without needing proprietary software or visiting multiple sources .

---

## Key Features

### Multi-Sheet Color Database
The tool loads the library segmented into multiple tabs, each representing different color systems and datasets:

- Pantone-based color collections (various Pantone formats)
- Coloro color system datasets
- Extended color attributes including digital and technical values

Users can switch between Tabs instantly.

---

### Simple Viewing Experience
The interface is simple focusing straight functionality:

- Row-by-row data viewing
- Column-based structure
- Scrollable large datasets (horizontal and vertical)
- Sticky headers for easy navigation

---

### Color System Information

#### Pantone Data
4 Pantone-related Tabs provide:
- Pantone color names
- Multiple Pantone formats (TCX, PMS, TPM, TN depending on dataset)
- Related or similar Pantone color references

This allows users to explore how a single color translates across different Pantone systems and variations.

---

#### Coloro Data
Coloro sheets provide:
- Coloro identifiers
- Associated mood descriptions
- Lab and sRGB values
- Similar Pantone color mappings for cross-referencing

This helps bridge modern digital color systems with traditional color libraries.

---

### Mood-Based Color Visualization
Entries include a "Mood" attribute represented visually as a color block instead of text.

- Each mood cell is displayed as a colored swatch
- The color is extracted directly from the original dataset
- Useful for quick emotional or thematic interpretation of colors

---

### Digital Color Values
Across sheets, users can access standardized digital color formats including:

- HEX values for web usage
- RGB values for screen display
- CMYK values for print workflows
- HSL and Lab values for advanced color manipulation

These values make the tool useful for designers.

---

### Interactive Filtering and Sorting

- Filtering to quickly narrow down results
- Sorting for organizing color data logically
- Fast searching across large datasets

This makes it easier to find specific colors, moods, or technical values within thousands of entries.

---

### Cross-Reference Links
Pantone TCXs include external reference links to ColorBook (https://www.colorbook.online/) developed by Pedro Duque and Karolina Konieczna:

- Color web references
- Pantone scan or lookup links
- 
These links allow users to explore official or extended color information directly from the dataset.

---

### File Download Feature
The application also provides a download option for the full ColorBook to be Downloaded as an Excel File.

- Maintains original structure and formatting
- Allows offline access to full dataset
- Useful for backup or external editing in Excel

---

## Data Structure

- Pantone TCX / PMS / TPM / TN systems
- Coloro color datasets
- Technical color attributes (HEX, RGB, CMYK, Lab, HSL)
- Cross-referenced similar colors
- Mood-based color classifications

Each sheet is automatically interpreted and rendered into a unified interface.

---
