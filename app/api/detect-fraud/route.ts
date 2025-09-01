import { NextResponse } from "next/server"

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

function engineerFeatures(transaction: TransactionInput) {
  const amount = Number.parseFloat(transaction.amount)
  const originBalance = Number.parseFloat(transaction.origin_balance)
  const destBalance = Number.parseFloat(transaction.dest_balance)
  const hour = Number.parseInt(transaction.hour)
  const dayOfWeek = Number.parseInt(transaction.day_of_week)
  const userTxnCount = Number.parseInt(transaction.user_transaction_count)

  return {
    amount_log: Math.log1p(amount),
    amount_zscore: (amount - 500) / 1000, // Simplified z-score
    balance_ratio_origin: amount / (originBalance + 1),
    balance_ratio_dest: amount / (destBalance + 1),
    is_cross_border: transaction.origin_country !== transaction.dest_country ? 1 : 0,
    is_night: hour >= 22 || hour <= 5 ? 1 : 0,
    is_weekend: dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0,
    is_merchant_dest: transaction.dest_country.includes("MERCHANT") ? 1 : 0,
    user_transaction_count: userTxnCount,
    hour: hour,
    day_of_week: dayOfWeek,
    // Transaction type features
    type_CASH_IN: transaction.type === "CASH_IN" ? 1 : 0,
    type_CASH_OUT: transaction.type === "CASH_OUT" ? 1 : 0,
    type_TRANSFER: transaction.type === "TRANSFER" ? 1 : 0,
    type_PAYMENT: transaction.type === "PAYMENT" ? 1 : 0,
    type_DEBIT: transaction.type === "DEBIT" ? 1 : 0,
  }
}

function predictFraud(features: any): FraudDetectionResult {
  const startTime = Date.now()

  // Simulate model predictions based on engineered features
  const riskFactors = []

  // High amount risk
  const amountRisk = Math.min(features.amount_log / 10, 1)

  // Cross-border risk
  const crossBorderRisk = features.is_cross_border * 0.3

  // Time-based risk
  const timeRisk = features.is_night * 0.2 + features.is_weekend * 0.1

  // Balance ratio risk
  const balanceRisk = Math.min(features.balance_ratio_origin * 2, 0.4)

  // User history risk (new users are riskier)
  const historyRisk = Math.max(0, ((20 - features.user_transaction_count) / 20) * 0.3)

  // Transaction type risk
  const typeRisk = features.type_CASH_OUT * 0.2 + features.type_TRANSFER * 0.1

  // Calculate base fraud probability
  let fraudProb = amountRisk + crossBorderRisk + timeRisk + balanceRisk + historyRisk + typeRisk
  fraudProb = Math.min(Math.max(fraudProb, 0.01), 0.99) // Clamp between 1% and 99%

  // Add some randomness to simulate model uncertainty
  fraudProb += (Math.random() - 0.5) * 0.1
  fraudProb = Math.min(Math.max(fraudProb, 0.01), 0.99)

  // Generate individual model predictions
  const modelPredictions = {
    "Random Forest": Math.min(Math.max(fraudProb + (Math.random() - 0.5) * 0.1, 0.01), 0.99),
    "Gradient Boosting": Math.min(Math.max(fraudProb + (Math.random() - 0.5) * 0.08, 0.01), 0.99),
    "Logistic Regression": Math.min(Math.max(fraudProb + (Math.random() - 0.5) * 0.12, 0.01), 0.99),
    SVM: Math.min(Math.max(fraudProb + (Math.random() - 0.5) * 0.15, 0.01), 0.99),
    "Decision Tree": Math.min(Math.max(fraudProb + (Math.random() - 0.5) * 0.2, 0.01), 0.99),
    AdaBoost: Math.min(Math.max(fraudProb + (Math.random() - 0.5) * 0.18, 0.01), 0.99),
    "Naive Bayes": Math.min(Math.max(fraudProb + (Math.random() - 0.5) * 0.25, 0.01), 0.99),
    "K-Nearest Neighbors": Math.min(Math.max(fraudProb + (Math.random() - 0.5) * 0.3, 0.01), 0.99),
  }

  // Calculate ensemble prediction (weighted average)
  const weights = {
    "Random Forest": 0.2,
    "Gradient Boosting": 0.18,
    "Logistic Regression": 0.15,
    SVM: 0.12,
    "Decision Tree": 0.1,
    AdaBoost: 0.1,
    "Naive Bayes": 0.08,
    "K-Nearest Neighbors": 0.07,
  }

  fraudProb = Object.entries(modelPredictions).reduce((sum, [model, prob]) => {
    return sum + prob * weights[model as keyof typeof weights]
  }, 0)

  // Identify risk factors
  if (Number.parseFloat(features.amount_log) > 6) {
    riskFactors.push("High transaction amount")
  }

  if (features.is_cross_border) {
    riskFactors.push("Cross-border transaction")
  }

  if (features.is_night) {
    riskFactors.push("Unusual time (night hours)")
  }

  if (features.is_weekend) {
    riskFactors.push("Weekend transaction")
  }

  if (features.balance_ratio_origin > 0.8) {
    riskFactors.push("High balance utilization")
  }

  if (features.user_transaction_count < 5) {
    riskFactors.push("New user with limited history")
  }

  if (features.type_CASH_OUT) {
    riskFactors.push("Cash-out transaction type")
  }

  // Calculate confidence based on model agreement
  const predictions = Object.values(modelPredictions)
  const mean = predictions.reduce((a, b) => a + b, 0) / predictions.length
  const variance = predictions.reduce((sum, pred) => sum + Math.pow(pred - mean, 2), 0) / predictions.length
  const confidence = Math.max(0.5, 1 - Math.sqrt(variance) * 2)

  const isFraud = fraudProb > 0.5
  const riskScore = Math.round(fraudProb * 100)

  let recommendation = ""
  if (fraudProb > 0.8) {
    recommendation = "Block transaction immediately and flag for investigation"
  } else if (fraudProb > 0.6) {
    recommendation = "Require additional verification before processing"
  } else if (fraudProb > 0.4) {
    recommendation = "Monitor transaction and user activity closely"
  } else {
    recommendation = "Process transaction normally"
  }

  const processingTime = Date.now() - startTime

  return {
    is_fraud_predicted: isFraud,
    fraud_probability: fraudProb,
    risk_score: riskScore,
    confidence: confidence,
    model_predictions: modelPredictions,
    risk_factors: riskFactors,
    recommendation: recommendation,
    processing_time_ms: processingTime,
  }
}

export async function POST(request: Request) {
  try {
    const transaction: TransactionInput = await request.json()

    // Validate required fields
    const requiredFields = [
      "amount",
      "type",
      "origin_country",
      "dest_country",
      "hour",
      "day_of_week",
      "origin_balance",
      "dest_balance",
      "user_transaction_count",
    ]

    for (const field of requiredFields) {
      if (!transaction[field as keyof TransactionInput]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Engineer features
    const features = engineerFeatures(transaction)

    // Predict fraud
    const result = predictFraud(features)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to process fraud detection request" }, { status: 500 })
  }
}
