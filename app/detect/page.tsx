"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Zap,
  ArrowLeft,
  Copy,
  Send,
  RefreshCw,
  Clock,
  Target,
  Brain,
  BarChart3,
  Code,
  FileText,
} from "lucide-react"
import Link from "next/link"

interface TransactionInput {
  amount: string
  type: string
  origin_country: string
  dest_country: string
  hour: string
  day_of_week: string
  origin_balance: string
  dest_balance: string
  user_transaction_count: string
}

interface FraudDetectionResult {
  is_fraud_predicted: boolean
  fraud_probability: number
  risk_score: number
  confidence: number
  model_predictions: Record<string, number>
  risk_factors: string[]
  recommendation: string
  processing_time_ms: number
}

export default function FraudDetectionPage() {
  const [transaction, setTransaction] = useState<TransactionInput>({
    amount: "500.00",
    type: "TRANSFER",
    origin_country: "US",
    dest_country: "US",
    hour: "14",
    day_of_week: "2",
    origin_balance: "2500.00",
    dest_balance: "1200.00",
    user_transaction_count: "15",
  })

  const [result, setResult] = useState<FraudDetectionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [batchInput, setBatchInput] = useState("")
  const [batchResults, setBatchResults] = useState<any[]>([])

  const handleSingleDetection = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/detect-fraud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      })

      if (!response.ok) {
        throw new Error("Failed to detect fraud")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleBatchDetection = async () => {
    setLoading(true)
    setError(null)

    try {
      const transactions = JSON.parse(batchInput)

      const response = await fetch("/api/detect-fraud-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactions }),
      })

      if (!response.ok) {
        throw new Error("Failed to process batch detection")
      }

      const data = await response.json()
      setBatchResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON or API error")
    } finally {
      setLoading(false)
    }
  }

  const generateSampleTransaction = () => {
    const types = ["CASH_IN", "CASH_OUT", "TRANSFER", "PAYMENT", "DEBIT"]
    const countries = ["US", "UK", "KE", "UG", "TZ", "GH", "NG"]

    setTransaction({
      amount: (Math.random() * 2000 + 50).toFixed(2),
      type: types[Math.floor(Math.random() * types.length)],
      origin_country: countries[Math.floor(Math.random() * countries.length)],
      dest_country: countries[Math.floor(Math.random() * countries.length)],
      hour: Math.floor(Math.random() * 24).toString(),
      day_of_week: Math.floor(Math.random() * 7).toString(),
      origin_balance: (Math.random() * 10000 + 1000).toFixed(2),
      dest_balance: (Math.random() * 5000 + 500).toFixed(2),
      user_transaction_count: Math.floor(Math.random() * 100 + 1).toString(),
    })
  }

  const copyApiExample = () => {
    const apiExample = `curl -X POST https://your-api.com/api/detect-fraud \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": "500.00",
    "type": "TRANSFER",
    "origin_country": "US",
    "dest_country": "KE",
    "hour": "2",
    "day_of_week": "6",
    "origin_balance": "2500.00",
    "dest_balance": "1200.00",
    "user_transaction_count": "15"
  }'`

    navigator.clipboard.writeText(apiExample)
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
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Real-time Fraud Detection</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Test fraud detection API with real-time transaction scoring
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              Live API
            </Badge>
          </div>
        </div>

        {/* API Status */}
        <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">API Status: Online</h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Fraud detection models loaded and ready for real-time scoring
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600 font-medium">Response Time</p>
                <p className="text-2xl font-bold text-green-600">~12ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="single">Single Transaction</TabsTrigger>
            <TabsTrigger value="batch">Batch Processing</TabsTrigger>
            <TabsTrigger value="api">API Documentation</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Single Transaction Tab */}
          <TabsContent value="single" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Transaction Details
                  </CardTitle>
                  <CardDescription>Enter transaction details for fraud detection analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={transaction.amount}
                        onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
                        placeholder="500.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Transaction Type</Label>
                      <Select
                        value={transaction.type}
                        onValueChange={(value) => setTransaction({ ...transaction, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH_IN">Cash In</SelectItem>
                          <SelectItem value="CASH_OUT">Cash Out</SelectItem>
                          <SelectItem value="TRANSFER">Transfer</SelectItem>
                          <SelectItem value="PAYMENT">Payment</SelectItem>
                          <SelectItem value="DEBIT">Debit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="origin_country">Origin Country</Label>
                      <Select
                        value={transaction.origin_country}
                        onValueChange={(value) => setTransaction({ ...transaction, origin_country: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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

                    <div>
                      <Label htmlFor="dest_country">Destination Country</Label>
                      <Select
                        value={transaction.dest_country}
                        onValueChange={(value) => setTransaction({ ...transaction, dest_country: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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

                    <div>
                      <Label htmlFor="hour">Hour (0-23)</Label>
                      <Input
                        id="hour"
                        type="number"
                        min="0"
                        max="23"
                        value={transaction.hour}
                        onChange={(e) => setTransaction({ ...transaction, hour: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="day_of_week">Day of Week (0-6)</Label>
                      <Input
                        id="day_of_week"
                        type="number"
                        min="0"
                        max="6"
                        value={transaction.day_of_week}
                        onChange={(e) => setTransaction({ ...transaction, day_of_week: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="origin_balance">Origin Balance ($)</Label>
                      <Input
                        id="origin_balance"
                        type="number"
                        step="0.01"
                        value={transaction.origin_balance}
                        onChange={(e) => setTransaction({ ...transaction, origin_balance: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dest_balance">Destination Balance ($)</Label>
                      <Input
                        id="dest_balance"
                        type="number"
                        step="0.01"
                        value={transaction.dest_balance}
                        onChange={(e) => setTransaction({ ...transaction, dest_balance: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="user_transaction_count">User Transaction Count</Label>
                    <Input
                      id="user_transaction_count"
                      type="number"
                      value={transaction.user_transaction_count}
                      onChange={(e) => setTransaction({ ...transaction, user_transaction_count: e.target.value })}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleSingleDetection} disabled={loading} className="flex-1">
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Detect Fraud
                        </>
                      )}
                    </Button>
                    <Button onClick={generateSampleTransaction} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Random
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Detection Results
                  </CardTitle>
                  <CardDescription>Real-time fraud analysis and risk assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {result ? (
                    <div className="space-y-6">
                      {/* Main Result */}
                      <div className="text-center p-6 rounded-lg border-2 border-dashed">
                        {result.is_fraud_predicted ? (
                          <div className="space-y-2">
                            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto" />
                            <h3 className="text-2xl font-bold text-red-600">FRAUD DETECTED</h3>
                            <p className="text-red-700">High risk transaction identified</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                            <h3 className="text-2xl font-bold text-green-600">LEGITIMATE</h3>
                            <p className="text-green-700">Transaction appears safe</p>
                          </div>
                        )}
                      </div>

                      {/* Risk Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <p className="text-sm font-medium text-red-900 dark:text-red-100">Fraud Probability</p>
                          <p className="text-2xl font-bold text-red-600">
                            {(result.fraud_probability * 100).toFixed(1)}%
                          </p>
                          <Progress value={result.fraud_probability * 100} className="mt-2" />
                        </div>

                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Risk Score</p>
                          <p className="text-2xl font-bold text-orange-600">{result.risk_score}/100</p>
                          <Progress value={result.risk_score} className="mt-2" />
                        </div>

                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Confidence</p>
                          <p className="text-2xl font-bold text-blue-600">{(result.confidence * 100).toFixed(1)}%</p>
                          <Progress value={result.confidence * 100} className="mt-2" />
                        </div>
                      </div>

                      {/* Model Predictions */}
                      <div>
                        <h4 className="font-semibold mb-3">Model Predictions</h4>
                        <div className="space-y-2">
                          {Object.entries(result.model_predictions).map(([model, probability]) => (
                            <div key={model} className="flex items-center justify-between">
                              <span className="text-sm">{model}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={probability * 100} className="w-24" />
                                <span className="text-sm font-medium w-12">{(probability * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risk Factors */}
                      {result.risk_factors.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Risk Factors</h4>
                          <div className="space-y-2">
                            {result.risk_factors.map((factor, index) => (
                              <div
                                key={index}
                                className="flex items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded"
                              >
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                                <span className="text-sm">{factor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendation */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold mb-2">Recommendation</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{result.recommendation}</p>
                      </div>

                      {/* Performance */}
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Processing Time: {result.processing_time_ms}ms
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-1" />8 Models Analyzed
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter transaction details and click "Detect Fraud" to analyze</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Batch Processing Tab */}
          <TabsContent value="batch" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Input</CardTitle>
                  <CardDescription>Process multiple transactions at once (JSON format)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={`[
  {
    "amount": "500.00",
    "type": "TRANSFER",
    "origin_country": "US",
    "dest_country": "KE",
    "hour": "2",
    "day_of_week": "6",
    "origin_balance": "2500.00",
    "dest_balance": "1200.00",
    "user_transaction_count": "15"
  }
]`}
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleBatchDetection} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing Batch...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Process Batch
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Batch Results</CardTitle>
                  <CardDescription>Results for all processed transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {batchResults.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {batchResults.map((result, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Transaction {index + 1}</span>
                            {result.is_fraud_predicted ? (
                              <Badge variant="destructive">Fraud</Badge>
                            ) : (
                              <Badge variant="secondary">Safe</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Risk: {result.risk_score}/100 | Confidence: {(result.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No batch results yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Documentation Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  API Documentation
                </CardTitle>
                <CardDescription>Integration guide for the fraud detection API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Single Transaction Endpoint */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Single Transaction Detection</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="text-green-400 mb-2">POST /api/detect-fraud</div>
                    <div className="text-blue-400">Content-Type: application/json</div>
                  </div>

                  <h4 className="font-medium mt-4 mb-2">Request Body:</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    {`{
  "amount": "500.00",
  "type": "TRANSFER",
  "origin_country": "US",
  "dest_country": "KE",
  "hour": "2",
  "day_of_week": "6",
  "origin_balance": "2500.00",
  "dest_balance": "1200.00",
  "user_transaction_count": "15"
}`}
                  </div>

                  <h4 className="font-medium mt-4 mb-2">Response:</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    {`{
  "is_fraud_predicted": true,
  "fraud_probability": 0.87,
  "risk_score": 85,
  "confidence": 0.92,
  "model_predictions": {
    "Random Forest": 0.89,
    "Gradient Boosting": 0.85,
    "Logistic Regression": 0.82
  },
  "risk_factors": [
    "High transaction amount",
    "Cross-border transfer",
    "Unusual time (night hours)"
  ],
  "recommendation": "Block transaction and require additional verification",
  "processing_time_ms": 12
}`}
                  </div>
                </div>

                {/* Batch Endpoint */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Batch Processing</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="text-green-400 mb-2">POST /api/detect-fraud-batch</div>
                    <div className="text-blue-400">Content-Type: application/json</div>
                  </div>

                  <h4 className="font-medium mt-4 mb-2">Request Body:</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    {`{
  "transactions": [
    {
      "amount": "500.00",
      "type": "TRANSFER",
      ...
    },
    {
      "amount": "100.00",
      "type": "PAYMENT",
      ...
    }
  ]
}`}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={copyApiExample} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy cURL Example
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">High Risk Example</CardTitle>
                  <CardDescription>Transaction likely to be flagged as fraud</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">$5,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">CASH_OUT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route:</span>
                      <span className="font-medium">US → Unknown</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">3:00 AM, Sunday</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User History:</span>
                      <span className="font-medium">2 transactions</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="destructive"
                    onClick={() =>
                      setTransaction({
                        amount: "5000.00",
                        type: "CASH_OUT",
                        origin_country: "US",
                        dest_country: "XX",
                        hour: "3",
                        day_of_week: "0",
                        origin_balance: "6000.00",
                        dest_balance: "100.00",
                        user_transaction_count: "2",
                      })
                    }
                  >
                    Load Example
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Low Risk Example</CardTitle>
                  <CardDescription>Normal transaction unlikely to be fraud</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">$50.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">PAYMENT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route:</span>
                      <span className="font-medium">US → US</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">2:00 PM, Tuesday</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User History:</span>
                      <span className="font-medium">45 transactions</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="secondary"
                    onClick={() =>
                      setTransaction({
                        amount: "50.00",
                        type: "PAYMENT",
                        origin_country: "US",
                        dest_country: "US",
                        hour: "14",
                        day_of_week: "2",
                        origin_balance: "1500.00",
                        dest_balance: "800.00",
                        user_transaction_count: "45",
                      })
                    }
                  >
                    Load Example
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
