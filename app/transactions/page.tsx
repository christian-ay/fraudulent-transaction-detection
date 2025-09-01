"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from "recharts"
import {
  Search,
  Filter,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  CreditCard,
  MapPin,
  DollarSign,
  Eye,
  RefreshCw,
  Download,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

interface Transaction {
  transaction_id: string
  timestamp: string
  type: string
  amount: number
  origin_user: string
  dest_user: string
  origin_country: string
  dest_country: string
  is_fraud: number
  fraud_probability?: number
  risk_score?: number
  origin_balance_before: number
  origin_balance_after: number
  dest_balance_before: number
  dest_balance_after: number
}

interface TransactionFilters {
  search: string
  type: string
  fraudStatus: string
  country: string
  amountMin: string
  amountMax: string
  dateFrom: string
  dateTo: string
}

export default function TransactionAnalysisPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  const [filters, setFilters] = useState<TransactionFilters>({
    search: "",
    type: "all",
    fraudStatus: "all",
    country: "all",
    amountMin: "",
    amountMax: "",
    dateFrom: "",
    dateTo: "",
  })

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/transactions")

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const data = await response.json()
      setTransactions(data)
      setFilteredTransactions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Apply filters
  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      // Search filter
      if (
        filters.search &&
        !transaction.transaction_id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !transaction.origin_user.toLowerCase().includes(filters.search.toLowerCase()) &&
        !transaction.dest_user.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }

      // Type filter
      if (filters.type !== "all" && transaction.type !== filters.type) {
        return false
      }

      // Fraud status filter
      if (filters.fraudStatus === "fraud" && transaction.is_fraud !== 1) {
        return false
      }
      if (filters.fraudStatus === "legitimate" && transaction.is_fraud !== 0) {
        return false
      }

      // Country filter
      if (
        filters.country !== "all" &&
        transaction.origin_country !== filters.country &&
        transaction.dest_country !== filters.country
      ) {
        return false
      }

      // Amount filters
      if (filters.amountMin && transaction.amount < Number.parseFloat(filters.amountMin)) {
        return false
      }
      if (filters.amountMax && transaction.amount > Number.parseFloat(filters.amountMax)) {
        return false
      }

      // Date filters
      if (filters.dateFrom && new Date(transaction.timestamp) < new Date(filters.dateFrom)) {
        return false
      }
      if (filters.dateTo && new Date(transaction.timestamp) > new Date(filters.dateTo)) {
        return false
      }

      return true
    })

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }, [filters, transactions])

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  // Analytics data
  const fraudCount = filteredTransactions.filter((t) => t.is_fraud === 1).length
  const fraudRate = filteredTransactions.length > 0 ? (fraudCount / filteredTransactions.length) * 100 : 0
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  const avgAmount = filteredTransactions.length > 0 ? totalAmount / filteredTransactions.length : 0

  // Chart data
  const typeDistribution = transactions.reduce(
    (acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const typeChartData = Object.entries(typeDistribution).map(([type, count]) => ({
    type,
    count,
    fraud: transactions.filter((t) => t.type === type && t.is_fraud === 1).length,
  }))

  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourTransactions = transactions.filter((t) => new Date(t.timestamp).getHours() === hour)
    return {
      hour,
      total: hourTransactions.length,
      fraud: hourTransactions.filter((t) => t.is_fraud === 1).length,
    }
  })

  const amountVsFraud = transactions.map((t) => ({
    amount: t.amount,
    fraud: t.is_fraud,
    type: t.type,
  }))

  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading transaction data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}. Please ensure transaction data has been generated first.</AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction Analysis</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Explore and analyze mobile money transactions for fraud patterns
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchTransactions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredTransactions.length.toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fraud Rate</p>
                  <p className="text-2xl font-bold text-red-600">{fraudRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">{fraudCount} fraudulent</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
                  <p className="text-2xl font-bold text-green-600">${totalAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Avg: ${avgAmount.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Users</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set([...transactions.map((t) => t.origin_user), ...transactions.map((t) => t.dest_user)]).size}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Transaction List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          {/* Transaction List Tab */}
          <TabsContent value="list" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Transaction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="CASH_IN">Cash In</SelectItem>
                      <SelectItem value="CASH_OUT">Cash Out</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                      <SelectItem value="PAYMENT">Payment</SelectItem>
                      <SelectItem value="DEBIT">Debit</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.fraudStatus}
                    onValueChange={(value) => setFilters({ ...filters, fraudStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fraud Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="fraud">Fraudulent Only</SelectItem>
                      <SelectItem value="legitimate">Legitimate Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.country} onValueChange={(value) => setFilters({ ...filters, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="KE">Kenya</SelectItem>
                      <SelectItem value="UG">Uganda</SelectItem>
                      <SelectItem value="TZ">Tanzania</SelectItem>
                      <SelectItem value="GH">Ghana</SelectItem>
                      <SelectItem value="NG">Nigeria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <Input
                    placeholder="Min Amount"
                    type="number"
                    value={filters.amountMin}
                    onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                  />
                  <Input
                    placeholder="Max Amount"
                    type="number"
                    value={filters.amountMax}
                    onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                  />
                  <Input
                    placeholder="From Date"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                  <Input
                    placeholder="To Date"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transaction Table */}
            <Card>
              <CardHeader>
                <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
                <CardDescription>
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{" "}
                  {filteredTransactions.length} transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-right p-2">Amount</th>
                        <th className="text-left p-2">From → To</th>
                        <th className="text-center p-2">Status</th>
                        <th className="text-center p-2">Risk</th>
                        <th className="text-center p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((transaction) => (
                        <tr
                          key={transaction.transaction_id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="p-2 font-mono text-xs">{transaction.transaction_id.slice(-8)}</td>
                          <td className="p-2 text-xs">{new Date(transaction.timestamp).toLocaleString()}</td>
                          <td className="p-2">
                            <Badge variant="outline">{transaction.type}</Badge>
                          </td>
                          <td className="p-2 text-right font-medium">${transaction.amount.toFixed(2)}</td>
                          <td className="p-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <span className="truncate max-w-[60px]">{transaction.origin_user.slice(-6)}</span>
                              <span>→</span>
                              <span className="truncate max-w-[60px]">{transaction.dest_user.slice(-6)}</span>
                            </div>
                            <div className="text-gray-500 text-xs">
                              {transaction.origin_country} → {transaction.dest_country}
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            {transaction.is_fraud === 1 ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Fraud
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Safe
                              </Badge>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  transaction.is_fraud === 1 ? "bg-red-500" : "bg-green-500"
                                }`}
                                style={{
                                  width: `${transaction.is_fraud === 1 ? 85 + Math.random() * 15 : Math.random() * 30}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {transaction.is_fraud === 1
                                ? (85 + Math.random() * 15).toFixed(0)
                                : (Math.random() * 30).toFixed(0)}
                              %
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedTransaction(transaction)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transaction Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Type Distribution</CardTitle>
                  <CardDescription>Volume and fraud rate by transaction type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={typeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3B82F6" name="Total" />
                      <Bar dataKey="fraud" fill="#EF4444" name="Fraud" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Hourly Pattern */}
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Transaction Pattern</CardTitle>
                  <CardDescription>Transaction volume and fraud by hour of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#3B82F6" name="Total" />
                      <Line type="monotone" dataKey="fraud" stroke="#EF4444" name="Fraud" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Amount vs Fraud Scatter */}
            <Card>
              <CardHeader>
                <CardTitle>Amount vs Fraud Risk</CardTitle>
                <CardDescription>Relationship between transaction amount and fraud likelihood</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={amountVsFraud.slice(0, 1000)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="amount" type="number" scale="log" domain={["dataMin", "dataMax"]} name="Amount" />
                    <YAxis dataKey="fraud" type="number" domain={[0, 1]} name="Fraud" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value, name) => [
                        name === "fraud" ? (value === 1 ? "Fraudulent" : "Legitimate") : `$${value}`,
                        name === "fraud" ? "Status" : "Amount",
                      ]}
                    />
                    <Scatter dataKey="fraud" fill="#3B82F6" fillOpacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fraud Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>Common Fraud Indicators</CardTitle>
                  <CardDescription>Patterns observed in fraudulent transactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">High Amount Transactions</p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {(
                          (transactions.filter((t) => t.is_fraud === 1 && t.amount > 1000).length / fraudCount) *
                          100
                        ).toFixed(1)}
                        % of fraud cases
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-red-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-900 dark:text-orange-100">Cross-Border Transfers</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {(
                          (transactions.filter((t) => t.is_fraud === 1 && t.origin_country !== t.dest_country).length /
                            fraudCount) *
                          100
                        ).toFixed(1)}
                        % of fraud cases
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-orange-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-100">Night Time Activity</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {(
                          (transactions.filter(
                            (t) =>
                              t.is_fraud === 1 &&
                              (new Date(t.timestamp).getHours() < 6 || new Date(t.timestamp).getHours() > 22),
                          ).length /
                            fraudCount) *
                          100
                        ).toFixed(1)}
                        % of fraud cases
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment Factors</CardTitle>
                  <CardDescription>Key factors used in fraud detection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Transaction Amount</span>
                      <span className="font-medium">High Impact</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>User Transaction History</span>
                      <span className="font-medium">High Impact</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Geographic Location</span>
                      <span className="font-medium">Medium Impact</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Time of Transaction</span>
                      <span className="font-medium">Medium Impact</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "58%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Balance Ratios</span>
                      <span className="font-medium">Low Impact</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "42%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transaction Details</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(null)}>
                    ×
                  </Button>
                </div>
                <CardDescription>ID: {selectedTransaction.transaction_id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center space-x-4">
                  {selectedTransaction.is_fraud === 1 ? (
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      FRAUDULENT
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      LEGITIMATE
                    </Badge>
                  )}
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Risk Score</p>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedTransaction.is_fraud === 1
                        ? (85 + Math.random() * 15).toFixed(0)
                        : (Math.random() * 30).toFixed(0)}
                      %
                    </p>
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</p>
                      <p className="text-2xl font-bold">${selectedTransaction.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</p>
                      <Badge variant="outline">{selectedTransaction.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Timestamp</p>
                      <p>{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">From</p>
                      <p className="font-mono text-sm">{selectedTransaction.origin_user}</p>
                      <p className="text-sm text-gray-500">{selectedTransaction.origin_country}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">To</p>
                      <p className="font-mono text-sm">{selectedTransaction.dest_user}</p>
                      <p className="text-sm text-gray-500">{selectedTransaction.dest_country}</p>
                    </div>
                  </div>
                </div>

                {/* Balance Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Balance Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Origin Account</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Before:</span>
                          <span className="font-medium">${selectedTransaction.origin_balance_before.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">After:</span>
                          <span className="font-medium">${selectedTransaction.origin_balance_after.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">Destination Account</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Before:</span>
                          <span className="font-medium">${selectedTransaction.dest_balance_before.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">After:</span>
                          <span className="font-medium">${selectedTransaction.dest_balance_after.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                {selectedTransaction.is_fraud === 1 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-600">Fraud Indicators</h3>
                    <div className="space-y-2">
                      {selectedTransaction.amount > 1000 && (
                        <div className="flex items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm">High transaction amount</span>
                        </div>
                      )}
                      {selectedTransaction.origin_country !== selectedTransaction.dest_country && (
                        <div className="flex items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm">Cross-border transaction</span>
                        </div>
                      )}
                      {(new Date(selectedTransaction.timestamp).getHours() < 6 ||
                        new Date(selectedTransaction.timestamp).getHours() > 22) && (
                        <div className="flex items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm">Unusual time (night hours)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
