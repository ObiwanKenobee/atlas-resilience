import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RadioTower, FileText, GitCompare } from "lucide-react";
import AtlasHeader from "@/components/atlas/AtlasHeader";
import ResilienceScoreRing from "@/components/atlas/ResilienceScoreRing";
import TippingPointMeter from "@/components/atlas/TippingPointMeter";
import DimensionPanel from "@/components/atlas/DimensionPanel";
import ShockSimulator from "@/components/atlas/ShockSimulator";
import SystemStressMap from "@/components/atlas/SystemStressMap";
import BufferGauges from "@/components/atlas/BufferGauges";
import RecoveryCurves from "@/components/atlas/RecoveryCurves";
import NetworkFragilityGraph from "@/components/atlas/NetworkFragilityGraph";
import HistoricalTimeline from "@/components/atlas/HistoricalTimeline";
import PlanetaryRiskMatrix from "@/components/atlas/PlanetaryRiskMatrix";
import CityReportExport from "@/components/atlas/CityReportExport";
import ComparativeMode from "@/components/atlas/ComparativeMode";
import AlertsPanel from "@/components/atlas/AlertsPanel";
import CityDetailDrawer from "@/components/atlas/CityDetailDrawer";
import { useLiveData } from "@/hooks/useLiveData";
import type { CityData } from "@/components/atlas/SystemStressMap";
import type { NetworkNode, NetworkEdge } from "@/components/atlas/NetworkFragilityGraph";
import type { AlertEvent } from "@/components/atlas/AlertsPanel";



// ─── City core dataset ────────────────────────────────────────────────────────
const CITY_META: Record<string, { name: string; region: string }> = {
  nairobi:  { name: "Nairobi",   region: "East Africa" },
  lagos:    { name: "Lagos",     region: "West Africa" },
  cairo:    { name: "Cairo",     region: "North Africa" },
  mumbai:   { name: "Mumbai",    region: "South Asia" },
  saopaulo: { name: "São Paulo", region: "South America" },
  jakarta:  { name: "Jakarta",   region: "Southeast Asia" },
  dhaka:    { name: "Dhaka",     region: "South Asia" },
  karachi:  { name: "Karachi",   region: "South Asia" },
  kinshasa: { name: "Kinshasa",  region: "Central Africa" },
  bogota:   { name: "Bogotá",    region: "South America" },
  manila:   { name: "Manila",    region: "Southeast Asia" },
  accra:    { name: "Accra",     region: "West Africa" },
};

const cityDataset: Record<
  string,
  {
    score: number;
    subscores: { label: string; value: number; icon: string }[];
    tippingProbability: number;
    trend: "rising" | "stable" | "falling";
  }
> = {
  nairobi: {
    score: 58,
    subscores: [
      { label: "REDUNDANCY", value: 65, icon: "⛓" },
      { label: "DIVERSITY", value: 70, icon: "🌿" },
      { label: "BUFFER CAP.", value: 38, icon: "🛡" },
      { label: "CONNECTIVITY", value: 80, icon: "🔗" },
      { label: "RECOVERY", value: 55, icon: "🔄" },
    ],
    tippingProbability: 41,
    trend: "rising",
  },
  lagos: {
    score: 44,
    subscores: [
      { label: "REDUNDANCY", value: 35, icon: "⛓" },
      { label: "DIVERSITY", value: 42, icon: "🌿" },
      { label: "BUFFER CAP.", value: 30, icon: "🛡" },
      { label: "CONNECTIVITY", value: 60, icon: "🔗" },
      { label: "RECOVERY", value: 55, icon: "🔄" },
    ],
    tippingProbability: 68,
    trend: "rising",
  },
  cairo: {
    score: 62,
    subscores: [
      { label: "REDUNDANCY", value: 60, icon: "⛓" },
      { label: "DIVERSITY", value: 55, icon: "🌿" },
      { label: "BUFFER CAP.", value: 58, icon: "🛡" },
      { label: "CONNECTIVITY", value: 75, icon: "🔗" },
      { label: "RECOVERY", value: 63, icon: "🔄" },
    ],
    tippingProbability: 32,
    trend: "stable",
  },
  mumbai: {
    score: 55,
    subscores: [
      { label: "REDUNDANCY", value: 50, icon: "⛓" },
      { label: "DIVERSITY", value: 68, icon: "🌿" },
      { label: "BUFFER CAP.", value: 42, icon: "🛡" },
      { label: "CONNECTIVITY", value: 72, icon: "🔗" },
      { label: "RECOVERY", value: 43, icon: "🔄" },
    ],
    tippingProbability: 54,
    trend: "rising",
  },
  saopaulo: {
    score: 67,
    subscores: [
      { label: "REDUNDANCY", value: 70, icon: "⛓" },
      { label: "DIVERSITY", value: 65, icon: "🌿" },
      { label: "BUFFER CAP.", value: 60, icon: "🛡" },
      { label: "CONNECTIVITY", value: 78, icon: "🔗" },
      { label: "RECOVERY", value: 62, icon: "🔄" },
    ],
    tippingProbability: 28,
    trend: "falling",
  },
  jakarta: {
    score: 39,
    subscores: [
      { label: "REDUNDANCY", value: 30, icon: "⛓" },
      { label: "DIVERSITY", value: 38, icon: "🌿" },
      { label: "BUFFER CAP.", value: 25, icon: "🛡" },
      { label: "CONNECTIVITY", value: 55, icon: "🔗" },
      { label: "RECOVERY", value: 47, icon: "🔄" },
    ],
    tippingProbability: 79,
    trend: "rising",
  },
  dhaka: {
    score: 34,
    subscores: [
      { label: "REDUNDANCY", value: 28, icon: "⛓" },
      { label: "DIVERSITY", value: 32, icon: "🌿" },
      { label: "BUFFER CAP.", value: 22, icon: "🛡" },
      { label: "CONNECTIVITY", value: 48, icon: "🔗" },
      { label: "RECOVERY", value: 40, icon: "🔄" },
    ],
    tippingProbability: 82,
    trend: "rising",
  },
  karachi: {
    score: 41,
    subscores: [
      { label: "REDUNDANCY", value: 38, icon: "⛓" },
      { label: "DIVERSITY", value: 35, icon: "🌿" },
      { label: "BUFFER CAP.", value: 32, icon: "🛡" },
      { label: "CONNECTIVITY", value: 55, icon: "🔗" },
      { label: "RECOVERY", value: 45, icon: "🔄" },
    ],
    tippingProbability: 71,
    trend: "rising",
  },
  kinshasa: {
    score: 31,
    subscores: [
      { label: "REDUNDANCY", value: 22, icon: "⛓" },
      { label: "DIVERSITY", value: 28, icon: "🌿" },
      { label: "BUFFER CAP.", value: 20, icon: "🛡" },
      { label: "CONNECTIVITY", value: 42, icon: "🔗" },
      { label: "RECOVERY", value: 43, icon: "🔄" },
    ],
    tippingProbability: 88,
    trend: "rising",
  },
  bogota: {
    score: 53,
    subscores: [
      { label: "REDUNDANCY", value: 55, icon: "⛓" },
      { label: "DIVERSITY", value: 60, icon: "🌿" },
      { label: "BUFFER CAP.", value: 48, icon: "🛡" },
      { label: "CONNECTIVITY", value: 62, icon: "🔗" },
      { label: "RECOVERY", value: 40, icon: "🔄" },
    ],
    tippingProbability: 47,
    trend: "stable",
  },
  manila: {
    score: 46,
    subscores: [
      { label: "REDUNDANCY", value: 40, icon: "⛓" },
      { label: "DIVERSITY", value: 45, icon: "🌿" },
      { label: "BUFFER CAP.", value: 35, icon: "🛡" },
      { label: "CONNECTIVITY", value: 62, icon: "🔗" },
      { label: "RECOVERY", value: 48, icon: "🔄" },
    ],
    tippingProbability: 65,
    trend: "rising",
  },
  accra: {
    score: 49,
    subscores: [
      { label: "REDUNDANCY", value: 48, icon: "⛓" },
      { label: "DIVERSITY", value: 52, icon: "🌿" },
      { label: "BUFFER CAP.", value: 40, icon: "🛡" },
      { label: "CONNECTIVITY", value: 58, icon: "🔗" },
      { label: "RECOVERY", value: 47, icon: "🔄" },
    ],
    tippingProbability: 55,
    trend: "stable",
  },
};

// ─── Network graph data per city ──────────────────────────────────────────────
const networkData: Record<string, { nodes: NetworkNode[]; edges: NetworkEdge[] }> = {
  nairobi: {
    nodes: [
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.85, cascadeRisk: 0.72 },
      { id: "water", label: "Water Systems", sector: "Water", dependency: 0.78, cascadeRisk: 0.68 },
      { id: "finance", label: "M-Pesa Network", sector: "Finance", dependency: 0.70, cascadeRisk: 0.55 },
      { id: "food", label: "Food Supply", sector: "Food", dependency: 0.65, cascadeRisk: 0.50 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.58, cascadeRisk: 0.45 },
      { id: "infra", label: "Road Network", sector: "Infrastructure", dependency: 0.60, cascadeRisk: 0.40 },
      { id: "eco", label: "Ecosystem", sector: "Ecosystem", dependency: 0.40, cascadeRisk: 0.30 },
    ],
    edges: [
      { source: "energy", target: "water", strength: 0.9 },
      { source: "energy", target: "health", strength: 0.8 },
      { source: "water", target: "food", strength: 0.75 },
      { source: "finance", target: "food", strength: 0.6 },
      { source: "infra", target: "food", strength: 0.55 },
      { source: "infra", target: "health", strength: 0.5 },
      { source: "eco", target: "water", strength: 0.45 },
      { source: "finance", target: "health", strength: 0.4 },
    ],
  },
  lagos: {
    nodes: [
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.92, cascadeRisk: 0.88 },
      { id: "water", label: "Water Supply", sector: "Water", dependency: 0.82, cascadeRisk: 0.75 },
      { id: "finance", label: "Banking", sector: "Finance", dependency: 0.65, cascadeRisk: 0.52 },
      { id: "food", label: "Markets", sector: "Food", dependency: 0.75, cascadeRisk: 0.65 },
      { id: "health", label: "Hospitals", sector: "Health", dependency: 0.70, cascadeRisk: 0.60 },
      { id: "port", label: "Port System", sector: "Infrastructure", dependency: 0.80, cascadeRisk: 0.70 },
    ],
    edges: [
      { source: "energy", target: "water", strength: 0.95 },
      { source: "energy", target: "health", strength: 0.9 },
      { source: "port", target: "food", strength: 0.85 },
      { source: "water", target: "food", strength: 0.7 },
      { source: "finance", target: "food", strength: 0.6 },
      { source: "port", target: "energy", strength: 0.5 },
      { source: "health", target: "water", strength: 0.5 },
    ],
  },
  cairo: {
    nodes: [
      { id: "nile", label: "Nile Water", sector: "Water", dependency: 0.95, cascadeRisk: 0.85 },
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.78, cascadeRisk: 0.60 },
      { id: "agri", label: "Agriculture", sector: "Food", dependency: 0.72, cascadeRisk: 0.65 },
      { id: "finance", label: "Finance", sector: "Finance", dependency: 0.60, cascadeRisk: 0.45 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.55, cascadeRisk: 0.40 },
      { id: "canal", label: "Suez Canal", sector: "Infrastructure", dependency: 0.70, cascadeRisk: 0.55 },
    ],
    edges: [
      { source: "nile", target: "agri", strength: 0.95 },
      { source: "nile", target: "energy", strength: 0.7 },
      { source: "agri", target: "finance", strength: 0.6 },
      { source: "canal", target: "finance", strength: 0.75 },
      { source: "energy", target: "health", strength: 0.8 },
      { source: "finance", target: "health", strength: 0.45 },
    ],
  },
  mumbai: {
    nodes: [
      { id: "finance", label: "Stock Exchange", sector: "Finance", dependency: 0.90, cascadeRisk: 0.78 },
      { id: "energy", label: "Grid", sector: "Energy", dependency: 0.82, cascadeRisk: 0.65 },
      { id: "water", label: "Reservoirs", sector: "Water", dependency: 0.75, cascadeRisk: 0.70 },
      { id: "port", label: "Port", sector: "Infrastructure", dependency: 0.85, cascadeRisk: 0.68 },
      { id: "health", label: "Hospitals", sector: "Health", dependency: 0.60, cascadeRisk: 0.45 },
      { id: "eco", label: "Mangroves", sector: "Ecosystem", dependency: 0.35, cascadeRisk: 0.55 },
    ],
    edges: [
      { source: "finance", target: "energy", strength: 0.8 },
      { source: "port", target: "finance", strength: 0.85 },
      { source: "water", target: "health", strength: 0.7 },
      { source: "eco", target: "water", strength: 0.6 },
      { source: "energy", target: "health", strength: 0.75 },
      { source: "port", target: "energy", strength: 0.65 },
    ],
  },
  saopaulo: {
    nodes: [
      { id: "water", label: "Cantareira", sector: "Water", dependency: 0.88, cascadeRisk: 0.72 },
      { id: "energy", label: "Grid", sector: "Energy", dependency: 0.75, cascadeRisk: 0.55 },
      { id: "finance", label: "B3 Exchange", sector: "Finance", dependency: 0.82, cascadeRisk: 0.60 },
      { id: "agri", label: "Agribusiness", sector: "Food", dependency: 0.70, cascadeRisk: 0.50 },
      { id: "eco", label: "Atlantic Forest", sector: "Ecosystem", dependency: 0.45, cascadeRisk: 0.65 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.60, cascadeRisk: 0.40 },
    ],
    edges: [
      { source: "water", target: "agri", strength: 0.9 },
      { source: "eco", target: "water", strength: 0.8 },
      { source: "finance", target: "energy", strength: 0.7 },
      { source: "agri", target: "finance", strength: 0.65 },
      { source: "energy", target: "health", strength: 0.75 },
      { source: "water", target: "health", strength: 0.55 },
    ],
  },
  jakarta: {
    nodes: [
      { id: "flood", label: "Flood Systems", sector: "Infrastructure", dependency: 0.95, cascadeRisk: 0.92 },
      { id: "water", label: "Groundwater", sector: "Water", dependency: 0.90, cascadeRisk: 0.88 },
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.78, cascadeRisk: 0.70 },
      { id: "food", label: "Food Supply", sector: "Food", dependency: 0.72, cascadeRisk: 0.65 },
      { id: "finance", label: "Finance", sector: "Finance", dependency: 0.65, cascadeRisk: 0.55 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.60, cascadeRisk: 0.58 },
    ],
    edges: [
      { source: "flood", target: "water", strength: 0.95 },
      { source: "water", target: "food", strength: 0.9 },
      { source: "flood", target: "energy", strength: 0.85 },
      { source: "energy", target: "health", strength: 0.8 },
      { source: "finance", target: "food", strength: 0.65 },
      { source: "water", target: "health", strength: 0.75 },
    ],
  },
  dhaka: {
    nodes: [
      { id: "flood", label: "Flood Control", sector: "Infrastructure", dependency: 0.95, cascadeRisk: 0.92 },
      { id: "water", label: "Water Supply", sector: "Water", dependency: 0.88, cascadeRisk: 0.82 },
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.72, cascadeRisk: 0.68 },
      { id: "food", label: "Food Markets", sector: "Food", dependency: 0.78, cascadeRisk: 0.70 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.65, cascadeRisk: 0.60 },
      { id: "finance", label: "Garment Trade", sector: "Finance", dependency: 0.80, cascadeRisk: 0.72 },
    ],
    edges: [
      { source: "flood", target: "water", strength: 0.95 },
      { source: "flood", target: "food", strength: 0.88 },
      { source: "water", target: "health", strength: 0.82 },
      { source: "energy", target: "health", strength: 0.75 },
      { source: "finance", target: "food", strength: 0.65 },
      { source: "flood", target: "energy", strength: 0.80 },
    ],
  },
  karachi: {
    nodes: [
      { id: "water", label: "Water Network", sector: "Water", dependency: 0.92, cascadeRisk: 0.88 },
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.85, cascadeRisk: 0.78 },
      { id: "port", label: "Port Qasim", sector: "Infrastructure", dependency: 0.88, cascadeRisk: 0.70 },
      { id: "food", label: "Food Supply", sector: "Food", dependency: 0.70, cascadeRisk: 0.65 },
      { id: "finance", label: "Finance", sector: "Finance", dependency: 0.60, cascadeRisk: 0.50 },
      { id: "health", label: "Hospitals", sector: "Health", dependency: 0.62, cascadeRisk: 0.55 },
    ],
    edges: [
      { source: "water", target: "health", strength: 0.92 },
      { source: "energy", target: "water", strength: 0.85 },
      { source: "port", target: "food", strength: 0.82 },
      { source: "energy", target: "health", strength: 0.78 },
      { source: "finance", target: "food", strength: 0.55 },
      { source: "port", target: "energy", strength: 0.60 },
    ],
  },
  kinshasa: {
    nodes: [
      { id: "energy", label: "Inga Dam Grid", sector: "Energy", dependency: 0.90, cascadeRisk: 0.88 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.85, cascadeRisk: 0.85 },
      { id: "water", label: "Water System", sector: "Water", dependency: 0.80, cascadeRisk: 0.78 },
      { id: "food", label: "Food Supply", sector: "Food", dependency: 0.78, cascadeRisk: 0.72 },
      { id: "infra", label: "Roads", sector: "Infrastructure", dependency: 0.68, cascadeRisk: 0.60 },
      { id: "eco", label: "Congo Basin", sector: "Ecosystem", dependency: 0.50, cascadeRisk: 0.40 },
    ],
    edges: [
      { source: "energy", target: "health", strength: 0.92 },
      { source: "energy", target: "water", strength: 0.88 },
      { source: "water", target: "food", strength: 0.80 },
      { source: "infra", target: "food", strength: 0.72 },
      { source: "health", target: "food", strength: 0.60 },
      { source: "eco", target: "water", strength: 0.55 },
    ],
  },
  bogota: {
    nodes: [
      { id: "water", label: "Páramo Aquifer", sector: "Water", dependency: 0.88, cascadeRisk: 0.70 },
      { id: "energy", label: "Hydro Grid", sector: "Energy", dependency: 0.80, cascadeRisk: 0.58 },
      { id: "eco", label: "Andean Ecosystem", sector: "Ecosystem", dependency: 0.72, cascadeRisk: 0.62 },
      { id: "food", label: "Food Supply", sector: "Food", dependency: 0.65, cascadeRisk: 0.50 },
      { id: "finance", label: "Finance", sector: "Finance", dependency: 0.70, cascadeRisk: 0.48 },
      { id: "infra", label: "Road Network", sector: "Infrastructure", dependency: 0.62, cascadeRisk: 0.55 },
    ],
    edges: [
      { source: "eco", target: "water", strength: 0.90 },
      { source: "water", target: "energy", strength: 0.80 },
      { source: "energy", target: "food", strength: 0.70 },
      { source: "finance", target: "food", strength: 0.60 },
      { source: "infra", target: "food", strength: 0.58 },
      { source: "water", target: "food", strength: 0.72 },
    ],
  },
  manila: {
    nodes: [
      { id: "typhoon", label: "Storm Systems", sector: "Infrastructure", dependency: 0.92, cascadeRisk: 0.90 },
      { id: "water", label: "Water Supply", sector: "Water", dependency: 0.80, cascadeRisk: 0.72 },
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.78, cascadeRisk: 0.68 },
      { id: "food", label: "Food Supply", sector: "Food", dependency: 0.70, cascadeRisk: 0.62 },
      { id: "finance", label: "Finance", sector: "Finance", dependency: 0.65, cascadeRisk: 0.52 },
      { id: "health", label: "Hospitals", sector: "Health", dependency: 0.60, cascadeRisk: 0.55 },
    ],
    edges: [
      { source: "typhoon", target: "energy", strength: 0.92 },
      { source: "typhoon", target: "water", strength: 0.88 },
      { source: "energy", target: "health", strength: 0.82 },
      { source: "water", target: "food", strength: 0.75 },
      { source: "finance", target: "food", strength: 0.58 },
      { source: "typhoon", target: "food", strength: 0.78 },
    ],
  },
  accra: {
    nodes: [
      { id: "energy", label: "Akosombo Dam", sector: "Energy", dependency: 0.88, cascadeRisk: 0.72 },
      { id: "water", label: "Water Supply", sector: "Water", dependency: 0.78, cascadeRisk: 0.65 },
      { id: "finance", label: "Finance", sector: "Finance", dependency: 0.65, cascadeRisk: 0.48 },
      { id: "food", label: "Food Markets", sector: "Food", dependency: 0.68, cascadeRisk: 0.55 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.58, cascadeRisk: 0.45 },
      { id: "port", label: "Tema Port", sector: "Infrastructure", dependency: 0.72, cascadeRisk: 0.58 },
    ],
    edges: [
      { source: "energy", target: "water", strength: 0.85 },
      { source: "energy", target: "health", strength: 0.78 },
      { source: "port", target: "food", strength: 0.80 },
      { source: "water", target: "food", strength: 0.68 },
      { source: "finance", target: "food", strength: 0.55 },
      { source: "energy", target: "food", strength: 0.62 },
    ],
  },
};

// ─── Historical data per city ─────────────────────────────────────────────────
const historicalData: Record<string, { data: { month: string; score: number }[]; events: { month: string; label: string; severity: "critical" | "high" | "medium" }[] }> = {
  nairobi: {
    data: [
      { month: "Mar", score: 62 }, { month: "Apr", score: 64 }, { month: "May", score: 58 },
      { month: "Jun", score: 53 }, { month: "Jul", score: 51 }, { month: "Aug", score: 49 },
      { month: "Sep", score: 52 }, { month: "Oct", score: 55 }, { month: "Nov", score: 60 },
      { month: "Dec", score: 57 }, { month: "Jan", score: 56 }, { month: "Feb", score: 58 },
    ],
    events: [
      { month: "Jun", label: "Drought onset — water stress surge", severity: "high" },
      { month: "Aug", label: "Crop shortfall — 28% below average", severity: "critical" },
      { month: "Nov", label: "IMF credit facility approved", severity: "medium" },
    ],
  },
  lagos: {
    data: [
      { month: "Mar", score: 48 }, { month: "Apr", score: 50 }, { month: "May", score: 47 },
      { month: "Jun", score: 43 }, { month: "Jul", score: 40 }, { month: "Aug", score: 38 },
      { month: "Sep", score: 41 }, { month: "Oct", score: 43 }, { month: "Nov", score: 46 },
      { month: "Dec", score: 44 }, { month: "Jan", score: 43 }, { month: "Feb", score: 44 },
    ],
    events: [
      { month: "Jul", label: "Grid collapse — 48h blackout", severity: "critical" },
      { month: "Aug", label: "Flooding — 1.2M displaced", severity: "critical" },
      { month: "Nov", label: "Port workers strike resolved", severity: "medium" },
    ],
  },
  cairo: {
    data: [
      { month: "Mar", score: 60 }, { month: "Apr", score: 61 }, { month: "May", score: 63 },
      { month: "Jun", score: 65 }, { month: "Jul", score: 64 }, { month: "Aug", score: 63 },
      { month: "Sep", score: 62 }, { month: "Oct", score: 61 }, { month: "Nov", score: 63 },
      { month: "Dec", score: 64 }, { month: "Jan", score: 63 }, { month: "Feb", score: 62 },
    ],
    events: [
      { month: "May", label: "Nile flow improved — dam release", severity: "medium" },
      { month: "Sep", label: "Wheat import cost spike +22%", severity: "high" },
    ],
  },
  mumbai: {
    data: [
      { month: "Mar", score: 57 }, { month: "Apr", score: 59 }, { month: "May", score: 61 },
      { month: "Jun", score: 54 }, { month: "Jul", score: 50 }, { month: "Aug", score: 48 },
      { month: "Sep", score: 52 }, { month: "Oct", score: 54 }, { month: "Nov", score: 55 },
      { month: "Dec", score: 56 }, { month: "Jan", score: 55 }, { month: "Feb", score: 55 },
    ],
    events: [
      { month: "Jun", label: "Cyclone — coastal infrastructure damage", severity: "critical" },
      { month: "Aug", label: "Reservoir at 22% capacity", severity: "high" },
      { month: "Oct", label: "Emergency water allocation ended", severity: "medium" },
    ],
  },
  saopaulo: {
    data: [
      { month: "Mar", score: 65 }, { month: "Apr", score: 66 }, { month: "May", score: 68 },
      { month: "Jun", score: 70 }, { month: "Jul", score: 69 }, { month: "Aug", score: 67 },
      { month: "Sep", score: 66 }, { month: "Oct", score: 67 }, { month: "Nov", score: 68 },
      { month: "Dec", score: 67 }, { month: "Jan", score: 66 }, { month: "Feb", score: 67 },
    ],
    events: [
      { month: "Jun", label: "Harvest surplus — food buffer +18%", severity: "medium" },
      { month: "Sep", label: "Amazon fires — air quality crisis", severity: "high" },
    ],
  },
  jakarta: {
    data: [
      { month: "Mar", score: 42 }, { month: "Apr", score: 40 }, { month: "May", score: 41 },
      { month: "Jun", score: 38 }, { month: "Jul", score: 36 }, { month: "Aug", score: 35 },
      { month: "Sep", score: 37 }, { month: "Oct", score: 38 }, { month: "Nov", score: 40 },
      { month: "Dec", score: 39 }, { month: "Jan", score: 39 }, { month: "Feb", score: 39 },
    ],
    events: [
      { month: "Jun", label: "Coastal flooding — 3m inundation", severity: "critical" },
      { month: "Aug", label: "Groundwater subsidence accelerating", severity: "critical" },
      { month: "Nov", label: "Capital relocation plan announced", severity: "medium" },
    ],
  },
  dhaka: {
    data: [
      { month: "Mar", score: 36 }, { month: "Apr", score: 38 }, { month: "May", score: 35 },
      { month: "Jun", score: 30 }, { month: "Jul", score: 28 }, { month: "Aug", score: 27 },
      { month: "Sep", score: 30 }, { month: "Oct", score: 33 }, { month: "Nov", score: 35 },
      { month: "Dec", score: 34 }, { month: "Jan", score: 34 }, { month: "Feb", score: 34 },
    ],
    events: [
      { month: "Jun", label: "Monsoon surge — 14 districts inundated", severity: "critical" },
      { month: "Aug", label: "Cyclone landfall — coastal breaches", severity: "critical" },
      { month: "Oct", label: "Flood relief operations concluded", severity: "medium" },
    ],
  },
  karachi: {
    data: [
      { month: "Mar", score: 43 }, { month: "Apr", score: 44 }, { month: "May", score: 42 },
      { month: "Jun", score: 39 }, { month: "Jul", score: 37 }, { month: "Aug", score: 38 },
      { month: "Sep", score: 40 }, { month: "Oct", score: 41 }, { month: "Nov", score: 42 },
      { month: "Dec", score: 41 }, { month: "Jan", score: 41 }, { month: "Feb", score: 41 },
    ],
    events: [
      { month: "Jun", label: "Heatwave — 49°C peak, grid failure", severity: "critical" },
      { month: "Sep", label: "Indus delta saltwater intrusion", severity: "high" },
      { month: "Nov", label: "Emergency water rationing lifted", severity: "medium" },
    ],
  },
  kinshasa: {
    data: [
      { month: "Mar", score: 33 }, { month: "Apr", score: 32 }, { month: "May", score: 31 },
      { month: "Jun", score: 29 }, { month: "Jul", score: 28 }, { month: "Aug", score: 27 },
      { month: "Sep", score: 29 }, { month: "Oct", score: 30 }, { month: "Nov", score: 31 },
      { month: "Dec", score: 31 }, { month: "Jan", score: 31 }, { month: "Feb", score: 31 },
    ],
    events: [
      { month: "Jul", label: "Cholera outbreak — 3 zones overwhelmed", severity: "critical" },
      { month: "Sep", label: "Inga Dam output cut by 60%", severity: "critical" },
      { month: "Nov", label: "WHO emergency response deployed", severity: "medium" },
    ],
  },
  bogota: {
    data: [
      { month: "Mar", score: 55 }, { month: "Apr", score: 56 }, { month: "May", score: 54 },
      { month: "Jun", score: 52 }, { month: "Jul", score: 50 }, { month: "Aug", score: 51 },
      { month: "Sep", score: 52 }, { month: "Oct", score: 53 }, { month: "Nov", score: 54 },
      { month: "Dec", score: 53 }, { month: "Jan", score: 53 }, { month: "Feb", score: 53 },
    ],
    events: [
      { month: "Jun", label: "Páramo aquifer recharge −18%", severity: "high" },
      { month: "Aug", label: "Landslide disrupts highway", severity: "medium" },
    ],
  },
  manila: {
    data: [
      { month: "Mar", score: 48 }, { month: "Apr", score: 49 }, { month: "May", score: 47 },
      { month: "Jun", score: 44 }, { month: "Jul", score: 41 }, { month: "Aug", score: 40 },
      { month: "Sep", score: 43 }, { month: "Oct", score: 45 }, { month: "Nov", score: 46 },
      { month: "Dec", score: 46 }, { month: "Jan", score: 46 }, { month: "Feb", score: 46 },
    ],
    events: [
      { month: "Jul", label: "Typhoon landfall — 1.2M evacuated", severity: "critical" },
      { month: "Sep", label: "Marikina river levee breach", severity: "high" },
      { month: "Nov", label: "Typhoon season ends", severity: "medium" },
    ],
  },
  accra: {
    data: [
      { month: "Mar", score: 51 }, { month: "Apr", score: 52 }, { month: "May", score: 50 },
      { month: "Jun", score: 48 }, { month: "Jul", score: 47 }, { month: "Aug", score: 47 },
      { month: "Sep", score: 48 }, { month: "Oct", score: 49 }, { month: "Nov", score: 50 },
      { month: "Dec", score: 49 }, { month: "Jan", score: 49 }, { month: "Feb", score: 49 },
    ],
    events: [
      { month: "Jun", label: "Akosombo dam output −35%", severity: "high" },
      { month: "Aug", label: "Load shedding extended to 14h/day", severity: "high" },
      { month: "Oct", label: "New solar capacity online", severity: "medium" },
    ],
  },
};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AtlasHeader theme={theme} onThemeToggle={() => setTheme((t) => t === "dark" ? "light" : "dark")} />

      <main className="flex-1 p-3 md:p-6 space-y-3 md:space-y-5 max-w-[1600px] mx-auto w-full">

        {/* Control toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between px-3 md:px-4 py-2.5 rounded-lg border border-border bg-card flex-wrap gap-2"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live feed toggle */}
            <button
              onClick={() => setLiveMode((v) => !v)}
              className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded border transition-all ${
                liveMode
                  ? "border-healthy/50 bg-healthy/10 text-healthy"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${liveMode ? "bg-healthy pulse-dot" : "bg-muted-foreground"}`} />
              <RadioTower className="w-3 h-3" />
              <span className="hidden sm:inline">{liveMode ? "LIVE FEED ACTIVE" : "ENABLE LIVE FEED"}</span>
              <span className="sm:hidden">{liveMode ? "LIVE" : "OFFLINE"}</span>
            </button>
            <AnimatePresence>
              {liveMode && lastUpdate && (
                <motion.span
                  key={tickCount}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-mono text-muted-foreground hidden sm:inline"
                >
                  tick #{tickCount} · {lastUpdate.toLocaleTimeString()}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            {/* Compare button */}
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 md:px-3 py-1.5 rounded border border-border text-muted-foreground hover:border-accent/50 hover:text-accent transition-all"
            >
              <GitCompare className="w-3 h-3" />
              <span className="hidden sm:inline">COMPARE CITIES</span>
              <span className="sm:hidden">COMPARE</span>
            </button>
            {/* Export button */}
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 md:px-3 py-1.5 rounded border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
            >
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">EXPORT REPORT</span>
              <span className="sm:hidden">EXPORT</span>
            </button>
          </div>
        </motion.div>

        {/* Hero row: Map full width */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
          <SystemStressMap onSelectCity={handleCitySelect} />
        </motion.div>

        {/* Alerts & Notifications panel — full width */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
          <AlertsPanel selectedCityId={selectedCityId} onAlertsChange={handleAlertsChange} />
        </motion.div>

        {/* Planetary Risk Matrix — full width */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}>
          <PlanetaryRiskMatrix
            cities={riskMatrixCities}
            selectedCityId={selectedCityId}
            onSelectCity={(id) => {
              const labels: Record<string, { name: string; region: string }> = {
                nairobi: { name: "Nairobi", region: "East Africa" },
                lagos: { name: "Lagos", region: "West Africa" },
                cairo: { name: "Cairo", region: "North Africa" },
                mumbai: { name: "Mumbai", region: "South Asia" },
                saopaulo: { name: "São Paulo", region: "South America" },
                jakarta: { name: "Jakarta", region: "Southeast Asia" },
              };
              setSelectedCityId(id);
              setSelectedCityLabel(labels[id]);
            }}
          />
        </motion.div>

        {/* Primary info row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}>
            <ResilienceScoreRing
              key={`${selectedCityId}-${liveMode ? tickCount : 0}`}
              score={displayedMetrics.score}
              subscores={displayedMetrics.subscores}
              city={selectedCityLabel.name}
              region={selectedCityLabel.region}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.25 }}>
            <TippingPointMeter
              probability={displayedMetrics.tippingProbability}
              trend={cityInfo.trend}
              signals={tippingSignals}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <DimensionPanel dimensions={cityDimensions(selectedCityId)} />
          </motion.div>
        </div>

        {/* Network + Historical row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.4 }}>
            <NetworkFragilityGraph
              key={selectedCityId}
              nodes={netGraph.nodes}
              edges={netGraph.edges}
              cityName={selectedCityLabel.name}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.5 }}>
            <HistoricalTimeline
              cityName={selectedCityLabel.name}
              data={histData.data}
              shockEvents={histData.events}
            />
          </motion.div>
        </div>

        {/* Secondary row: Buffers + Recovery + Shock sim */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.45 }}>
            <BufferGauges buffers={bufferData} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.55 }}>
            <RecoveryCurves systems={recoverySystemData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.65 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <ShockSimulator />
          </motion.div>
        </div>

        {/* Footer credit line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center text-[10px] font-mono text-muted-foreground pb-2"
        >
          ATLAS — Civilizational Resilience Monitor • Nature always chooses resilience over efficiency
        </motion.p>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showReport && (
          <CityReportExport
            cityName={selectedCityLabel.name}
            region={selectedCityLabel.region}
            score={displayedMetrics.score}
            subscores={displayedMetrics.subscores}
            tippingProbability={displayedMetrics.tippingProbability}
            trend={cityInfo.trend}
            shockEvents={histData.events}
            onClose={() => setShowReport(false)}
          />
        )}
        {showCompare && (
          <ComparativeMode
            cityA={buildCompareCity(compareCityAId)}
            cityB={buildCompareCity(compareCityBId)}
            onClose={() => setShowCompare(false)}
            allCityIds={Object.keys(cityDataset)}
            onChangeCityA={setCompareCityAId}
            onChangeCityB={setCompareCityBId}
            cityNames={cityNameMap}
          />
        )}
      </AnimatePresence>

      {/* City Detail Drawer */}
      <CityDetailDrawer
        city={drawerCity}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onExport={() => { setDrawerOpen(false); setShowReport(true); }}
        onCompare={() => {
          if (drawerCity) {
            setCompareCityAId(drawerCity.id);
            setCompareCityBId(drawerCity.id === "jakarta" ? "saopaulo" : "jakarta");
          }
          setDrawerOpen(false);
          setShowCompare(true);
        }}
        alerts={liveAlerts}
        tippingProbability={cityInfo.tippingProbability}
        trend={cityInfo.trend}
      />
    </div>
  );
};

export default Index;
