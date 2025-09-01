"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { BarChart3, Target, AlertTriangle, CheckCircle, Brain, Zap, Award, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

interface ModelResult {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  auc_score: number
  confusion_matrix: number[][]
  roc_curve: { fpr: number[]; tpr: number[] }
  pr_curve: { precision: number[]; recall: number[] }
}

interface ModelResults {
  [key: string]: ModelResult
}

interface FeatureImportance {
  [key: string]: {
    features: string[]
    importance: number[]
    top_features: [string, number][]
  }
}

export default function ModelEvaluationDashboard() {
  const [modelResults, setModelResults] = useState<ModelResults | null>(null)
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModelResults = async () => {
    try {
      setLoading(true)
      const [resultsResponse, importanceResponse] = await Promise.all([
        fetch("/api/model-results"),
        fetch("/api/feature-importance"),
      ])

      if (!resultsResponse.ok || !importanceResponse.ok) {
        throw new Error("Failed to fetch model data")
      }

      const results = await resultsResponse.json()
      const importance = await importanceResponse.json()

      setModelResults(results)
      setFeatureImportance(importance)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModelResults()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading model evaluation data...</p>
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
            <AlertDescription>{error}. Please ensure models have been trained first.</AlertDescription>
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

  // Prepare data for charts
  const performanceData = modelResults
    ? Object.entries(modelResults).map(([name, result]) => ({
        model: name.replace(/([A-Z])/g, " $1").trim(),
        AUC: result.auc_score,
        F1: result.f1_score,
        Precision: result.precision,
        Recall: result.recall,
        Accuracy: result.accuracy,
      }))
    : []

  // Get best performing model
  const bestModel = performanceData.reduce(
    (best, current) => (current.AUC > best.AUC ? current : best),
    performanceData[0] || { model: "None", AUC: 0 },
  )

  // Prepare ROC curve data
  const rocData = modelResults
    ? Object.entries(modelResults).map(([name, result]) => ({
        name: name.replace(/([A-Z])/g, " $1").trim(),
        data: result.roc_curve.fpr.map((fpr, i) => ({
          fpr,
          tpr: result.roc_curve.tpr[i],
        })),
      }))
    : []

  // Colors for charts
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Model Evaluation Dashboard</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive analysis of fraud detection model performance
            </p>
          </div>
          <Button onClick={fetchModelResults} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Model</p>
                  <p className="text-xl font-bold text-green-600">{bestModel.model}</p>
                  <p className="text-sm text-gray-500">AUC: {bestModel.AUC.toFixed(3)}</p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Models Trained</p>
                  <p className="text-2xl font-bold text-blue-600">{performanceData.length}</p>
                  <p className="text-sm text-gray-500">Traditional ML</p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Performance</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(performanceData.reduce((sum, model) => sum + model.AUC, 0) / performanceData.length).toFixed(3)}
                  </p>
                  <p className="text-sm text-gray-500">AUC Score</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-lg font-bold text-green-600">Ready</p>
                  </div>
                  <p className="text-sm text-gray-500">All models trained</p>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Performance Overview</TabsTrigger>
            <TabsTrigger value="roc">ROC Analysis</TabsTrigger>
            <TabsTrigger value="features">Feature Importance</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
          </TabsList>

          {/* Performance Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance Comparison</CardTitle>
                  <CardDescription>AUC scores across all trained models</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={80} fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="AUC" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Metrics Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Best Model Metrics</CardTitle>
                  <CardDescription>Comprehensive view of {bestModel.model} performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart
                      data={[
                        { metric: "AUC", value: bestModel.AUC },
                        { metric: "F1", value: bestModel.F1 },
                        { metric: "Precision", value: bestModel.Precision },
                        { metric: "Recall", value: bestModel.Recall },
                        { metric: "Accuracy", value: bestModel.Accuracy },
                      ]}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 1]} />
                      <Radar name="Performance" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Detailed metrics for all models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Model</th>
                        <th className="text-center p-2">AUC</th>
                        <th className="text-center p-2">F1 Score</th>
                        <th className="text-center p-2">Precision</th>
                        <th className="text-center p-2">Recall</th>
                        <th className="text-center p-2">Accuracy</th>
                        <th className="text-center p-2">Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData
                        .sort((a, b) => b.AUC - a.AUC)
                        .map((model, index) => (
                          <tr key={model.model} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-2 font-medium">{model.model}</td>
                            <td className="text-center p-2">
                              <Badge variant={index === 0 ? "default" : "secondary"}>{model.AUC.toFixed(3)}</Badge>
                            </td>
                            <td className="text-center p-2">{model.F1.toFixed(3)}</td>
                            <td className="text-center p-2">{model.Precision.toFixed(3)}</td>
                            <td className="text-center p-2">{model.Recall.toFixed(3)}</td>
                            <td className="text-center p-2">{model.Accuracy.toFixed(3)}</td>
                            <td className="text-center p-2">
                              <Badge variant={index === 0 ? "default" : "outline"}>#{index + 1}</Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROC Analysis Tab */}
          <TabsContent value="roc" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ROC Curves Comparison</CardTitle>
                <CardDescription>Receiver Operating Characteristic curves for all models</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="fpr"
                      type="number"
                      domain={[0, 1]}
                      label={{ value: "False Positive Rate", position: "insideBottom", offset: -10 }}
                    />
                    <YAxis
                      dataKey="tpr"
                      type="number"
                      domain={[0, 1]}
                      label={{ value: "True Positive Rate", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip />
                    <Legend />

                    {/* Diagonal line */}
                    <Line
                      data={[
                        { fpr: 0, tpr: 0 },
                        { fpr: 1, tpr: 1 },
                      ]}
                      dataKey="tpr"
                      stroke="#94A3B8"
                      strokeDasharray="5 5"
                      dot={false}
                      name="Random Classifier"
                    />

                    {rocData.map((model, index) => (
                      <Line
                        key={model.name}
                        data={model.data}
                        dataKey="tpr"
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={false}
                        name={`${model.name} (AUC: ${performanceData.find((p) => p.model === model.name)?.AUC.toFixed(3) || "N/A"})`}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Importance Tab */}
          <TabsContent value="features" className="space-y-6">
            {featureImportance &&
              Object.entries(featureImportance).map(([modelName, importance]) => (
                <Card key={modelName}>
                  <CardHeader>
                    <CardTitle>{modelName.replace(/([A-Z])/g, " $1").trim()} - Top Features</CardTitle>
                    <CardDescription>Most important features for fraud detection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={importance.top_features.slice(0, 10).map(([feature, score]) => ({
                          feature: feature.replace(/_/g, " "),
                          importance: score,
                        }))}
                        layout="horizontal"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="feature" type="category" width={120} fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="importance" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* Detailed Metrics Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {modelResults &&
                Object.entries(modelResults).map(([modelName, result]) => (
                  <Card key={modelName}>
                    <CardHeader>
                      <CardTitle>{modelName.replace(/([A-Z])/g, " $1").trim()}</CardTitle>
                      <CardDescription>Detailed performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">AUC Score</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={result.auc_score * 100} className="flex-1" />
                            <span className="text-sm font-medium">{result.auc_score.toFixed(3)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">F1 Score</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={result.f1_score * 100} className="flex-1" />
                            <span className="text-sm font-medium">{result.f1_score.toFixed(3)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Precision</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={result.precision * 100} className="flex-1" />
                            <span className="text-sm font-medium">{result.precision.toFixed(3)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Recall</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={result.recall * 100} className="flex-1" />
                            <span className="text-sm font-medium">{result.recall.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Confusion Matrix */}
                      <div>
                        <p className="text-sm font-medium mb-2">Confusion Matrix</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="bg-green-100 dark:bg-green-900 p-2 text-center rounded">
                            <div className="font-medium">True Neg</div>
                            <div className="text-lg">{result.confusion_matrix[0][0]}</div>
                          </div>
                          <div className="bg-red-100 dark:bg-red-900 p-2 text-center rounded">
                            <div className="font-medium">False Pos</div>
                            <div className="text-lg">{result.confusion_matrix[0][1]}</div>
                          </div>
                          <div className="bg-red-100 dark:bg-red-900 p-2 text-center rounded">
                            <div className="font-medium">False Neg</div>
                            <div className="text-lg">{result.confusion_matrix[1][0]}</div>
                          </div>
                          <div className="bg-green-100 dark:bg-green-900 p-2 text-center rounded">
                            <div className="font-medium">True Pos</div>
                            <div className="text-lg">{result.confusion_matrix[1][1]}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
