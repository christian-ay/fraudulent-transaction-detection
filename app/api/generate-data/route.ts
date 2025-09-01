import { NextResponse } from "next/server"

function generateMobileMoneyTransactions(numTransactions = 10000) {
  const transactionTypes = ["CASH_IN", "CASH_OUT", "TRANSFER", "PAYMENT", "DEBIT"]
  const userIds = Array.from({ length: 5000 }, (_, i) => `USER_${String(i + 1).padStart(6, "0")}`)
  const merchantIds = Array.from({ length: 500 }, (_, i) => `MERCHANT_${String(i + 1).padStart(4, "0")}`)
  const countries = ["US", "UK", "KE", "UG", "TZ", "GH", "NG"]

  const transactions = []

  for (let i = 0; i < numTransactions; i++) {
    const transactionId = `TXN_${String(i).padStart(8, "0")}`
    const timestamp = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    const transType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
    const originUser = userIds[Math.floor(Math.random() * userIds.length)]
    const destUser = [...userIds, ...merchantIds][Math.floor(Math.random() * (userIds.length + merchantIds.length))]

    // Generate amount based on transaction type with log-normal distribution approximation
    let amount: number
    switch (transType) {
      case "CASH_IN":
        amount = Math.exp(Math.random() * 3 + 2) // Approximates lognormal(4, 1.5)
        break
      case "CASH_OUT":
        amount = Math.exp(Math.random() * 2.4 + 1.8) // Approximates lognormal(3.5, 1.2)
        break
      case "TRANSFER":
        amount = Math.exp(Math.random() * 3.6 + 1.2) // Approximates lognormal(3, 1.8)
        break
      case "PAYMENT":
        amount = Math.exp(Math.random() * 3 + 1) // Approximates lognormal(2.5, 1.5)
        break
      default: // DEBIT
        amount = Math.exp(Math.random() * 2 + 0.5) // Approximates lognormal(2, 1)
    }
    amount = Math.round(Math.max(amount, 1) * 100) / 100

    const originBalanceBefore = Math.max(amount + Math.random() * 2000, amount)
    const destBalanceBefore = Math.random() * 1600

    let originBalanceAfter: number, destBalanceAfter: number
    if (["CASH_OUT", "TRANSFER", "PAYMENT", "DEBIT"].includes(transType)) {
      originBalanceAfter = originBalanceBefore - amount
      destBalanceAfter = destBalanceBefore + amount
    } else {
      originBalanceAfter = originBalanceBefore + amount
      destBalanceAfter = destBalanceBefore
    }

    const originCountry = countries[Math.floor(Math.random() * countries.length)]
    let destCountry = originCountry
    if (Math.random() < 0.05) {
      destCountry = countries[Math.floor(Math.random() * countries.length)]
    }

    // Determine fraud (10% rate)
    const isFraud = Math.random() < 0.1

    if (isFraud) {
      // Apply fraud patterns
      if (Math.random() < 0.3) amount *= Math.random() * 15 + 5 // High amount
      if (Math.random() < 0.4) destCountry = ["XX", "YY", "ZZ"][Math.floor(Math.random() * 3)] // Suspicious countries
      if (Math.random() < 0.5) timestamp.setHours(Math.floor(Math.random() * 3) + 2) // Late night
    }

    transactions.push({
      transaction_id: transactionId,
      timestamp: timestamp.toISOString(),
      type: transType,
      amount: Math.round(amount * 100) / 100,
      origin_user: originUser,
      dest_user: destUser,
      origin_balance_before: Math.round(originBalanceBefore * 100) / 100,
      origin_balance_after: Math.round(originBalanceAfter * 100) / 100,
      dest_balance_before: Math.round(destBalanceBefore * 100) / 100,
      dest_balance_after: Math.round(destBalanceAfter * 100) / 100,
      origin_country: originCountry,
      dest_country: destCountry,
      is_fraud: isFraud ? 1 : 0,
    })
  }

  return transactions
}

function engineerFeatures(transactions: any[]) {
  return transactions.map((tx) => {
    const timestamp = new Date(tx.timestamp)
    const hour = timestamp.getHours()
    const dayOfWeek = timestamp.getDay()

    return {
      ...tx,
      hour,
      day_of_week: dayOfWeek,
      is_weekend: [0, 6].includes(dayOfWeek) ? 1 : 0,
      is_night: hour >= 22 || hour <= 5 ? 1 : 0,
      amount_log: Math.log1p(tx.amount),
      balance_change_origin: tx.origin_balance_after - tx.origin_balance_before,
      balance_ratio_origin: tx.amount / (tx.origin_balance_before + 1),
      balance_ratio_dest: tx.amount / (tx.dest_balance_before + 1),
      is_cross_border: tx.origin_country !== tx.dest_country ? 1 : 0,
      is_merchant_dest: tx.dest_user.includes("MERCHANT") ? 1 : 0,
      type_CASH_IN: tx.type === "CASH_IN" ? 1 : 0,
      type_CASH_OUT: tx.type === "CASH_OUT" ? 1 : 0,
      type_TRANSFER: tx.type === "TRANSFER" ? 1 : 0,
      type_PAYMENT: tx.type === "PAYMENT" ? 1 : 0,
      type_DEBIT: tx.type === "DEBIT" ? 1 : 0,
    }
  })
}

export async function POST() {
  try {
    console.log("[v0] Starting data generation...")

    const transactions = generateMobileMoneyTransactions(10000)
    const featuredTransactions = engineerFeatures(transactions)

    const fraudCount = transactions.filter((tx) => tx.is_fraud === 1).length
    const fraudRate = fraudCount / transactions.length

    console.log("[v0] Data generation completed successfully")

    return NextResponse.json({
      success: true,
      message: "Data generation completed successfully",
      data: {
        total_transactions: transactions.length,
        fraud_count: fraudCount,
        fraud_rate: Math.round(fraudRate * 10000) / 100,
        sample_transactions: featuredTransactions.slice(0, 5),
        feature_count: Object.keys(featuredTransactions[0]).length,
      },
    })
  } catch (error) {
    console.log("[v0] Error in data generation:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
