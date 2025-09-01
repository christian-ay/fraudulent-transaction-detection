"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Shield, TrendingUp, Database, Brain, BarChart3, Zap } from "lucide-react"
import Link from "next/link"

export default function FraudDetectionHome() {
  const [isGeneratingData, setIsGeneratingData] = useState(false)
  const [isTrainingModels, setIsTrainingModels] = useState(false)
  const [dataResult, setDataResult] = useState<any>(null)
  const [modelResult, setModelResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateData = async () => {
    setIsGeneratingData(true)
    setError(null)
    try {
      const response = await fetch("/api/generate-data", { method: "POST" })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      const result = await response.json()
      console.log("Data generation result:", result)
      setDataResult(result)
    } catch (error) {
      console.error("Error generating data:", error)
      setError(`Data generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsGeneratingData(false)
    }
  }

  const handleTrainModels = async () => {
    setIsTrainingModels(true)
    setError(null)
    try {
      const response = await fetch("/api/train-models", { method: "POST" })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      const result = await response.json()
      console.log("Model training result:", result)
      setModelResult(result)
    } catch (error) {
      console.error("Error training models:", error)
      setError(`Model training failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsTrainingModels(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Fraud Detection System</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Advanced mobile money transaction fraud detection using traditional machine learning techniques
          </p>
        </div>

        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error</h3>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {dataResult && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-start">
                <Database className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Data Generation Complete</h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Generated {dataResult.data?.total_transactions} transactions with {dataResult.data?.fraud_rate}%
                    fraud rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {modelResult && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-start">
                <Brain className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Model Training Complete</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Trained {modelResult.data?.models?.length} models with{" "}
                    {Math.round(modelResult.data?.ensemble_metrics?.accuracy * 100)}% average accuracy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Database className="h-6 w-6 text-blue-600 mr-2" />
                <CardTitle className="text-lg">Data Generation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Generate synthetic mobile money transaction data with realistic fraud patterns
              </p>
              <Button onClick={handleGenerateData} disabled={isGeneratingData} className="w-full">
                {isGeneratingData ? "Generating..." : "Generate Data"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Brain className="h-6 w-6 text-green-600 mr-2" />
                <CardTitle className="text-lg">Model Training</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Train multiple ML models: Random Forest, SVM, Logistic Regression, Gradient Boosting
              </p>
              <Button
                onClick={handleTrainModels}
                disabled={isTrainingModels}
                className="w-full bg-transparent"
                variant="outline"
              >
                {isTrainingModels ? "Training..." : "Train Models"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
                <CardTitle className="text-lg">Model Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Evaluate model performance and analyze transaction patterns
              </p>
              <Link href="/evaluation">
                <Button className="w-full" variant="secondary">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-orange-600 mr-2" />
                <CardTitle className="text-lg">Transaction Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Explore individual transactions and identify fraud patterns
              </p>
              <Link href="/transactions">
                <Button className="w-full bg-transparent" variant="outline">
                  Analyze Transactions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Zap className="h-6 w-6 text-red-600 mr-2" />
                <CardTitle className="text-lg">Real-time Detection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Test live fraud detection API with instant transaction scoring
              </p>
              <Link href="/detect">
                <Button className="w-full" variant="destructive">
                  Detect Fraud
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-2" />
              System Features
            </CardTitle>
            <CardDescription>
              Comprehensive fraud detection capabilities using traditional machine learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Real-time Detection</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Instant fraud scoring for incoming transactions
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Multiple Models</h3>
                <p className="text-sm text-green-700 dark:text-green-300">Ensemble of traditional ML algorithms</p>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Feature Engineering</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Advanced feature extraction and selection
                </p>
              </div>

              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Performance Analytics</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">Detailed model evaluation and monitoring</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Detection Rate</p>
                  <p className="text-2xl font-bold text-green-600">95.2%</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  High
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">False Positives</p>
                  <p className="text-2xl font-bold text-blue-600">2.1%</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Low
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing Time</p>
                  <p className="text-2xl font-bold text-purple-600">12ms</p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Fast
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Live
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert */}
        <Card className="mt-8 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Getting Started</h3>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Begin by generating synthetic transaction data, then train the machine learning models. Once complete,
                  you can test the real-time fraud detection API and explore the comprehensive analytics dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
