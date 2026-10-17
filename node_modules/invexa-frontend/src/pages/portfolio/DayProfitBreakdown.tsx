import { useMemo, useState } from 'react'
import {
	ArrowDownRight,
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	Calendar as CalendarIcon,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	Download,
	Layers,
	Receipt,
	TrendingDown,
	TrendingUp,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'

export interface OrderRecord {
	id: string
	time: string
	symbol: string
	name: string
	side: 'BUY' | 'SELL'
	type: 'LIMIT' | 'MARKET'
	product: 'MIS' | 'CNC'
	quantity: number
	price: number
	value: number
	fee: number
	status: 'FILLED' | 'CANCELLED' | 'REJECTED'
}

export interface AssetContribution {
	symbol: string
	name: string
	type: 'CNC Holding' | 'Intraday MIS' | 'CNC Holding & MIS'
	shares: number
	dayChangePct: number
	pnlAmount: number
	contributionPct: number
	positive: boolean
}

export interface DaySessionData {
	id: string
	dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'
	dayIndex: number // 1 to 5
	weekNumber: 1 | 2 | 3
	dateLabel: string
	fullDate: string
	netProfit: number
	percentChange: number
	startingCapital: number
	endingCapital: number
	realizedPnl: number
	unrealizedMtm: number
	totalCharges: number
	turnover: number
	winRate: number
	totalOrders: number
	isMonday: boolean
	orders: OrderRecord[]
	contributions: AssetContribution[]
}

export const allDaySessions: Record<string, DaySessionData> = {
	// ================= WEEK 1 (29 Sep - 03 Oct 2026) =================
	d1: {
		id: 'd1',
		dayOfWeek: 'Mon',
		dayIndex: 1,
		weekNumber: 1,
		dateLabel: '29 Sep',
		fullDate: 'Monday, 29 Sep 2026',
		netProfit: 840.50,
		percentChange: 0.55,
		startingCapital: 148500.00,
		endingCapital: 149340.50,
		realizedPnl: 410.00,
		unrealizedMtm: 485.50,
		totalCharges: 55.00,
		turnover: 112000.00,
		winRate: 100,
		totalOrders: 4,
		isMonday: true,
		orders: [
			{ id: 'ORD-20260929-001', time: '09:22:15 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 30, price: 825.00, value: 24750.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20260929-002', time: '10:35:45 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 30, price: 834.50, value: 25035.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20260929-003', time: '01:10:00 PM', symbol: 'RELIANCE', name: 'Reliance Industries Limited', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 5, price: 2940.00, value: 14700.00, fee: 0.00, status: 'FILLED' },
			{ id: 'ORD-20260929-004', time: '03:15:20 PM', symbol: 'HDFCBANK', name: 'HDFC Bank Limited', side: 'BUY', type: 'MARKET', product: 'CNC', quantity: 8, price: 1715.00, value: 13720.00, fee: 15.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'Intraday MIS', shares: 30, dayChangePct: 1.15, pnlAmount: 285.00, contributionPct: 33.9, positive: true },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 0.85, pnlAmount: 310.00, contributionPct: 36.8, positive: true },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: 0.60, pnlAmount: 195.50, contributionPct: 23.2, positive: true },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: 0.40, pnlAmount: 105.00, contributionPct: 12.5, positive: true },
			{ symbol: 'INFY', name: 'Infosys Limited', type: 'CNC Holding', shares: 20, dayChangePct: -0.15, pnlAmount: -55.00, contributionPct: -6.4, positive: false },
		],
	},
	d2: {
		id: 'd2',
		dayOfWeek: 'Tue',
		dayIndex: 2,
		weekNumber: 1,
		dateLabel: '30 Sep',
		fullDate: 'Tuesday, 30 Sep 2026',
		netProfit: 420.10,
		percentChange: 0.28,
		startingCapital: 149340.50,
		endingCapital: 149760.60,
		realizedPnl: 220.00,
		unrealizedMtm: 238.10,
		totalCharges: 38.00,
		turnover: 76500.00,
		winRate: 100,
		totalOrders: 3,
		isMonday: false,
		orders: [
			{ id: 'ORD-20260930-001', time: '09:30:12 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 40, price: 948.00, value: 37920.00, fee: 19.00, status: 'FILLED' },
			{ id: 'ORD-20260930-002', time: '11:10:04 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 40, price: 953.50, value: 38140.00, fee: 19.00, status: 'FILLED' },
			{ id: 'ORD-20260930-003', time: '02:45:00 PM', symbol: 'INFY', name: 'Infosys Limited', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 5, price: 1920.00, value: 9600.00, fee: 0.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'TATAMOTORS', name: 'Tata Motors Limited', type: 'Intraday MIS', shares: 40, dayChangePct: 0.58, pnlAmount: 220.00, contributionPct: 52.4, positive: true },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 0.42, pnlAmount: 152.00, contributionPct: 36.2, positive: true },
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'CNC Holding', shares: 20, dayChangePct: 0.35, pnlAmount: 86.10, contributionPct: 20.5, positive: true },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: -0.18, pnlAmount: -38.00, contributionPct: -9.1, positive: false },
		],
	},
	d3: {
		id: 'd3',
		dayOfWeek: 'Wed',
		dayIndex: 3,
		weekNumber: 1,
		dateLabel: '01 Oct',
		fullDate: 'Wednesday, 01 Oct 2026',
		netProfit: -610.40,
		percentChange: -0.40,
		startingCapital: 149760.60,
		endingCapital: 149150.20,
		realizedPnl: -290.00,
		unrealizedMtm: -280.40,
		totalCharges: 40.00,
		turnover: 84200.00,
		winRate: 0,
		totalOrders: 3,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261001-001', time: '09:25:30 AM', symbol: 'INFY', name: 'Infosys Limited', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 25, price: 1930.00, value: 48250.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261001-002', time: '10:45:12 AM', symbol: 'INFY', name: 'Infosys Limited', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 25, price: 1918.40, value: 47960.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261001-003', time: '02:15:00 PM', symbol: 'SBIN', name: 'State Bank of India', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 5, price: 828.00, value: 4140.00, fee: 0.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'INFY', name: 'Infosys Limited', type: 'Intraday MIS', shares: 25, dayChangePct: -0.60, pnlAmount: -290.00, contributionPct: 47.5, positive: false },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: -0.55, pnlAmount: -180.40, contributionPct: 29.5, positive: false },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: -0.28, pnlAmount: -100.00, contributionPct: 16.4, positive: false },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: -0.15, pnlAmount: -40.00, contributionPct: 6.6, positive: false },
		],
	},
	d4: {
		id: 'd4',
		dayOfWeek: 'Thu',
		dayIndex: 4,
		weekNumber: 1,
		dateLabel: '02 Oct',
		fullDate: 'Thursday, 02 Oct 2026',
		netProfit: 980.20,
		percentChange: 0.64,
		startingCapital: 149150.20,
		endingCapital: 150130.40,
		realizedPnl: 510.00,
		unrealizedMtm: 518.20,
		totalCharges: 48.00,
		turnover: 98600.00,
		winRate: 100,
		totalOrders: 4,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261002-001', time: '09:20:00 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 35, price: 830.00, value: 29050.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261002-002', time: '11:30:10 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 35, price: 842.00, value: 29470.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261002-003', time: '01:50:30 PM', symbol: 'RELIANCE', name: 'Reliance Industries Limited', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 4, price: 2950.00, value: 11800.00, fee: 4.00, status: 'FILLED' },
			{ id: 'ORD-20261002-004', time: '03:10:00 PM', symbol: 'HDFCBANK', name: 'HDFC Bank Limited', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 6, price: 1720.00, value: 10320.00, fee: 4.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'Intraday MIS', shares: 35, dayChangePct: 1.45, pnlAmount: 420.00, contributionPct: 42.8, positive: true },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 0.90, pnlAmount: 320.00, contributionPct: 32.6, positive: true },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: 0.65, pnlAmount: 168.20, contributionPct: 17.2, positive: true },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: 0.35, pnlAmount: 120.00, contributionPct: 12.2, positive: true },
			{ symbol: 'INFY', name: 'Infosys Limited', type: 'CNC Holding', shares: 20, dayChangePct: -0.12, pnlAmount: -48.00, contributionPct: -4.8, positive: false },
		],
	},
	d5: {
		id: 'd5',
		dayOfWeek: 'Fri',
		dayIndex: 5,
		weekNumber: 1,
		dateLabel: '03 Oct',
		fullDate: 'Friday, 03 Oct 2026',
		netProfit: 1350.00,
		percentChange: 0.89,
		startingCapital: 150130.40,
		endingCapital: 151480.40,
		realizedPnl: 720.00,
		unrealizedMtm: 692.00,
		totalCharges: 62.00,
		turnover: 138000.00,
		winRate: 100,
		totalOrders: 5,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261003-001', time: '09:18:00 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 60, price: 950.00, value: 57000.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261003-002', time: '11:22:15 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 60, price: 962.00, value: 57720.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261003-003', time: '01:30:00 PM', symbol: 'RELIANCE', name: 'Reliance Industries Limited', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 5, price: 2960.00, value: 14800.00, fee: 7.00, status: 'FILLED' },
			{ id: 'ORD-20261003-004', time: '02:40:00 PM', symbol: 'TCS', name: 'Tata Consultancy Services', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 2, price: 4060.00, value: 8120.00, fee: 8.00, status: 'FILLED' },
			{ id: 'ORD-20261003-005', time: '03:15:00 PM', symbol: 'SBIN', name: 'State Bank of India', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 10, price: 835.00, value: 8350.00, fee: 7.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'TATAMOTORS', name: 'Tata Motors Limited', type: 'Intraday MIS', shares: 60, dayChangePct: 1.26, pnlAmount: 720.00, contributionPct: 53.3, positive: true },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 1.05, pnlAmount: 380.00, contributionPct: 28.1, positive: true },
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'CNC Holding', shares: 20, dayChangePct: 0.95, pnlAmount: 160.00, contributionPct: 11.9, positive: true },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: 0.60, pnlAmount: 152.00, contributionPct: 11.3, positive: true },
		],
	},

	// ================= WEEK 2 (06 Oct - 10 Oct 2026) =================
	d6: {
		id: 'd6',
		dayOfWeek: 'Mon',
		dayIndex: 1,
		weekNumber: 2,
		dateLabel: '06 Oct',
		fullDate: 'Monday, 06 Oct 2026',
		netProfit: -480.60,
		percentChange: -0.31,
		startingCapital: 151200.00,
		endingCapital: 150719.40,
		realizedPnl: -180.00,
		unrealizedMtm: -260.60,
		totalCharges: 40.00,
		turnover: 68400.00,
		winRate: 33,
		totalOrders: 3,
		isMonday: true,
		orders: [
			{ id: 'ORD-20261006-001', time: '09:20:11 AM', symbol: 'INFY', name: 'Infosys Limited', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 20, price: 1915.00, value: 38300.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261006-002', time: '11:45:22 AM', symbol: 'INFY', name: 'Infosys Limited', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 20, price: 1906.00, value: 38120.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261006-003', time: '02:30:15 PM', symbol: 'TCS', name: 'Tata Consultancy Services', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 2, price: 4080.00, value: 8160.00, fee: 0.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'INFY', name: 'Infosys Limited', type: 'Intraday MIS', shares: 20, dayChangePct: -0.47, pnlAmount: -180.00, contributionPct: 37.5, positive: false },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: -0.22, pnlAmount: -78.00, contributionPct: 16.2, positive: false },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: -0.35, pnlAmount: -91.20, contributionPct: 18.9, positive: false },
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'CNC Holding', shares: 20, dayChangePct: -0.42, pnlAmount: -71.40, contributionPct: 14.8, positive: false },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: 0.15, pnlAmount: 40.00, contributionPct: -8.3, positive: true },
		],
	},
	d7: {
		id: 'd7',
		dayOfWeek: 'Tue',
		dayIndex: 2,
		weekNumber: 2,
		dateLabel: '07 Oct',
		fullDate: 'Tuesday, 07 Oct 2026',
		netProfit: 1120.40,
		percentChange: 0.73,
		startingCapital: 150719.40,
		endingCapital: 151839.80,
		realizedPnl: 580.00,
		unrealizedMtm: 596.40,
		totalCharges: 56.00,
		turnover: 124000.00,
		winRate: 100,
		totalOrders: 4,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261007-001', time: '09:25:00 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 40, price: 832.00, value: 33280.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261007-002', time: '11:50:30 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 40, price: 846.50, value: 33860.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261007-003', time: '01:40:00 PM', symbol: 'RELIANCE', name: 'Reliance Industries Limited', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 4, price: 2955.00, value: 11820.00, fee: 8.00, status: 'FILLED' },
			{ id: 'ORD-20261007-004', time: '02:55:00 PM', symbol: 'HDFCBANK', name: 'HDFC Bank Limited', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 6, price: 1725.00, value: 10350.00, fee: 8.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'Intraday MIS', shares: 40, dayChangePct: 1.74, pnlAmount: 580.00, contributionPct: 51.8, positive: true },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 0.95, pnlAmount: 340.00, contributionPct: 30.3, positive: true },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: 0.70, pnlAmount: 180.40, contributionPct: 16.1, positive: true },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: 0.32, pnlAmount: 76.00, contributionPct: 6.8, positive: true },
		],
	},
	d8: {
		id: 'd8',
		dayOfWeek: 'Wed',
		dayIndex: 3,
		weekNumber: 2,
		dateLabel: '08 Oct',
		fullDate: 'Wednesday, 08 Oct 2026',
		netProfit: 690.30,
		percentChange: 0.45,
		startingCapital: 151839.80,
		endingCapital: 152530.10,
		realizedPnl: 310.00,
		unrealizedMtm: 422.30,
		totalCharges: 42.00,
		turnover: 88500.00,
		winRate: 80,
		totalOrders: 4,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261008-001', time: '09:35:10 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 30, price: 952.00, value: 28560.00, fee: 18.00, status: 'FILLED' },
			{ id: 'ORD-20261008-002', time: '11:15:40 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 30, price: 962.30, value: 28869.00, fee: 18.00, status: 'FILLED' },
			{ id: 'ORD-20261008-003', time: '01:20:00 PM', symbol: 'INFY', name: 'Infosys Limited', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 5, price: 1918.00, value: 9590.00, fee: 3.00, status: 'FILLED' },
			{ id: 'ORD-20261008-004', time: '02:40:00 PM', symbol: 'TCS', name: 'Tata Consultancy Services', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 2, price: 4090.00, value: 8180.00, fee: 3.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'TATAMOTORS', name: 'Tata Motors Limited', type: 'Intraday MIS', shares: 30, dayChangePct: 1.08, pnlAmount: 309.00, contributionPct: 44.8, positive: true },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 0.65, pnlAmount: 232.00, contributionPct: 33.6, positive: true },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: 0.48, pnlAmount: 124.30, contributionPct: 18.0, positive: true },
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'CNC Holding', shares: 20, dayChangePct: 0.28, pnlAmount: 67.00, contributionPct: 9.7, positive: true },
		],
	},
	d9: {
		id: 'd9',
		dayOfWeek: 'Thu',
		dayIndex: 4,
		weekNumber: 2,
		dateLabel: '09 Oct',
		fullDate: 'Thursday, 09 Oct 2026',
		netProfit: -320.00,
		percentChange: -0.21,
		startingCapital: 152530.10,
		endingCapital: 152210.10,
		realizedPnl: -110.00,
		unrealizedMtm: -178.00,
		totalCharges: 32.00,
		turnover: 58000.00,
		winRate: 50,
		totalOrders: 3,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261009-001', time: '09:28:15 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 20, price: 840.00, value: 16800.00, fee: 16.00, status: 'FILLED' },
			{ id: 'ORD-20261009-002', time: '10:45:00 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 20, price: 834.50, value: 16690.00, fee: 16.00, status: 'FILLED' },
			{ id: 'ORD-20261009-003', time: '02:30:00 PM', symbol: 'RELIANCE', name: 'Reliance Industries Limited', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 3, price: 2960.00, value: 8880.00, fee: 0.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'Intraday MIS', shares: 20, dayChangePct: -0.65, pnlAmount: -110.00, contributionPct: 34.4, positive: false },
			{ symbol: 'INFY', name: 'Infosys Limited', type: 'CNC Holding', shares: 20, dayChangePct: -0.40, pnlAmount: -152.00, contributionPct: 47.5, positive: false },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: -0.18, pnlAmount: -46.00, contributionPct: 14.4, positive: false },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: 0.08, pnlAmount: 20.00, contributionPct: -6.2, positive: true },
		],
	},
	d10: {
		id: 'd10',
		dayOfWeek: 'Fri',
		dayIndex: 5,
		weekNumber: 2,
		dateLabel: '10 Oct',
		fullDate: 'Friday, 10 Oct 2026',
		netProfit: 1540.80,
		percentChange: 1.01,
		startingCapital: 152210.10,
		endingCapital: 153750.90,
		realizedPnl: 830.00,
		unrealizedMtm: 782.80,
		totalCharges: 72.00,
		turnover: 165000.00,
		winRate: 100,
		totalOrders: 5,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261010-001', time: '09:18:30 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 50, price: 955.00, value: 47750.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261010-002', time: '11:35:10 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 50, price: 971.60, value: 48580.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261010-003', time: '01:15:00 PM', symbol: 'RELIANCE', name: 'Reliance Industries Limited', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 5, price: 2965.00, value: 14825.00, fee: 12.00, status: 'FILLED' },
			{ id: 'ORD-20261010-004', time: '02:20:00 PM', symbol: 'HDFCBANK', name: 'HDFC Bank Limited', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 8, price: 1730.00, value: 13840.00, fee: 10.00, status: 'FILLED' },
			{ id: 'ORD-20261010-005', time: '03:10:00 PM', symbol: 'TCS', name: 'Tata Consultancy Services', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 2, price: 4095.00, value: 8190.00, fee: 10.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'TATAMOTORS', name: 'Tata Motors Limited', type: 'Intraday MIS', shares: 50, dayChangePct: 1.74, pnlAmount: 830.00, contributionPct: 53.9, positive: true },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 1.15, pnlAmount: 410.00, contributionPct: 26.6, positive: true },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: 0.82, pnlAmount: 212.80, contributionPct: 13.8, positive: true },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: 0.50, pnlAmount: 160.00, contributionPct: 10.4, positive: true },
		],
	},

	// ================= WEEK 3 (13 Oct - 17 Oct 2026 - Current Week) =================
	d11: {
		id: 'd11',
		dayOfWeek: 'Mon',
		dayIndex: 1,
		weekNumber: 3,
		dateLabel: '13 Oct',
		fullDate: 'Monday, 13 Oct 2026',
		netProfit: 1260.40,
		percentChange: 0.82,
		startingCapital: 153740.00,
		endingCapital: 155000.40,
		realizedPnl: 640.00,
		unrealizedMtm: 695.00,
		totalCharges: 74.60,
		turnover: 148250.00,
		winRate: 80,
		totalOrders: 5,
		isMonday: true,
		orders: [
			{ id: 'ORD-20261013-001', time: '09:18:24 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 20, price: 832.00, value: 16640.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261013-002', time: '09:45:10 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'BUY', type: 'MARKET', product: 'MIS', quantity: 50, price: 958.00, value: 47900.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261013-003', time: '11:32:05 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 10, price: 842.15, value: 8421.50, fee: 14.80, status: 'FILLED' },
			{ id: 'ORD-20261013-004', time: '01:14:40 PM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 50, price: 968.40, value: 48420.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261013-005', time: '02:50:18 PM', symbol: 'RELIANCE', name: 'Reliance Industries Limited', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 9, price: 2975.00, value: 26775.00, fee: 0.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 1.12, pnlAmount: 397.20, contributionPct: 31.5, positive: true },
			{ symbol: 'TATAMOTORS', name: 'Tata Motors Limited', type: 'Intraday MIS', shares: 50, dayChangePct: 1.09, pnlAmount: 520.00, contributionPct: 41.2, positive: true },
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'CNC Holding & MIS', shares: 20, dayChangePct: 1.40, pnlAmount: 218.00, contributionPct: 17.3, positive: true },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: 0.88, pnlAmount: 228.00, contributionPct: 18.1, positive: true },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: 0.45, pnlAmount: 148.00, contributionPct: 11.7, positive: true },
			{ symbol: 'INFY', name: 'Infosys Limited', type: 'CNC Holding', shares: 20, dayChangePct: -0.62, pnlAmount: -250.80, contributionPct: -19.8, positive: false },
		],
	},
	d12: {
		id: 'd12',
		dayOfWeek: 'Tue',
		dayIndex: 2,
		weekNumber: 3,
		dateLabel: '14 Oct',
		fullDate: 'Tuesday, 14 Oct 2026',
		netProfit: -540.20,
		percentChange: -0.35,
		startingCapital: 155000.40,
		endingCapital: 154460.20,
		realizedPnl: -220.00,
		unrealizedMtm: -278.20,
		totalCharges: 42.00,
		turnover: 72800.00,
		winRate: 25,
		totalOrders: 4,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261014-001', time: '09:22:10 AM', symbol: 'INFY', name: 'Infosys Limited', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 20, price: 1925.00, value: 38500.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261014-002', time: '11:10:45 AM', symbol: 'INFY', name: 'Infosys Limited', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 20, price: 1914.00, value: 38280.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261014-003', time: '01:45:00 PM', symbol: 'SBIN', name: 'State Bank of India', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 5, price: 835.00, value: 4175.00, fee: 1.00, status: 'FILLED' },
			{ id: 'ORD-20261014-004', time: '02:50:00 PM', symbol: 'HDFCBANK', name: 'HDFC Bank Limited', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 4, price: 1728.00, value: 6912.00, fee: 1.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'INFY', name: 'Infosys Limited', type: 'Intraday MIS', shares: 20, dayChangePct: -0.57, pnlAmount: -220.00, contributionPct: 40.7, positive: false },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: -0.32, pnlAmount: -114.20, contributionPct: 21.1, positive: false },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: -0.28, pnlAmount: -92.00, contributionPct: 17.0, positive: false },
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'CNC Holding', shares: 20, dayChangePct: -0.35, pnlAmount: -72.00, contributionPct: 13.3, positive: false },
		],
	},
	d13: {
		id: 'd13',
		dayOfWeek: 'Wed',
		dayIndex: 3,
		weekNumber: 3,
		dateLabel: '15 Oct',
		fullDate: 'Wednesday, 15 Oct 2026',
		netProfit: 910.70,
		percentChange: 0.59,
		startingCapital: 154460.20,
		endingCapital: 155370.90,
		realizedPnl: 450.00,
		unrealizedMtm: 512.70,
		totalCharges: 52.00,
		turnover: 104500.00,
		winRate: 85,
		totalOrders: 4,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261015-001', time: '09:25:40 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 35, price: 834.00, value: 29190.00, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261015-002', time: '11:40:15 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 35, price: 846.85, value: 29639.75, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261015-003', time: '01:30:00 PM', symbol: 'RELIANCE', name: 'Reliance Industries Limited', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 4, price: 2970.00, value: 11880.00, fee: 6.00, status: 'FILLED' },
			{ id: 'ORD-20261015-004', time: '02:45:00 PM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 10, price: 960.00, value: 9600.00, fee: 6.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'Intraday MIS', shares: 35, dayChangePct: 1.54, pnlAmount: 449.75, contributionPct: 49.4, positive: true },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 0.78, pnlAmount: 278.00, contributionPct: 30.5, positive: true },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: 0.52, pnlAmount: 135.20, contributionPct: 14.8, positive: true },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: 0.30, pnlAmount: 99.50, contributionPct: 10.9, positive: true },
			{ symbol: 'INFY', name: 'Infosys Limited', type: 'CNC Holding', shares: 20, dayChangePct: -0.12, pnlAmount: -51.75, contributionPct: -5.7, positive: false },
		],
	},
	d14: {
		id: 'd14',
		dayOfWeek: 'Thu',
		dayIndex: 4,
		weekNumber: 3,
		dateLabel: '16 Oct',
		fullDate: 'Thursday, 16 Oct 2026',
		netProfit: 620.00,
		percentChange: 0.41,
		startingCapital: 155370.90,
		endingCapital: 155990.90,
		realizedPnl: 290.00,
		unrealizedMtm: 368.00,
		totalCharges: 38.00,
		turnover: 82000.00,
		winRate: 75,
		totalOrders: 3,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261016-001', time: '09:30:00 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 30, price: 961.00, value: 28830.00, fee: 18.00, status: 'FILLED' },
			{ id: 'ORD-20261016-002', time: '11:20:00 AM', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 30, price: 970.65, value: 29119.50, fee: 18.00, status: 'FILLED' },
			{ id: 'ORD-20261016-003', time: '02:10:00 PM', symbol: 'HDFCBANK', name: 'HDFC Bank Limited', side: 'BUY', type: 'CNC', product: 'CNC', quantity: 5, price: 1735.00, value: 8675.00, fee: 2.00, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'TATAMOTORS', name: 'Tata Motors Limited', type: 'Intraday MIS', shares: 30, dayChangePct: 1.00, pnlAmount: 289.50, contributionPct: 46.7, positive: true },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 0.55, pnlAmount: 196.00, contributionPct: 31.6, positive: true },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: 0.40, pnlAmount: 104.50, contributionPct: 16.9, positive: true },
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'CNC Holding', shares: 20, dayChangePct: 0.25, pnlAmount: 68.00, contributionPct: 11.0, positive: true },
		],
	},
	d15: {
		id: 'd15',
		dayOfWeek: 'Fri',
		dayIndex: 5,
		weekNumber: 3,
		dateLabel: '17 Oct',
		fullDate: 'Friday, 17 Oct 2026 (Live Session)',
		netProfit: 769.20,
		percentChange: 0.51,
		startingCapital: 161687.80,
		endingCapital: 162457.00,
		realizedPnl: 340.00,
		unrealizedMtm: 472.00,
		totalCharges: 42.80,
		turnover: 92450.00,
		winRate: 75,
		totalOrders: 4,
		isMonday: false,
		orders: [
			{ id: 'ORD-20261017-001', time: '09:24:12 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'BUY', type: 'LIMIT', product: 'MIS', quantity: 25, price: 835.50, value: 20887.50, fee: 20.00, status: 'FILLED' },
			{ id: 'ORD-20261017-002', time: '11:15:30 AM', symbol: 'SBIN', name: 'State Bank of India', side: 'SELL', type: 'LIMIT', product: 'MIS', quantity: 25, price: 842.15, value: 21053.75, fee: 16.50, status: 'FILLED' },
			{ id: 'ORD-20261017-003', time: '01:42:00 PM', symbol: 'HDFCBANK', name: 'HDFC Bank Limited', side: 'BUY', type: 'MARKET', product: 'CNC', quantity: 5, price: 1738.00, value: 8690.00, fee: 0.00, status: 'FILLED' },
			{ id: 'ORD-20261017-004', time: '02:55:18 PM', symbol: 'TCS', name: 'Tata Consultancy Services', side: 'BUY', type: 'LIMIT', product: 'CNC', quantity: 3, price: 4110.00, value: 12330.00, fee: 6.30, status: 'FILLED' },
		],
		contributions: [
			{ symbol: 'SBIN', name: 'State Bank of India', type: 'Intraday MIS', shares: 25, dayChangePct: 1.40, pnlAmount: 398.25, contributionPct: 51.7, positive: true },
			{ symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'CNC Holding', shares: 12, dayChangePct: 1.12, pnlAmount: 397.20, contributionPct: 51.6, positive: true },
			{ symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'CNC Holding', shares: 15, dayChangePct: 0.88, pnlAmount: 228.00, contributionPct: 29.6, positive: true },
			{ symbol: 'TCS', name: 'Tata Consultancy Services', type: 'CNC Holding', shares: 8, dayChangePct: 0.45, pnlAmount: 148.00, contributionPct: 19.2, positive: true },
			{ symbol: 'INFY', name: 'Infosys Limited', type: 'CNC Holding', shares: 20, dayChangePct: -0.62, pnlAmount: -236.00, contributionPct: -30.6, positive: false },
		],
	},
}

// Week groupings definition
const weekOptions = [
	{ weekNumber: 3 as const, label: 'Current Week', dateRange: '13 Oct – 17 Oct 2026', sessionIds: ['d11', 'd12', 'd13', 'd14', 'd15'] },
	{ weekNumber: 2 as const, label: 'Last Week', dateRange: '06 Oct – 10 Oct 2026', sessionIds: ['d6', 'd7', 'd8', 'd9', 'd10'] },
	{ weekNumber: 1 as const, label: 'Previous Week', dateRange: '29 Sep – 03 Oct 2026', sessionIds: ['d1', 'd2', 'd3', 'd4', 'd5'] },
]

export default function DayProfitBreakdown() {
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()

	const currentId = searchParams.get('id') || 'd15'
	const [selectedSessionId, setSelectedSessionId] = useState<string>(
		allDaySessions[currentId] ? currentId : 'd15',
	)

	// Mode toggle for Calendar View: 'week-strip' (all 5 days cards) vs 'month-calendar' (full October grid)
	const [calendarViewMode, setCalendarViewMode] = useState<'week-strip' | 'month-grid'>('week-strip')

	const session = useMemo(() => {
		return allDaySessions[selectedSessionId] || allDaySessions['d15']
	}, [selectedSessionId])

	// Current active week tab derived from session
	const activeWeekNumber = session.weekNumber

	const handleSessionSelect = (id: string) => {
		setSelectedSessionId(id)
		setSearchParams({ id, date: allDaySessions[id]?.dateLabel || '' })
	}

	const handlePrevDay = () => {
		const keys = Object.keys(allDaySessions)
		const idx = keys.indexOf(selectedSessionId)
		if (idx > 0) {
			handleSessionSelect(keys[idx - 1])
		}
	}

	const handleNextDay = () => {
		const keys = Object.keys(allDaySessions)
		const idx = keys.indexOf(selectedSessionId)
		if (idx < keys.length - 1) {
			handleSessionSelect(keys[idx + 1])
		}
	}

	function exportDayOrdersCSV() {
		const csvRows = [
			['Order ID', 'Time', 'Symbol', 'Name', 'Side', 'Type', 'Product', 'Quantity', 'Price', 'Value', 'Fee', 'Status'],
			...session.orders.map((o) => [
				o.id,
				o.time,
				o.symbol,
				`"${o.name}"`,
				o.side,
				o.type,
				o.product,
				o.quantity,
				o.price,
				o.value,
				o.fee,
				o.status,
			]),
		]
		const csvString = csvRows.map((r) => r.join(',')).join('\n')
		const blob = new Blob([csvString], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `invexa-orders-${session.dateLabel.replace(/\s+/g, '-')}.csv`
		link.click()
		URL.revokeObjectURL(url)
	}

	const isProfit = session.netProfit >= 0

	// Compute weekly aggregate statistics for the current active week
	const currentWeekSessions = weekOptions.find((w) => w.weekNumber === activeWeekNumber)?.sessionIds.map(
		(id) => allDaySessions[id]
	) || []
	const weekTotalPnl = currentWeekSessions.reduce((acc, s) => acc + s.netProfit, 0)
	const weekWinningDays = currentWeekSessions.filter((s) => s.netProfit > 0).length

	return (
		<div className="day-breakdown-page">
			{/* Top Bar with Navigation, Day Stepper, and Export */}
			<div className="day-breakdown-top">
				<div className="day-breakdown-heading-group">
					<button
						className="button button-secondary back-dash-btn"
						onClick={() => navigate('/dashboard')}
						title="Return to Dashboard"
					>
						<ArrowLeft size={15} /> Dashboard
					</button>
					<div>
						<div className="day-breakdown-title-row">
							<h1 className="day-breakdown-title">Day Profit & Orders Audit</h1>
							<span className={`session-status-badge ${isProfit ? 'badge-profit' : 'badge-loss'}`}>
								{isProfit ? 'PROFITABLE SESSION' : 'NET LOSS'}
							</span>
						</div>
						<p className="day-breakdown-subtitle">
							Complete transparency on order executions, mark-to-market valuations, and net settled capital for <strong>{session.fullDate}</strong>.
						</p>
					</div>
				</div>

				<div className="day-breakdown-actions">
					<div className="day-stepper-control">
						<button
							className="day-step-btn"
							onClick={handlePrevDay}
							disabled={selectedSessionId === 'd1'}
							title="Previous Trading Day"
						>
							<ChevronLeft size={15} />
						</button>
						<span className="day-step-label">{session.dateLabel}</span>
						<button
							className="day-step-btn"
							onClick={handleNextDay}
							disabled={selectedSessionId === 'd15'}
							title="Next Trading Day"
						>
							<ChevronRight size={15} />
						</button>
					</div>
					<button className="button button-secondary export-csv-btn" onClick={exportDayOrdersCSV}>
						<Download size={14} /> Export Orders CSV
					</button>
				</div>
			</div>

			{/* ================= WORKING CALENDAR & 5 DAYS OF THE WEEK ================= */}
			<div className="calendar-hub-container">
				{/* Calendar Hub Top Controls */}
				<div className="calendar-hub-header">
					<div className="calendar-hub-left">
						<span className="calendar-hub-title">
							<CalendarIcon size={16} className="text-lime" />
							<span>NSE Trading Calendar</span>
						</span>
						{/* Week Selector Tabs */}
						<div className="week-selector-tabs">
							{weekOptions.map((w) => {
								const isActive = w.weekNumber === activeWeekNumber
								return (
									<button
										key={w.weekNumber}
										className={`week-tab-btn ${isActive ? 'week-tab-active' : ''}`}
										onClick={() => {
											// Switch to Monday of that week
											handleSessionSelect(w.sessionIds[0])
										}}
									>
										<span>{w.label}</span>
										<small>{w.dateRange.split('2026')[0].trim()}</small>
									</button>
								)
							})}
						</div>
					</div>

					<div className="calendar-hub-right">
						<div className="calendar-mode-toggle">
							<button
								className={`mode-toggle-btn ${calendarViewMode === 'week-strip' ? 'mode-active' : ''}`}
								onClick={() => setCalendarViewMode('week-strip')}
								title="All 5 Days of the Week View"
							>
								<Layers size={13} /> 5-Day Week Strip
							</button>
							<button
								className={`mode-toggle-btn ${calendarViewMode === 'month-grid' ? 'mode-active' : ''}`}
								onClick={() => setCalendarViewMode('month-grid')}
								title="October 2026 Full Calendar View"
							>
								<CalendarIcon size={13} /> Month Calendar
							</button>
						</div>
						<div className="week-stat-chip">
							<span className="stat-chip-label">Week Total:</span>
							<span className={`stat-chip-val ${weekTotalPnl >= 0 ? 'positive-text' : 'negative-text'}`}>
								{weekTotalPnl >= 0 ? '+' : ''}₹{weekTotalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
							</span>
							<span className="stat-chip-win">{weekWinningDays}/5 Won</span>
						</div>
					</div>
				</div>

				{/* VIEW 1: ALL 5 DAYS OF THE WEEK STRIP */}
				{calendarViewMode === 'week-strip' && (
					<div className="five-days-week-grid">
						{currentWeekSessions.map((s) => {
							const isSelected = s.id === session.id
							const dayProfit = s.netProfit >= 0
							return (
								<div
									key={s.id}
									onClick={() => handleSessionSelect(s.id)}
									className={`day-card-item ${isSelected ? 'day-card-selected' : ''}`}
									role="button"
									tabIndex={0}
									aria-label={`View audit for ${s.fullDate}`}
								>
									<div className="day-card-header">
										<div className="day-card-daygroup">
											<span className="day-name">{s.dayOfWeek}</span>
											{s.isMonday && <span className="monday-tag">MON</span>}
											{s.id === 'd15' && <span className="live-tag">LIVE</span>}
										</div>
										<span className="day-date">{s.dateLabel}</span>
									</div>

									<div className="day-card-pnl">
										<div className={`pnl-amount ${dayProfit ? 'positive-text' : 'negative-text'}`}>
											{dayProfit ? '+' : '-'}₹{Math.abs(s.netProfit).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
										</div>
										<div className={`pnl-percent ${dayProfit ? 'pill-profit' : 'pill-loss'}`}>
											{dayProfit ? '+' : ''}{s.percentChange}%
										</div>
									</div>

									<div className="day-card-footer">
										<span>{s.totalOrders} Orders</span>
										<span>•</span>
										<span className={s.winRate >= 50 ? 'positive-text' : 'negative-text'}>
											{s.winRate}% Win
										</span>
									</div>

									{isSelected && <div className="day-selected-glow-bar" />}
								</div>
							)
						})}
					</div>
				)}

				{/* VIEW 2: FULL OCTOBER 2026 MONTH CALENDAR GRID */}
				{calendarViewMode === 'month-grid' && (
					<div className="month-calendar-wrapper">
						<div className="calendar-grid-header-row">
							<span className="cal-col-header">MON</span>
							<span className="cal-col-header">TUE</span>
							<span className="cal-col-header">WED</span>
							<span className="cal-col-header">THU</span>
							<span className="cal-col-header">FRI</span>
							<span className="cal-col-header cal-weekend">SAT</span>
							<span className="cal-col-header cal-weekend">SUN</span>
						</div>

						{/* October 2026 3-week active trading calendar matrix */}
						<div className="month-calendar-matrix">
							{/* Week 1: Sep 29 - Oct 03 */}
							{['d1', 'd2', 'd3', 'd4', 'd5'].map((id) => {
								const s = allDaySessions[id]
								const isSelected = s.id === session.id
								const p = s.netProfit >= 0
								return (
									<div
										key={s.id}
										onClick={() => handleSessionSelect(s.id)}
										className={`cal-day-cell ${isSelected ? 'cell-active' : ''}`}
									>
										<div className="cal-cell-top">
											<span className="cal-cell-date">{s.dateLabel.split(' ')[0]}</span>
											<span className="cal-cell-month">{s.dateLabel.split(' ')[1]}</span>
										</div>
										<div className={`cal-cell-pnl ${p ? 'positive-text' : 'negative-text'}`}>
											{p ? '+' : ''}₹{Math.abs(s.netProfit).toFixed(0)}
										</div>
										<div className="cal-cell-sub">{s.totalOrders} trades</div>
									</div>
								)
							})}
							<div className="cal-day-cell cal-cell-closed">
								<div className="cal-cell-top"><span className="cal-cell-date">04</span><span className="cal-cell-month">Oct</span></div>
								<span className="cal-closed-tag">Closed</span>
							</div>
							<div className="cal-day-cell cal-cell-closed">
								<div className="cal-cell-top"><span className="cal-cell-date">05</span><span className="cal-cell-month">Oct</span></div>
								<span className="cal-closed-tag">Closed</span>
							</div>

							{/* Week 2: Oct 06 - Oct 10 */}
							{['d6', 'd7', 'd8', 'd9', 'd10'].map((id) => {
								const s = allDaySessions[id]
								const isSelected = s.id === session.id
								const p = s.netProfit >= 0
								return (
									<div
										key={s.id}
										onClick={() => handleSessionSelect(s.id)}
										className={`cal-day-cell ${isSelected ? 'cell-active' : ''}`}
									>
										<div className="cal-cell-top">
											<span className="cal-cell-date">{s.dateLabel.split(' ')[0]}</span>
											<span className="cal-cell-month">{s.dateLabel.split(' ')[1]}</span>
										</div>
										<div className={`cal-cell-pnl ${p ? 'positive-text' : 'negative-text'}`}>
											{p ? '+' : ''}₹{Math.abs(s.netProfit).toFixed(0)}
										</div>
										<div className="cal-cell-sub">{s.totalOrders} trades</div>
									</div>
								)
							})}
							<div className="cal-day-cell cal-cell-closed">
								<div className="cal-cell-top"><span className="cal-cell-date">11</span><span className="cal-cell-month">Oct</span></div>
								<span className="cal-closed-tag">Closed</span>
							</div>
							<div className="cal-day-cell cal-cell-closed">
								<div className="cal-cell-top"><span className="cal-cell-date">12</span><span className="cal-cell-month">Oct</span></div>
								<span className="cal-closed-tag">Closed</span>
							</div>

							{/* Week 3: Oct 13 - Oct 17 */}
							{['d11', 'd12', 'd13', 'd14', 'd15'].map((id) => {
								const s = allDaySessions[id]
								const isSelected = s.id === session.id
								const p = s.netProfit >= 0
								return (
									<div
										key={s.id}
										onClick={() => handleSessionSelect(s.id)}
										className={`cal-day-cell ${isSelected ? 'cell-active' : ''}`}
									>
										<div className="cal-cell-top">
											<span className="cal-cell-date">{s.dateLabel.split(' ')[0]}</span>
											<span className="cal-cell-month">{s.dateLabel.split(' ')[1]}</span>
										</div>
										<div className={`cal-cell-pnl ${p ? 'positive-text' : 'negative-text'}`}>
											{p ? '+' : ''}₹{Math.abs(s.netProfit).toFixed(0)}
										</div>
										<div className="cal-cell-sub">{s.totalOrders} trades</div>
									</div>
								)
							})}
							<div className="cal-day-cell cal-cell-closed">
								<div className="cal-cell-top"><span className="cal-cell-date">18</span><span className="cal-cell-month">Oct</span></div>
								<span className="cal-closed-tag">Closed</span>
							</div>
							<div className="cal-day-cell cal-cell-closed">
								<div className="cal-cell-top"><span className="cal-cell-date">19</span><span className="cal-cell-month">Oct</span></div>
								<span className="cal-closed-tag">Closed</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* ================= EXECUTIVE SUMMARY KPI CARDS FOR SELECTED DAY ================= */}
			<div className="kpi-grid">
				<div className="kpi-card">
					<span className="kpi-label">
						Net Day P&L
						{isProfit ? <ArrowUpRight className="positive-text" size={16} /> : <ArrowDownRight className="negative-text" size={16} />}
					</span>
					<div className={`kpi-value ${isProfit ? 'positive-text' : 'negative-text'}`}>
						{isProfit ? '+' : '-'}₹{Math.abs(session.netProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
					</div>
					<div className="kpi-foot">
						<span className={`change-pill ${isProfit ? 'positive' : 'negative'}`}>
							{isProfit ? '+' : ''}{session.percentChange}%
						</span>
						<span className="muted">vs previous close</span>
					</div>
				</div>

				<div className="kpi-card">
					<span className="kpi-label">Total Day Turnover</span>
					<div className="kpi-value text-white">
						{formatCurrency(session.turnover)}
					</div>
					<div className="kpi-foot">
						<span className="muted">{session.totalOrders} filled order executions</span>
					</div>
				</div>

				<div className="kpi-card">
					<span className="kpi-label">Order Win Rate</span>
					<div className="kpi-value text-lime">
						{session.winRate}%
					</div>
					<div className="kpi-foot">
						<span className="muted">
							{session.orders.filter((o) => o.side === 'SELL').length} completed sell exits
						</span>
					</div>
				</div>

				<div className="kpi-card">
					<span className="kpi-label">Brokerage & Taxes</span>
					<div className="kpi-value negative-text">
						-₹{session.totalCharges.toFixed(2)}
					</div>
					<div className="kpi-foot">
						<span className="muted">STT, GST & NSE Turnover charges</span>
					</div>
				</div>
			</div>

			{/* ================= STEP-BY-STEP MATHEMATICAL PROFIT RECONCILIATION ================= */}
			<section className="card breakdown-section">
				<div className="card-header">
					<div className="card-header-icon-group">
						<Receipt size={17} className="text-lime" />
						<div>
							<h2 className="card-title">How Today's Profit Was Conducted (Step-by-Step Breakdown)</h2>
							<p className="card-subtitle">
								Full mathematical reconciliation of intraday trade executions, mark-to-market holding valuation, and statutory deductions for <strong>{session.fullDate}</strong>.
							</p>
						</div>
					</div>
				</div>

				<div className="conduct-waterfall">
					{/* Step 1 */}
					<div className="waterfall-step">
						<div className="step-top">
							<span className="step-num">Step 1 · Realized P&L</span>
							<h3 className="step-title">Intraday Trades</h3>
							<p className="step-desc">
								Net gain from squared-off intraday MIS orders executed between 09:15 AM and 03:30 PM.
							</p>
						</div>
						<div className="step-bottom">
							<span className={`step-amount ${session.realizedPnl >= 0 ? 'positive-text' : 'negative-text'}`}>
								{session.realizedPnl >= 0 ? '+' : '-'}₹{Math.abs(session.realizedPnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
							</span>
						</div>
					</div>

					{/* Step 2 */}
					<div className="waterfall-step">
						<div className="step-top">
							<span className="step-num">Step 2 · Unrealized MTM</span>
							<h3 className="step-title">Holdings Fluctuation</h3>
							<p className="step-desc">
								Mark-to-market swing across delivery CNC holdings based on NSE closing prices vs yesterday close.
							</p>
						</div>
						<div className="step-bottom">
							<span className={`step-amount ${session.unrealizedMtm >= 0 ? 'positive-text' : 'negative-text'}`}>
								{session.unrealizedMtm >= 0 ? '+' : '-'}₹{Math.abs(session.unrealizedMtm).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
							</span>
						</div>
					</div>

					{/* Step 3 */}
					<div className="waterfall-step">
						<div className="step-top">
							<span className="step-num">Step 3 · Statutory Charges</span>
							<h3 className="step-title">Brokerage & Taxes</h3>
							<p className="step-desc">
								₹20 per executed MIS order + Securities Transaction Tax (STT), Exchange Turnover charges & GST.
							</p>
						</div>
						<div className="step-bottom">
							<span className="step-amount negative-text">
								-₹{session.totalCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
							</span>
						</div>
					</div>

					{/* Step 4 */}
					<div className="waterfall-step step-highlighted">
						<div className="step-top">
							<span className="step-num">Step 4 · Net Settled Capital</span>
							<h3 className="step-title">Final Credited Capital</h3>
							<p className="step-desc">
								Net addition to portfolio cash and asset equity available for withdrawal or tomorrow's trading.
							</p>
						</div>
						<div className="step-bottom">
							<span className={`step-amount font-large ${isProfit ? 'positive-text' : 'negative-text'}`}>
								{isProfit ? '+' : '-'}₹{Math.abs(session.netProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
							</span>
						</div>
					</div>
				</div>

				{/* Formula verification banner */}
				<div className="formula-banner">
					<span className="formula-tag">RECONCILIATION FORMULA:</span>
					<div className="formula-text">
						<span>Realized (<strong>₹{session.realizedPnl.toFixed(2)}</strong>)</span>
						<span>+</span>
						<span>Unrealized MTM (<strong>₹{session.unrealizedMtm.toFixed(2)}</strong>)</span>
						<span>-</span>
						<span>Taxes (<strong>₹{session.totalCharges.toFixed(2)}</strong>)</span>
						<span>=</span>
						<strong className={isProfit ? 'positive-text' : 'negative-text'}>
							Net P&L: ₹{session.netProfit.toFixed(2)}
						</strong>
					</div>
					<div className="formula-badge">
						<CheckCircle2 size={13} className="text-lime" /> Fully Audited & Settled
					</div>
				</div>
			</section>

			{/* ================= ASSET & HOLDINGS CONTRIBUTION MATRIX ================= */}
			<section className="card breakdown-section">
				<div className="card-header">
					<div className="card-header-icon-group">
						{isProfit ? <TrendingUp size={17} className="text-lime" /> : <TrendingDown size={17} className="negative-text" />}
						<div>
							<h2 className="card-title">Day Profit Contribution by Asset</h2>
							<p className="card-subtitle">
								Breakdown of how individual stocks in your portfolio contributed to today’s P&L.
							</p>
						</div>
					</div>
				</div>

				<div className="table-responsive">
					<table className="breakdown-table">
						<thead>
							<tr>
								<th>Asset</th>
								<th>Position Type</th>
								<th>Shares / Qty</th>
								<th>Day's Move</th>
								<th>P&L Contribution (₹)</th>
								<th>Share of Net Gain</th>
							</tr>
						</thead>
						<tbody>
							{session.contributions.map((asset) => (
								<tr key={asset.symbol}>
									<td>
										<strong>{asset.symbol}</strong>
										<span className="asset-subname">{asset.name}</span>
									</td>
									<td>
										<span className="position-type-badge">{asset.type}</span>
									</td>
									<td className="font-mono">{asset.shares}</td>
									<td>
										<span className={`change-pill ${asset.positive ? 'positive' : 'negative'}`}>
											{asset.positive ? '+' : ''}{asset.dayChangePct}%
										</span>
									</td>
									<td className={`font-mono ${asset.positive ? 'positive-text' : 'negative-text'}`}>
										{asset.positive ? '+' : '-'}₹{Math.abs(asset.pnlAmount).toFixed(2)}
									</td>
									<td>
										<div className="flex-center" style={{ gap: '8px' }}>
											<span className="font-mono">{asset.contributionPct > 0 ? '+' : ''}{asset.contributionPct}%</span>
											<div style={{ width: '48px', height: '4px', background: '#253127', borderRadius: '2px', overflow: 'hidden' }}>
												<div
													style={{
														width: `${Math.min(100, Math.abs(asset.contributionPct))}%`,
														height: '100%',
														background: asset.positive ? '#a8d66d' : '#e58b81',
													}}
												/>
											</div>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			{/* ================= ALL ORDERS EXECUTED TODAY ================= */}
			<section className="card breakdown-section">
				<div className="card-header">
					<div className="card-header-icon-group">
						<Clock size={17} className="text-lime" />
						<div>
							<h2 className="card-title">All Executed Orders for {session.dateLabel} ({session.orders.length} Trades)</h2>
							<p className="card-subtitle">
								Complete trade execution logs with tick-by-tick timestamps and regulatory execution IDs.
							</p>
						</div>
					</div>
				</div>

				<div className="table-responsive">
					<table className="breakdown-table">
						<thead>
							<tr>
								<th>Order ID</th>
								<th>Time (IST)</th>
								<th>Stock</th>
								<th>Side</th>
								<th>Product</th>
								<th>Order Type</th>
								<th>Qty</th>
								<th>Exec. Price</th>
								<th>Order Value</th>
								<th>Fee</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{session.orders.map((ord) => (
								<tr key={ord.id}>
									<td className="font-mono text-soft">{ord.id}</td>
									<td className="font-mono">{ord.time}</td>
									<td>
										<strong>{ord.symbol}</strong>
										<span className="asset-subname">{ord.name}</span>
									</td>
									<td>
										<span className={`order-side-badge ${ord.side === 'BUY' ? 'side-buy' : 'side-sell'}`}>
											{ord.side}
										</span>
									</td>
									<td>
										<span className="position-type-badge">{ord.product}</span>
									</td>
									<td className="font-mono text-soft">{ord.type}</td>
									<td className="font-mono">{ord.quantity}</td>
									<td className="font-mono">₹{ord.price.toFixed(2)}</td>
									<td className="font-mono text-white">₹{ord.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
									<td className="font-mono text-soft">₹{ord.fee.toFixed(2)}</td>
									<td>
										<span className="status-filled-badge">
											<CheckCircle2 size={12} /> {ord.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	)
}
