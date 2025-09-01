import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Generate mock transaction data
    const generateMockTransactions = (count: number) => {
      const transactions = []
      const transactionTypes = ["CASH_IN", "CASH_OUT", "TRANSFER", "PAYMENT", "DEBIT"]
      const countries = ["US", "UK", "KE", "UG", "TZ", "GH", "NG"]

      for (let i = 0; i < count; i++) {
        const isFraud = Math.random() < 0.1 // 10% fraud rate
        const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]

        // Generate realistic amounts based on type
        let baseAmount = 100
        if (type === "CASH_IN") baseAmount = 200
        if (type === "CASH_OUT") baseAmount = 150
        if (type === "TRANSFER") baseAmount = 300
        if (type === "PAYMENT") baseAmount = 80

        let amount = baseAmount * (0.5 + Math.random() * 2)

        // Fraudulent transactions tend to be higher
        if (isFraud) {
          amount *= 1 + Math.random() * 3
        }

        const originCountry = countries[Math.floor(Math.random() * countries.length)]
        let destCountry = originCountry

        // Cross-border transactions more likely to be fraud
        if (isFraud && Math.random() < 0.4) {
          destCountry = countries[Math.floor(Math.random() * countries.length)]
        }

        // Generate timestamp (last 30 days)
        const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)

        // Fraud more likely at night
        if (isFraud && Math.random() < 0.3) {
          timestamp.setHours(Math.floor(Math.random() * 4) + 1) // 1-4 AM
        }

        const originBalance = amount + Math.random() * 5000
        const destBalance = Math.random() * 3000

        transactions.push({
          transaction_id: `TXN_${String(i).padStart(8, "0")}`,
          timestamp: timestamp.toISOString(),
          type,
          amount: Math.round(amount * 100) / 100,
          origin_user: `USER_${String(Math.floor(Math.random() * 5000)).padStart(6, "0")}`,
          dest_user: `${Math.random() < 0.1 ? "MERCHANT" : "USER"}_${String(Math.floor(Math.random() * 5000)).padStart(6, "0")}`,
          origin_country: originCountry,
          dest_country: destCountry,
          is_fraud: isFraud ? 1 : 0,
          origin_balance_before: Math.round(originBalance * 100) / 100,
          origin_balance_after: Math.round((originBalance - amount) * 100) / 100,
          dest_balance_before: Math.round(destBalance * 100) / 100,
          dest_balance_after: Math.round((destBalance + amount) * 100) / 100,
        })
      }

      return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }

    const transactions = generateMockTransactions(2000)

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 })
  }
}
