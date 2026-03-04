// import { useState, useEffect } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   BarChart as BC,
// } from "recharts";

import { BrowserRouter, Route, Router, Routes } from "react-router";
import Applayout from "./layout/AppLayout";
import { ThemeProvider } from "./context/themContext";

// // ─────────────────────────────────────────────────────────────────────────────
// //  TAILWIND CSS VARIABLE SYSTEM
// //  All colours are defined here and injected as CSS custom properties.
// //  Every class in the component references var(--tw-*) equivalents via
// //  arbitrary Tailwind values like `bg-[var(--c-bg)]`, `text-[var(--c-text)]`.
// // ─────────────────────────────────────────────────────────────────────────────
// const LIGHT = {
//   "--c-bg-app": "#f0eff4",
//   "--c-bg-shell": "#ffffff",
//   "--c-bg-sidebar": "#f9f9fb",
//   "--c-bg-card": "#ffffff",
//   "--c-bg-card2": "#f9f9fb",
//   "--c-bg-nav-active": "#f3f0ff",
//   "--c-bg-nav-hover": "#f5f5f8",
//   "--c-bg-input": "#f5f5f8",
//   "--c-bg-badge": "#f0edff",
//   "--c-border": "#ebebf0",
//   "--c-border-light": "#f2f2f5",
//   "--c-text-primary": "#0f0f14",
//   "--c-text-secondary": "#6b7280",
//   "--c-text-muted": "#9ca3af",
//   "--c-text-nav-active": "#7c3aed",
//   "--c-accent": "#7c3aed",
//   "--c-accent-light": "#ede9fe",
//   "--c-accent-btn": "#7c3aed",
//   "--c-green": "#10b981",
//   "--c-red": "#ef4444",
//   "--c-orange": "#f97316",
//   "--c-purple-bar": "#7c3aed",
//   "--c-bar-bg": "#ede9fe",
//   "--c-storage-fill": "#ef4444",
//   "--c-storage-bg": "#fee2e2",
//   "--c-shadow": "0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
//   "--c-shadow-card": "0 0 0 1px rgba(0,0,0,0.05)",
// };
// const DARK = {
//   "--c-bg-app": "#0c0c10",
//   "--c-bg-shell": "#131318",
//   "--c-bg-sidebar": "#0f0f14",
//   "--c-bg-card": "#1a1a22",
//   "--c-bg-card2": "#15151c",
//   "--c-bg-nav-active": "#1e1830",
//   "--c-bg-nav-hover": "#1a1a22",
//   "--c-bg-input": "#1a1a22",
//   "--c-bg-badge": "#1e1830",
//   "--c-border": "#2a2a35",
//   "--c-border-light": "#22222c",
//   "--c-text-primary": "#f1f1f5",
//   "--c-text-secondary": "#8b8fa8",
//   "--c-text-muted": "#5a5f78",
//   "--c-text-nav-active": "#a78bfa",
//   "--c-accent": "#a78bfa",
//   "--c-accent-light": "#1e1830",
//   "--c-accent-btn": "#7c3aed",
//   "--c-green": "#34d399",
//   "--c-red": "#f87171",
//   "--c-orange": "#fb923c",
//   "--c-purple-bar": "#8b5cf6",
//   "--c-bar-bg": "#2a2040",
//   "--c-storage-fill": "#f87171",
//   "--c-storage-bg": "#3a1a1a",
//   "--c-shadow": "0 1px 3px rgba(0,0,0,0.3),0 1px 2px rgba(0,0,0,0.2)",
//   "--c-shadow-card": "0 0 0 1px rgba(255,255,255,0.04)",
// };

// function injectTokens(tokens) {
//   const vars = Object.entries(tokens)
//     .map(([k, v]) => `${k}:${v}`)
//     .join(";");
//   return `:root{${vars}}`;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  ICON PATHS  (inline SVG paths so no external deps needed)
// // ─────────────────────────────────────────────────────────────────────────────
// const IC = {
//   chevLeft: "M15 18l-6-6 6-6",
//   chevRight: "M9 18l6-6-6-6",
//   chevDown: "M6 9l6 6 6-6",
//   chevUp: "M18 15l-6-6-6 6",
//   collapse: "M11 19l-7-7 7-7M18 19l-7-7 7-7",
//   dashboard: "M3 3h7v7H3zM13 3h8v7h-8zM13 13h8v8h-8zM3 13h7v8H3z",
//   deals:
//     "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16",
//   notes:
//     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
//   calendar:
//     "M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
//   reports: "M18 20V10M12 20V4M6 20v-6",
//   projects:
//     "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
//   settings:
//     "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
//   help: "M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM12 17v-2M12 13a2 2 0 10-2-2",
//   bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
//   mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
//   share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
//   search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
//   sun: "M12 4V2M12 22v-2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 17a5 5 0 100-10 5 5 0 000 10z",
//   moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
//   moreV:
//     "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z",
//   moreH:
//     "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 110-2 1 1 0 010 2zM13 12a1 1 0 110-2 1 1 0 010 2zM20 12a1 1 0 110-2 1 1 0 010 2z",
//   company:
//     "M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16",
//   contact:
//     "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
//   meeting:
//     "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
//   plus: "M12 5v14M5 12h14",
//   check: "M20 6L9 17l-5-5",
//   upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
//   download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
//   aiMode:
//     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
//   customize: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
//   import: "M3 15v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4M17 9l-5 5-5-5M12 12.8V2.5",
//   export: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v13",
//   arrowUp: "M18 15l-6-6-6 6",
//   arrowDown: "M6 9l6 6 6-6",
//   globe:
//     "M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20M2 12a10 10 0 1120 0 10 10 0 01-20 0",
//   flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
//   zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
// };

// function Icon({
//   d,
//   size = 16,
//   stroke = "currentColor",
//   fill = "none",
//   strokeWidth = 1.5,
// }) {
//   return (
//     <svg
//       width={size}
//       height={size}
//       viewBox="0 0 24 24"
//       fill={fill}
//       stroke={stroke}
//       strokeWidth={strokeWidth}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d={d} />
//     </svg>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  REVENUE CHART DATA
// // ─────────────────────────────────────────────────────────────────────────────
// const revenueData = [
//   { month: "Mar", value: 22000 },
//   { month: "Apr", value: 16000 },
//   { month: "May", value: 19000 },
//   { month: "Jun", value: 13000 },
//   { month: "Jul", value: 6000 },
//   { month: "Aug", value: 11000 },
//   { month: "Sept", value: 18500, active: true },
//   { month: "Oct", value: 15000 },
//   { month: "Nov", value: 8000 },
//   { month: "Des", value: 7000 },
//   { month: "Jan", value: 6000 },
//   { month: "Feb", value: 7500 },
// ];

// const retentionData = [
//   { month: "Jun", sme: 55, start: 40, ent: 25 },
//   { month: "Jul", sme: 60, start: 55, ent: 35 },
//   { month: "Aug", sme: 50, start: 48, ent: 30 },
//   { month: "Sep", sme: 80, start: 70, ent: 60, active: true },
//   { month: "Oct", sme: 45, start: 40, ent: 28 },
//   { month: "Nov", sme: 50, start: 45, ent: 32 },
//   { month: "Dec", sme: 55, start: 50, ent: 35 },
// ];

// // Custom bar tooltip
// function CustomTooltip({ active, payload, label }) {
//   if (active && payload && payload.length) {
//     const val = payload[0].value;
//     return (
//       <div
//         style={{
//           background: "var(--c-bg-card)",
//           border: "1px solid var(--c-border)",
//           borderRadius: 10,
//           padding: "10px 14px",
//           boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
//           minWidth: 120,
//         }}
//       >
//         <div
//           style={{
//             fontSize: 11,
//             color: "var(--c-text-secondary)",
//             marginBottom: 4,
//           }}
//         >
//           {label}, 2025
//         </div>
//         <div
//           style={{
//             fontSize: 16,
//             fontWeight: 700,
//             color: "var(--c-text-primary)",
//           }}
//         >
//           ${(val / 1000).toFixed(2)}k
//         </div>
//         <div
//           style={{
//             fontSize: 11,
//             color: "var(--c-green)",
//             display: "flex",
//             alignItems: "center",
//             gap: 3,
//             marginTop: 2,
//           }}
//         >
//           <Icon
//             d={IC.arrowUp}
//             size={10}
//             stroke="var(--c-green)"
//             strokeWidth={2.5}
//           />{" "}
//           2%
//         </div>
//       </div>
//     );
//   }
//   return null;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  SIDEBAR
// // ─────────────────────────────────────────────────────────────────────────────
// const navItems = [
//   { key: "dashboard", label: "Dashboard", icon: IC.dashboard },
//   { key: "deals", label: "Deals", icon: IC.deals },
//   { key: "notes", label: "Notes", icon: IC.notes },
//   { key: "calendar", label: "Calendar", icon: IC.calendar },
//   { key: "reports", label: "Reports", icon: IC.reports },
//   { key: "projects", label: "Projects", icon: IC.projects },
// ];
// const favItems = [
//   { key: "companies", label: "Companies", icon: IC.company, count: "1,212" },
//   { key: "contacts", label: "Contacts", icon: IC.contact, count: "898" },
//   { key: "meetings", label: "Meetings", icon: IC.meeting, count: "32" },
// ];

// function Sidebar({ collapsed, onToggle, activeNav, onNav }) {
//   return (
//     <aside
//       style={{
//         width: collapsed ? 64 : 200,
//         minWidth: collapsed ? 64 : 200,
//         background: "var(--c-bg-sidebar)",
//         borderRight: "1px solid var(--c-border)",
//         display: "flex",
//         flexDirection: "column",
//         height: "100%",
//         flexShrink: 0,
//         transition: "width 0.22s ease, min-width 0.22s ease",
//         overflow: "hidden",
//       }}
//     >
//       {/* Brand */}
//       <div
//         style={{
//           padding: collapsed ? "18px 16px" : "18px 16px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: collapsed ? "center" : "space-between",
//           borderBottom: "1px solid var(--c-border)",
//           minHeight: 62,
//         }}
//       >
//         {!collapsed && (
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <div
//               style={{
//                 width: 30,
//                 height: 30,
//                 borderRadius: 8,
//                 background: "linear-gradient(135deg,#7c3aed,#ec4899)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//               }}
//             >
//               <Icon
//                 d={IC.zap}
//                 size={14}
//                 stroke="#fff"
//                 fill="#fff"
//                 strokeWidth={1}
//               />
//             </div>
//             <div>
//               <div
//                 style={{
//                   fontSize: 13,
//                   fontWeight: 700,
//                   color: "var(--c-text-primary)",
//                   lineHeight: 1,
//                 }}
//               >
//                 Pivora
//               </div>
//               <div
//                 style={{
//                   fontSize: 10,
//                   color: "var(--c-text-muted)",
//                   lineHeight: 1.4,
//                 }}
//               >
//                 CRM Platform
//               </div>
//             </div>
//           </div>
//         )}
//         {collapsed && (
//           <div
//             style={{
//               width: 30,
//               height: 30,
//               borderRadius: 8,
//               background: "linear-gradient(135deg,#7c3aed,#ec4899)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Icon
//               d={IC.zap}
//               size={14}
//               stroke="#fff"
//               fill="#fff"
//               strokeWidth={1}
//             />
//           </div>
//         )}
//         {!collapsed && (
//           <button
//             onClick={onToggle}
//             style={{
//               background: "none",
//               border: "none",
//               color: "var(--c-text-muted)",
//               cursor: "pointer",
//               padding: 4,
//               borderRadius: 6,
//               display: "flex",
//             }}
//           >
//             <Icon d={IC.collapse} size={15} strokeWidth={1.5} />
//           </button>
//         )}
//       </div>

//       {/* User */}
//       <div
//         style={{
//           padding: collapsed ? "12px 8px" : "12px 14px",
//           borderBottom: "1px solid var(--c-border)",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 8,
//             background: "var(--c-bg-nav-hover)",
//             borderRadius: 8,
//             padding: collapsed ? "7px" : "7px 10px",
//             cursor: "pointer",
//           }}
//         >
//           <div
//             style={{
//               width: 26,
//               height: 26,
//               borderRadius: "50%",
//               background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               flexShrink: 0,
//               fontSize: 10,
//               fontWeight: 700,
//               color: "#fff",
//             }}
//           >
//             W
//           </div>
//           {!collapsed && (
//             <>
//               <span
//                 style={{
//                   fontSize: 11,
//                   color: "var(--c-text-secondary)",
//                   flex: 1,
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 williams@mesh.com
//               </span>
//               <Icon
//                 d={IC.chevDown}
//                 size={12}
//                 stroke="var(--c-text-muted)"
//                 strokeWidth={2}
//               />
//             </>
//           )}
//         </div>
//       </div>

//       {/* Nav */}
//       <nav
//         style={{
//           flex: 1,
//           padding: collapsed ? "10px 8px" : "10px 10px",
//           overflowY: "auto",
//           overflowX: "hidden",
//         }}
//       >
//         {navItems.map((item) => {
//           const isActive = activeNav === item.key;
//           return (
//             <button
//               key={item.key}
//               onClick={() => onNav(item.key)}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 9,
//                 width: "100%",
//                 padding: collapsed ? "9px" : "9px 10px",
//                 borderRadius: 8,
//                 border: "none",
//                 cursor: "pointer",
//                 marginBottom: 2,
//                 background: isActive ? "var(--c-bg-nav-active)" : "transparent",
//                 color: isActive
//                   ? "var(--c-text-nav-active)"
//                   : "var(--c-text-secondary)",
//                 fontWeight: isActive ? 600 : 400,
//                 fontSize: 13,
//                 textAlign: "left",
//                 transition: "background 0.12s, color 0.12s",
//                 justifyContent: collapsed ? "center" : "flex-start",
//                 position: "relative",
//               }}
//             >
//               {isActive && !collapsed && (
//                 <div
//                   style={{
//                     position: "absolute",
//                     left: -2,
//                     top: "20%",
//                     bottom: "20%",
//                     width: 3,
//                     borderRadius: 4,
//                     background: "var(--c-accent)",
//                   }}
//                 />
//               )}
//               <Icon
//                 d={item.icon}
//                 size={15}
//                 stroke={
//                   isActive ? "var(--c-text-nav-active)" : "var(--c-text-muted)"
//                 }
//                 strokeWidth={isActive ? 2 : 1.5}
//               />
//               {!collapsed && item.label}
//             </button>
//           );
//         })}

//         {/* Favorites */}
//         {!collapsed && (
//           <>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 padding: "14px 10px 6px",
//                 marginTop: 4,
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: 10,
//                   fontWeight: 600,
//                   color: "var(--c-text-muted)",
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                 }}
//               >
//                 Favorites
//               </span>
//               <div style={{ display: "flex", gap: 4 }}>
//                 <button
//                   style={{
//                     background: "none",
//                     border: "none",
//                     color: "var(--c-text-muted)",
//                     cursor: "pointer",
//                     padding: 2,
//                     fontSize: 16,
//                     lineHeight: 1,
//                   }}
//                 >
//                   ···
//                 </button>
//                 <button
//                   style={{
//                     background: "none",
//                     border: "none",
//                     color: "var(--c-text-muted)",
//                     cursor: "pointer",
//                     padding: 2,
//                   }}
//                 >
//                   <Icon d={IC.plus} size={12} />
//                 </button>
//               </div>
//             </div>
//             {favItems.map((f) => (
//               <button
//                 key={f.key}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 9,
//                   width: "100%",
//                   padding: "7px 10px",
//                   borderRadius: 8,
//                   border: "none",
//                   background: "transparent",
//                   color: "var(--c-text-secondary)",
//                   fontSize: 12,
//                   cursor: "pointer",
//                   marginBottom: 1,
//                 }}
//               >
//                 <Icon
//                   d={f.icon}
//                   size={13}
//                   stroke="var(--c-text-muted)"
//                   strokeWidth={1.5}
//                 />
//                 <span style={{ flex: 1, textAlign: "left" }}>{f.label}</span>
//                 <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>
//                   {f.count}
//                 </span>
//               </button>
//             ))}

//             {/* Projects */}
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 padding: "12px 10px 6px",
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: 10,
//                   fontWeight: 600,
//                   color: "var(--c-text-muted)",
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                 }}
//               >
//                 Projects
//               </span>
//               <div style={{ display: "flex", gap: 4 }}>
//                 <button
//                   style={{
//                     background: "none",
//                     border: "none",
//                     color: "var(--c-text-muted)",
//                     cursor: "pointer",
//                     padding: 2,
//                     fontSize: 16,
//                     lineHeight: 1,
//                   }}
//                 >
//                   ···
//                 </button>
//                 <button
//                   style={{
//                     background: "none",
//                     border: "none",
//                     color: "var(--c-text-muted)",
//                     cursor: "pointer",
//                     padding: 2,
//                   }}
//                 >
//                   <Icon d={IC.plus} size={12} />
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </nav>

//       {/* Storage */}
//       <div
//         style={{
//           padding: collapsed ? "12px 8px" : "12px 14px",
//           borderTop: "1px solid var(--c-border)",
//         }}
//       >
//         {!collapsed && (
//           <>
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 marginBottom: 6,
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: 11,
//                   color: "var(--c-text-secondary)",
//                   fontWeight: 500,
//                 }}
//               >
//                 Cloud Storage
//               </span>
//               <span
//                 style={{
//                   fontSize: 11,
//                   color: "var(--c-text-secondary)",
//                   fontWeight: 600,
//                 }}
//               >
//                 90%
//               </span>
//             </div>
//             <div
//               style={{
//                 height: 5,
//                 borderRadius: 99,
//                 background: "var(--c-storage-bg)",
//                 marginBottom: 8,
//                 overflow: "hidden",
//               }}
//             >
//               <div
//                 style={{
//                   height: "100%",
//                   width: "90%",
//                   borderRadius: 99,
//                   background: "var(--c-storage-fill)",
//                 }}
//               />
//             </div>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: "var(--c-text-muted)",
//                 marginBottom: 8,
//               }}
//             >
//               1.8 GB of 2 GB used
//             </div>
//             <button
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 6,
//                 width: "100%",
//                 padding: "7px 10px",
//                 borderRadius: 8,
//                 border: "1px solid var(--c-border)",
//                 background: "var(--c-bg-card)",
//                 color: "var(--c-text-secondary)",
//                 fontSize: 11,
//                 cursor: "pointer",
//               }}
//             >
//               <Icon d={IC.upload} size={12} stroke="var(--c-text-muted)" />
//               Upgrade Storage
//               <span
//                 style={{
//                   marginLeft: "auto",
//                   fontSize: 10,
//                   color: "var(--c-text-muted)",
//                 }}
//               >
//                 (up to 25GB)
//               </span>
//             </button>
//           </>
//         )}
//         <div style={{ marginTop: collapsed ? 0 : 8 }}>
//           <button
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//               width: "100%",
//               padding: collapsed ? 9 : "8px 10px",
//               borderRadius: 8,
//               border: "none",
//               background: "transparent",
//               color: "var(--c-text-secondary)",
//               fontSize: 12,
//               cursor: "pointer",
//               justifyContent: collapsed ? "center" : "flex-start",
//             }}
//           >
//             <Icon
//               d={IC.settings}
//               size={14}
//               stroke="var(--c-text-muted)"
//               strokeWidth={1.5}
//             />
//             {!collapsed && "Settings"}
//           </button>
//           <button
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//               width: "100%",
//               padding: collapsed ? 9 : "8px 10px",
//               borderRadius: 8,
//               border: "none",
//               background: "transparent",
//               color: "var(--c-text-secondary)",
//               fontSize: 12,
//               cursor: "pointer",
//               justifyContent: collapsed ? "center" : "flex-start",
//             }}
//           >
//             <Icon
//               d={IC.help}
//               size={14}
//               stroke="var(--c-text-muted)"
//               strokeWidth={1.5}
//             />
//             {!collapsed && "Help Center"}
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  TOPBAR
// // ─────────────────────────────────────────────────────────────────────────────
// function TopBar({ theme, onThemeToggle }) {
//   return (
//     <header
//       style={{
//         height: 56,
//         display: "flex",
//         alignItems: "center",
//         padding: "0 20px",
//         borderBottom: "1px solid var(--c-border)",
//         gap: 12,
//         flexShrink: 0,
//         background: "var(--c-bg-card)",
//       }}
//     >
//       <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
//         <Icon
//           d={IC.dashboard}
//           size={16}
//           stroke="var(--c-text-primary)"
//           strokeWidth={1.5}
//         />
//         <span
//           style={{
//             fontSize: 14,
//             fontWeight: 600,
//             color: "var(--c-text-primary)",
//           }}
//         >
//           Dashboard
//         </span>
//       </div>
//       {/* Search */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 8,
//           background: "var(--c-bg-input)",
//           border: "1px solid var(--c-border)",
//           borderRadius: 8,
//           padding: "6px 12px",
//           width: 180,
//         }}
//       >
//         <Icon
//           d={IC.search}
//           size={13}
//           stroke="var(--c-text-muted)"
//           strokeWidth={2}
//         />
//         <span style={{ fontSize: 12, color: "var(--c-text-muted)" }}>
//           Search AI Mode
//         </span>
//         <Icon
//           d={IC.aiMode}
//           size={12}
//           stroke="var(--c-accent)"
//           strokeWidth={1.5}
//           style={{ marginLeft: "auto" }}
//         />
//       </div>
//       {/* Actions */}
//       <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//         <button
//           onClick={onThemeToggle}
//           style={{
//             background: "var(--c-bg-input)",
//             border: "1px solid var(--c-border)",
//             borderRadius: 8,
//             padding: "6px 8px",
//             cursor: "pointer",
//             color: "var(--c-text-secondary)",
//             display: "flex",
//           }}
//         >
//           <Icon
//             d={theme === "light" ? IC.moon : IC.sun}
//             size={15}
//             strokeWidth={1.5}
//           />
//         </button>
//         <button
//           style={{
//             position: "relative",
//             background: "var(--c-bg-input)",
//             border: "1px solid var(--c-border)",
//             borderRadius: 8,
//             padding: "6px 8px",
//             cursor: "pointer",
//             color: "var(--c-text-secondary)",
//             display: "flex",
//           }}
//         >
//           <Icon d={IC.bell} size={15} strokeWidth={1.5} />
//         </button>
//         <button
//           style={{
//             position: "relative",
//             background: "var(--c-bg-input)",
//             border: "1px solid var(--c-border)",
//             borderRadius: 8,
//             padding: "6px 8px",
//             cursor: "pointer",
//             color: "var(--c-text-secondary)",
//             display: "flex",
//           }}
//         >
//           <Icon d={IC.mail} size={15} strokeWidth={1.5} />
//           <div
//             style={{
//               position: "absolute",
//               top: 4,
//               right: 4,
//               width: 7,
//               height: 7,
//               borderRadius: "50%",
//               background: "#ef4444",
//               border: "1.5px solid var(--c-bg-card)",
//             }}
//           />
//         </button>
//         <button
//           style={{
//             background: "var(--c-bg-input)",
//             border: "1px solid var(--c-border)",
//             borderRadius: 8,
//             padding: "6px 8px",
//             cursor: "pointer",
//             color: "var(--c-text-secondary)",
//             display: "flex",
//           }}
//         >
//           <Icon d={IC.share} size={15} strokeWidth={1.5} />
//         </button>
//       </div>
//     </header>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  ACTION BAR
// // ─────────────────────────────────────────────────────────────────────────────
// function ActionBar() {
//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         padding: "10px 20px",
//         borderBottom: "1px solid var(--c-border)",
//         gap: 10,
//         background: "var(--c-bg-card)",
//         flexShrink: 0,
//       }}
//     >
//       <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
//         <Icon
//           d={IC.check}
//           size={13}
//           stroke="var(--c-green)"
//           strokeWidth={2.5}
//         />
//         <span
//           style={{ fontSize: 11, color: "var(--c-green)", fontWeight: 500 }}
//         >
//           Last updated now
//         </span>
//       </div>
//       <button
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 6,
//           padding: "6px 12px",
//           borderRadius: 8,
//           border: "1px solid var(--c-border)",
//           background: "var(--c-bg-card)",
//           color: "var(--c-text-secondary)",
//           fontSize: 12,
//           cursor: "pointer",
//         }}
//       >
//         <Icon d={IC.customize} size={12} strokeWidth={1.5} />
//         Customize Widget
//       </button>
//       <button
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 6,
//           padding: "6px 12px",
//           borderRadius: 8,
//           border: "1px solid var(--c-border)",
//           background: "var(--c-bg-card)",
//           color: "var(--c-text-secondary)",
//           fontSize: 12,
//           cursor: "pointer",
//         }}
//       >
//         <Icon d={IC.import} size={12} strokeWidth={1.5} />
//         Imports
//         <Icon
//           d={IC.chevDown}
//           size={11}
//           stroke="var(--c-text-muted)"
//           strokeWidth={2}
//         />
//       </button>
//       <button
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 6,
//           padding: "6px 14px",
//           borderRadius: 8,
//           border: "none",
//           background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
//           color: "#fff",
//           fontSize: 12,
//           cursor: "pointer",
//           fontWeight: 600,
//         }}
//       >
//         <Icon d={IC.export} size={12} stroke="#fff" strokeWidth={2} />
//         Exports
//         <Icon d={IC.chevDown} size={11} stroke="#fff" strokeWidth={2} />
//       </button>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  STAT CARDS
// // ─────────────────────────────────────────────────────────────────────────────
// function StatCard({ icon, label, value, delta, deltaDir, period }) {
//   const isUp = deltaDir === "up";
//   return (
//     <div
//       style={{
//         background: "var(--c-bg-card)",
//         border: "1px solid var(--c-border)",
//         borderRadius: 12,
//         padding: "16px 18px",
//         flex: 1,
//         minWidth: 0,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 10,
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//           <div
//             style={{
//               width: 28,
//               height: 28,
//               borderRadius: 7,
//               background: "var(--c-accent-light)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Icon
//               d={icon}
//               size={14}
//               stroke="var(--c-accent)"
//               strokeWidth={1.8}
//             />
//           </div>
//           <span
//             style={{
//               fontSize: 12,
//               color: "var(--c-text-secondary)",
//               fontWeight: 500,
//             }}
//           >
//             {label}
//           </span>
//         </div>
//         <Icon
//           d={IC.moreH}
//           size={14}
//           stroke="var(--c-text-muted)"
//           strokeWidth={1.5}
//         />
//       </div>
//       <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
//         <span
//           style={{
//             fontSize: 28,
//             fontWeight: 800,
//             color: "var(--c-text-primary)",
//             lineHeight: 1,
//             letterSpacing: "-0.03em",
//           }}
//         >
//           {value}
//         </span>
//         <div
//           style={{
//             marginBottom: 3,
//             display: "flex",
//             flexDirection: "column",
//             gap: 2,
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
//             <Icon
//               d={isUp ? IC.arrowUp : IC.arrowDown}
//               size={11}
//               stroke={isUp ? "var(--c-green)" : "var(--c-red)"}
//               strokeWidth={2.5}
//             />
//             <span
//               style={{
//                 fontSize: 11,
//                 fontWeight: 600,
//                 color: isUp ? "var(--c-green)" : "var(--c-red)",
//               }}
//             >
//               {delta}
//             </span>
//           </div>
//           <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>
//             {period}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  REVENUE CHART CARD
// // ─────────────────────────────────────────────────────────────────────────────
// function RevenueCard() {
//   const [period, setPeriod] = useState("1Y");
//   const periods = ["1D", "1W", "1M", "6M", "1Y", "ALL"];
//   return (
//     <div
//       style={{
//         background: "var(--c-bg-card)",
//         border: "1px solid var(--c-border)",
//         borderRadius: 12,
//         padding: "16px 18px",
//         flex: 1,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 4,
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//           <span
//             style={{
//               fontSize: 13,
//               fontWeight: 600,
//               color: "var(--c-text-primary)",
//             }}
//           >
//             Revenue
//           </span>
//           <Icon
//             d={IC.chevDown}
//             size={13}
//             stroke="var(--c-text-muted)"
//             strokeWidth={2}
//           />
//         </div>
//         <div style={{ display: "flex", gap: 2 }}>
//           {periods.map((p) => (
//             <button
//               key={p}
//               onClick={() => setPeriod(p)}
//               style={{
//                 padding: "3px 8px",
//                 borderRadius: 6,
//                 border: "none",
//                 background:
//                   period === p ? "var(--c-bg-nav-active)" : "transparent",
//                 color:
//                   period === p
//                     ? "var(--c-text-nav-active)"
//                     : "var(--c-text-muted)",
//                 fontSize: 11,
//                 fontWeight: period === p ? 600 : 400,
//                 cursor: "pointer",
//               }}
//             >
//               {p}
//             </button>
//           ))}
//         </div>
//       </div>
//       <div style={{ marginBottom: 12 }}>
//         <span
//           style={{
//             fontSize: 22,
//             fontWeight: 800,
//             color: "var(--c-text-primary)",
//             letterSpacing: "-0.02em",
//           }}
//         >
//           $32.209
//         </span>
//         <span
//           style={{
//             fontSize: 11,
//             color: "var(--c-green)",
//             marginLeft: 8,
//             fontWeight: 500,
//           }}
//         >
//           +22% vs last month
//         </span>
//       </div>
//       <ResponsiveContainer width="100%" height={160}>
//         <BarChart
//           data={revenueData}
//           barSize={18}
//           margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
//         >
//           <CartesianGrid
//             vertical={false}
//             stroke="var(--c-border)"
//             strokeDasharray="3 3"
//           />
//           <XAxis
//             dataKey="month"
//             axisLine={false}
//             tickLine={false}
//             tick={{ fontSize: 10, fill: "var(--c-text-muted)" }}
//           />
//           <YAxis
//             axisLine={false}
//             tickLine={false}
//             tick={{ fontSize: 10, fill: "var(--c-text-muted)" }}
//             tickFormatter={(v) => `${v / 1000}k`}
//           />
//           <Tooltip content={<CustomTooltip />} cursor={false} />
//           <Bar
//             dataKey="value"
//             radius={[4, 4, 0, 0]}
//             fill="var(--c-bar-bg)"
//             shape={(props) => {
//               const { x, y, width, height, index } = props;
//               const isActive = revenueData[index]?.active;
//               return (
//                 <rect
//                   x={x}
//                   y={y}
//                   width={width}
//                   height={height}
//                   rx={4}
//                   ry={4}
//                   fill={isActive ? "var(--c-purple-bar)" : "var(--c-bar-bg)"}
//                 />
//               );
//             }}
//           />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  CALENDAR CARD
// // ─────────────────────────────────────────────────────────────────────────────
// const calEvents = [
//   {
//     title: "Mesh Weekly Meeting",
//     time: "9.00 am - 10.00 am",
//     platform: "On Google Meet",
//     avatars: ["#6366f1", "#ec4899", "#f59e0b"],
//   },
//   {
//     title: "Gamification Demo",
//     time: "10.45 am - 11.45 am",
//     platform: "On Slack",
//     avatars: ["#10b981", "#6366f1", "#f97316"],
//   },
// ];

// function CalendarCard() {
//   const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
//   const rows = [
//     [null, null, 1, 2, 3, 4, 5],
//     [6, 7, null, null, null, null, null],
//     [null, null, null, null, null, null, 11],
//   ];
//   // Simpler: show Oct 2025 grid
//   const grid = [
//     [null, null, 1, 2, 3, 4, 5],
//     [6, 7, 8, 9, 10, 11, null],
//   ];
//   return (
//     <div
//       style={{
//         background: "var(--c-bg-card)",
//         border: "1px solid var(--c-border)",
//         borderRadius: 12,
//         padding: "16px 18px",
//         width: 280,
//         flexShrink: 0,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 12,
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <button
//             style={{
//               background: "none",
//               border: "none",
//               cursor: "pointer",
//               color: "var(--c-text-muted)",
//               padding: 2,
//             }}
//           >
//             <Icon d={IC.chevLeft} size={14} strokeWidth={2} />
//           </button>
//           <span
//             style={{
//               fontSize: 13,
//               fontWeight: 600,
//               color: "var(--c-text-primary)",
//             }}
//           >
//             October 2025
//           </span>
//           <button
//             style={{
//               background: "none",
//               border: "none",
//               cursor: "pointer",
//               color: "var(--c-text-muted)",
//               padding: 2,
//             }}
//           >
//             <Icon d={IC.chevRight} size={14} strokeWidth={2} />
//           </button>
//         </div>
//         <Icon d={IC.moreV} size={14} stroke="var(--c-text-muted)" />
//       </div>
//       {/* Day headers */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(7,1fr)",
//           marginBottom: 4,
//         }}
//       >
//         {days.map((d) => (
//           <div
//             key={d}
//             style={{
//               textAlign: "center",
//               fontSize: 10,
//               color: "var(--c-text-muted)",
//               fontWeight: 600,
//               padding: "2px 0",
//             }}
//           >
//             {d}
//           </div>
//         ))}
//       </div>
//       {/* Days grid */}
//       {[
//         [null, null, null, null, 1, 2, 3],
//         [4, 5, 6, 7, 8, 9, 10],
//       ].map((row, ri) => (
//         <div
//           key={ri}
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(7,1fr)",
//             marginBottom: 2,
//           }}
//         >
//           {row.map((d, di) => (
//             <div key={di} style={{ textAlign: "center", padding: "4px 0" }}>
//               {d && (
//                 <div
//                   style={{
//                     width: 24,
//                     height: 24,
//                     borderRadius: "50%",
//                     margin: "auto",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     background: d === 8 ? "var(--c-accent)" : "transparent",
//                     color: d === 8 ? "#fff" : "var(--c-text-primary)",
//                     fontSize: 12,
//                     fontWeight: d === 8 ? 700 : 400,
//                     cursor: "pointer",
//                   }}
//                 >
//                   {d}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       ))}
//       {/* Events */}
//       <div
//         style={{
//           marginTop: 12,
//           display: "flex",
//           flexDirection: "column",
//           gap: 8,
//         }}
//       >
//         {calEvents.map((ev, i) => (
//           <div
//             key={i}
//             style={{
//               background: "var(--c-bg-card2)",
//               borderRadius: 10,
//               padding: "10px 12px",
//               border: "1px solid var(--c-border-light)",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 marginBottom: 6,
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: 12,
//                   fontWeight: 600,
//                   color: "var(--c-text-primary)",
//                 }}
//               >
//                 {ev.title}
//               </span>
//               <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>
//                 {ev.time}
//               </span>
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//               }}
//             >
//               <div style={{ display: "flex" }}>
//                 {ev.avatars.map((c, ai) => (
//                   <div
//                     key={ai}
//                     style={{
//                       width: 20,
//                       height: 20,
//                       borderRadius: "50%",
//                       background: c,
//                       border: "2px solid var(--c-bg-card)",
//                       marginLeft: ai === 0 ? 0 : -6,
//                     }}
//                   />
//                 ))}
//               </div>
//               <span
//                 style={{
//                   fontSize: 10,
//                   color: "var(--c-text-muted)",
//                   background: "var(--c-bg-input)",
//                   padding: "2px 8px",
//                   borderRadius: 99,
//                   border: "1px solid var(--c-border)",
//                 }}
//               >
//                 {ev.platform}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  LEADS MANAGEMENT CARD
// // ─────────────────────────────────────────────────────────────────────────────
// const leadsData = [
//   { label: "Qualified", value: 65, color: "#7c3aed" },
//   { label: "Contacted", value: 48, color: "#a78bfa" },
//   { label: "Lost", value: 20, color: "#ef4444" },
//   { label: "Won", value: 55, color: "#7c3aed" },
// ];

// function LeadsCard() {
//   const [tab, setTab] = useState("Status");
//   const tabs = ["Status", "Sources", "Qualification"];
//   return (
//     <div
//       style={{
//         background: "var(--c-bg-card)",
//         border: "1px solid var(--c-border)",
//         borderRadius: 12,
//         padding: "16px 18px",
//         flex: 1,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 12,
//         }}
//       >
//         <span
//           style={{
//             fontSize: 13,
//             fontWeight: 600,
//             color: "var(--c-text-primary)",
//           }}
//         >
//           Leads Management
//         </span>
//         <Icon d={IC.moreV} size={14} stroke="var(--c-text-muted)" />
//       </div>
//       <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
//         {tabs.map((t) => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             style={{
//               padding: "4px 10px",
//               borderRadius: 6,
//               border: tab === t ? "1px solid var(--c-border)" : "none",
//               background: tab === t ? "var(--c-bg-card)" : "transparent",
//               color:
//                 tab === t ? "var(--c-text-primary)" : "var(--c-text-muted)",
//               fontSize: 11,
//               fontWeight: tab === t ? 600 : 400,
//               cursor: "pointer",
//             }}
//           >
//             {t}
//           </button>
//         ))}
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//         {leadsData.map((l) => (
//           <div
//             key={l.label}
//             style={{ display: "flex", alignItems: "center", gap: 10 }}
//           >
//             <span
//               style={{
//                 width: 72,
//                 fontSize: 11,
//                 color: "var(--c-text-secondary)",
//               }}
//             >
//               {l.label}
//             </span>
//             <div
//               style={{
//                 flex: 1,
//                 height: 8,
//                 borderRadius: 99,
//                 background: "var(--c-bar-bg)",
//                 overflow: "hidden",
//               }}
//             >
//               <div
//                 style={{
//                   height: "100%",
//                   width: `${l.value}%`,
//                   borderRadius: 99,
//                   background: l.color,
//                   transition: "width 0.4s ease",
//                 }}
//               />
//             </div>
//             <span
//               style={{
//                 width: 28,
//                 fontSize: 11,
//                 color: "var(--c-text-muted)",
//                 textAlign: "right",
//               }}
//             >
//               {l.value}%
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  TOP COUNTRY CARD  (simplified map placeholder + list)
// // ─────────────────────────────────────────────────────────────────────────────
// const countries = [
//   { name: "Australia", flag: "🇦🇺", pct: 48 },
//   { name: "Malaysia", flag: "🇲🇾", pct: 33 },
//   { name: "Indonesia", flag: "🇮🇩", pct: 25 },
//   { name: "Singapore", flag: "🇸🇬", pct: 17 },
// ];

// function TopCountryCard() {
//   return (
//     <div
//       style={{
//         background: "var(--c-bg-card)",
//         border: "1px solid var(--c-border)",
//         borderRadius: 12,
//         padding: "16px 18px",
//         flex: 1,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 12,
//         }}
//       >
//         <span
//           style={{
//             fontSize: 13,
//             fontWeight: 600,
//             color: "var(--c-text-primary)",
//           }}
//         >
//           Top Country
//         </span>
//         <Icon d={IC.moreV} size={14} stroke="var(--c-text-muted)" />
//       </div>
//       {/* Map placeholder with purple blobs */}
//       <div
//         style={{
//           height: 100,
//           background: "var(--c-bg-card2)",
//           borderRadius: 10,
//           marginBottom: 14,
//           overflow: "hidden",
//           position: "relative",
//           border: "1px solid var(--c-border-light)",
//         }}
//       >
//         <svg
//           width="100%"
//           height="100%"
//           viewBox="0 0 300 100"
//           style={{ position: "absolute", inset: 0 }}
//         >
//           {/* Simplified world-blob shapes for SE Asia/Pacific */}
//           <ellipse
//             cx="220"
//             cy="50"
//             rx="35"
//             ry="22"
//             fill="#7c3aed"
//             opacity="0.18"
//           />
//           <ellipse
//             cx="215"
//             cy="48"
//             rx="18"
//             ry="12"
//             fill="#7c3aed"
//             opacity="0.5"
//           />
//           <ellipse
//             cx="240"
//             cy="60"
//             rx="12"
//             ry="8"
//             fill="#a78bfa"
//             opacity="0.5"
//           />
//           <ellipse
//             cx="200"
//             cy="62"
//             rx="10"
//             ry="6"
//             fill="#6d28d9"
//             opacity="0.4"
//           />
//           <ellipse
//             cx="255"
//             cy="45"
//             rx="14"
//             ry="8"
//             fill="#7c3aed"
//             opacity="0.35"
//           />
//           {/* dots */}
//           <circle cx="215" cy="48" r="3" fill="#7c3aed" />
//           <circle cx="240" cy="60" r="2.5" fill="#a78bfa" />
//           <circle cx="200" cy="62" r="2" fill="#6d28d9" />
//         </svg>
//         {/* expand icon */}
//         <button
//           style={{
//             position: "absolute",
//             top: 6,
//             right: 6,
//             background: "var(--c-bg-card)",
//             border: "1px solid var(--c-border)",
//             borderRadius: 6,
//             padding: "3px 5px",
//             cursor: "pointer",
//             display: "flex",
//           }}
//         >
//           <Icon
//             d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
//             size={11}
//             stroke="var(--c-text-muted)"
//             strokeWidth={1.5}
//           />
//         </button>
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//         {countries.map((c, i) => (
//           <div
//             key={c.name}
//             style={{ display: "flex", alignItems: "center", gap: 8 }}
//           >
//             <span
//               style={{ fontSize: 11, color: "var(--c-text-muted)", width: 14 }}
//             >
//               {i + 1}
//             </span>
//             <span style={{ fontSize: 14 }}>{c.flag}</span>
//             <span
//               style={{
//                 fontSize: 12,
//                 color: "var(--c-text-secondary)",
//                 flex: 1,
//               }}
//             >
//               {c.name}
//             </span>
//             <span
//               style={{
//                 fontSize: 12,
//                 fontWeight: 600,
//                 color: "var(--c-text-primary)",
//               }}
//             >
//               {c.pct}%
//             </span>
//           </div>
//         ))}
//         <button
//           style={{
//             marginTop: 4,
//             fontSize: 11,
//             color: "var(--c-accent)",
//             background: "none",
//             border: "none",
//             cursor: "pointer",
//             textAlign: "left",
//             display: "flex",
//             alignItems: "center",
//             gap: 4,
//           }}
//         >
//           View more{" "}
//           <Icon
//             d={IC.chevRight}
//             size={11}
//             stroke="var(--c-accent)"
//             strokeWidth={2}
//           />
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  RETENTION RATE CARD
// // ─────────────────────────────────────────────────────────────────────────────
// function RetentionCard() {
//   return (
//     <div
//       style={{
//         background: "var(--c-bg-card)",
//         border: "1px solid var(--c-border)",
//         borderRadius: 12,
//         padding: "16px 18px",
//         flex: 1,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 4,
//         }}
//       >
//         <span
//           style={{
//             fontSize: 13,
//             fontWeight: 600,
//             color: "var(--c-text-primary)",
//           }}
//         >
//           Retention Rate
//         </span>
//         <Icon d={IC.moreV} size={14} stroke="var(--c-text-muted)" />
//       </div>
//       <div style={{ marginBottom: 10 }}>
//         <span
//           style={{
//             fontSize: 24,
//             fontWeight: 800,
//             color: "var(--c-text-primary)",
//             letterSpacing: "-0.02em",
//           }}
//         >
//           95%
//         </span>
//         <span
//           style={{
//             fontSize: 11,
//             color: "var(--c-green)",
//             marginLeft: 8,
//             fontWeight: 500,
//           }}
//         >
//           +12% vs last month
//         </span>
//       </div>
//       {/* Legend */}
//       <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
//         {[
//           ["SMEs", "#7c3aed"],
//           ["Startups", "#a78bfa"],
//           ["Enterprises", "#c4b5fd"],
//         ].map(([label, color]) => (
//           <div
//             key={label}
//             style={{ display: "flex", alignItems: "center", gap: 4 }}
//           >
//             <div
//               style={{
//                 width: 7,
//                 height: 7,
//                 borderRadius: "50%",
//                 background: color,
//               }}
//             />
//             <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>
//               {label}
//             </span>
//           </div>
//         ))}
//       </div>
//       <ResponsiveContainer width="100%" height={90}>
//         <BarChart
//           data={retentionData}
//           barSize={10}
//           barGap={2}
//           margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
//         >
//           <XAxis
//             dataKey="month"
//             axisLine={false}
//             tickLine={false}
//             tick={{ fontSize: 9, fill: "var(--c-text-muted)" }}
//           />
//           <YAxis
//             axisLine={false}
//             tickLine={false}
//             tick={{ fontSize: 9, fill: "var(--c-text-muted)" }}
//             domain={[0, 100]}
//           />
//           <Bar dataKey="sme" radius={[3, 3, 0, 0]} fill="#7c3aed" />
//           <Bar dataKey="start" radius={[3, 3, 0, 0]} fill="#a78bfa" />
//           <Bar dataKey="ent" radius={[3, 3, 0, 0]} fill="#c4b5fd" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  DASHBOARD PAGE
// // ─────────────────────────────────────────────────────────────────────────────
// function DashboardPage() {
//   return (
//     <div
//       style={{
//         flex: 1,
//         overflowY: "auto",
//         padding: "16px 20px",
//         display: "flex",
//         flexDirection: "column",
//         gap: 14,
//         background: "var(--c-bg-shell)",
//       }}
//     >
//       {/* Stat Cards Row */}
//       <div style={{ display: "flex", gap: 12 }}>
//         <StatCard
//           icon={IC.contact}
//           label="Leads"
//           value="129"
//           delta="2%"
//           deltaDir="up"
//           period="vs last week"
//         />
//         <StatCard
//           icon={IC.zap}
//           label="CLV"
//           value="14d"
//           delta="4%"
//           deltaDir="down"
//           period="vs last week"
//         />
//         <StatCard
//           icon={IC.globe}
//           label="Convertion Rate"
//           value="24%"
//           delta="2%"
//           deltaDir="up"
//           period="vs last week"
//         />
//         <StatCard
//           icon={IC.reports}
//           label="Revenue"
//           value="$1.4K"
//           delta="4%"
//           deltaDir="down"
//           period="vs last month"
//         />
//       </div>

//       {/* Charts Row */}
//       <div style={{ display: "flex", gap: 12 }}>
//         <RevenueCard />
//         <CalendarCard />
//       </div>

//       {/* Bottom Row */}
//       <div style={{ display: "flex", gap: 12 }}>
//         <LeadsCard />
//         <TopCountryCard />
//         <RetentionCard />
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  ROOT APP
// // ─────────────────────────────────────────────────────────────────────────────
// export default function App() {
//   const [theme, setTheme] = useState("light");
//   const [collapsed, setCollapsed] = useState(false);
//   const [activeNav, setActiveNav] = useState("dashboard");

//   const tokens = theme === "light" ? LIGHT : DARK;

//   return (
//     <>
//       <style>{`
//         ${injectTokens(tokens)}
//         * { box-sizing: border-box; margin:0; padding:0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
//         body { background: var(--c-bg-app); }
//         ::-webkit-scrollbar { width:4px; height:4px; }
//         ::-webkit-scrollbar-track { background:transparent; }
//         ::-webkit-scrollbar-thumb { background:var(--c-border); border-radius:99px; }
//         button { font-family: inherit; }
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
//       `}</style>

//       {/* Outer shell — the grey app background with padding */}
//       <div
//         style={{
//           width: "100vw",
//           height: "100vh",
//           background: "var(--c-bg-app)",
//           padding: 16,
//           display: "flex",
//         }}
//       >
//         {/* Unified card */}
//         <div
//           style={{
//             flex: 1,
//             display: "flex",
//             borderRadius: 16,
//             overflow: "hidden",
//             border: "1px solid var(--c-border)",
//             boxShadow: "var(--c-shadow)",
//             background: "var(--c-bg-shell)",
//           }}
//         >
//           {/* Sidebar */}
//           <Sidebar
//             collapsed={collapsed}
//             onToggle={() => setCollapsed((c) => !c)}
//             activeNav={activeNav}
//             onNav={setActiveNav}
//           />

//           {/* Main area */}
//           <div
//             style={{
//               flex: 1,
//               display: "flex",
//               flexDirection: "column",
//               overflow: "hidden",
//               background: "var(--c-bg-shell)",
//             }}
//           >
//             <TopBar
//               theme={theme}
//               onThemeToggle={() =>
//                 setTheme((t) => (t === "light" ? "dark" : "light"))
//               }
//             />
//             <ActionBar />
//             <DashboardPage />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

export default function App() {
  return (
  <ThemeProvider>
  <BrowserRouter>
  
    <Routes>
      <Route path="/" element={
        <Applayout>

        </Applayout>
      }>
      </Route>
    </Routes>
 

  </BrowserRouter>
  </ThemeProvider>)
}
