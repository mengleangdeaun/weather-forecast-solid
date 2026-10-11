# ការព្យាករណ៍អាកាសធាតុកម្ពុជា · Cambodia Weather Forecast (Solid.js)

A high-performance real-time weather forecasting and interactive geospatial application covering all 25 provinces and the capital city of Cambodia, built with **Solid.js**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **MapLibre GL**.

---

## ✨ Features

- **📍 All 25 Provinces & Capital Covered**:
  - Full dual-language support (Khmer & English) for province names, capitals, and administrative metadata.
  - Regional filtering: Central Plain (វាលរាបកណ្តាល), Tonle Sap (បឹងទន្លេសាប), Coastal (ឆ្នេរសមុទ្រ), and Plateau & Mountain (ខ្ពង់រាប និងភ្នំ).
  - Fast live search by Khmer name, English name, or provincial capital.

- **🗺️ Interactive MapLibre GL Geospatial Map**:
  - Crisp vector map rendered with Khmer script integration and local RTL/complex script handling.
  - Multiple map layer options: **Roadmap**, **Satellite**, and **Terrain**.
  - Dynamic interactive pins with temperature badges, active province highlight, and rich weather popups.
  - Smooth animated camera fly-to transitions when switching provinces.

- **🛰️ GPS Auto-Location Detection**:
  - One-tap geolocation finder using device GPS.
  - Automatically calculates distance and detects the nearest Cambodian province using the Haversine formula.

- **⛅ Real-Time Weather & Dynamic Atmosphere**:
  - Live temperature (°C), feels-like temperature, humidity percentage, wind speed (km/h), and condition text.
  - Dynamic ambient backgrounds that adapt to live atmospheric conditions: Sunny, Rainy, Thunderstorm, Cloudy, and Nighttime.

- **🌗 Instant Seamless Dark / Light Mode**:
  - Defaults to light mode for crisp readability.
  - Smooth, zero-flicker theme toggle powered by the synchronized `.theme-switching` freeze architecture (preventing component-by-component staggered color delays).

- **📱 Touch & Mobile Optimized**:
  - Built-in prevention of mobile screen auto-zooming on search input and selectors (`font-size: 16px` safeguard and `touch-action: manipulation`).
  - Custom glassmorphic CSS scrollbar with smooth momentum scrolling.

- **🔤 Local High-Fidelity Typography**:
  - Self-hosted woff2 web fonts: **Inter** (Latin) and **Inter Khmer Looped** (Khmer) ensuring zero external layout shifts and consistent cross-platform rendering.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Solid.js](https://www.solidjs.com/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Apple Glassmorphism System |
| **Map Engine** | [MapLibre GL](https://maplibre.org/) |
| **Icons** | [Lucide Solid](https://lucide.dev/) |
| **PWA & Offline** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox Caching & Web Manifest) |
| **API** | MEF Open Data Weather API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm / yarn

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or the assigned Vite port).

### Production Build
```bash
npm run build
```
The optimized bundle will be compiled into the `dist/` directory.

### Preview Build
```bash
npm run preview
```

---

## 📄 License

MIT License. Designed and built with ❤️ for Cambodia.
