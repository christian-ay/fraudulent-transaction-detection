import { NextResponse } from "next/server"

export async function GET() {
  try {
    const randomForestFeatureImportance = {
      "Random Forest": {
        features: [
          "amount_log",
          "balance_ratio_origin",
          "user_transaction_count",
          "amount_zscore",
          "is_cross_border",
          "hour",
          "balance_ratio_dest",
          "is_night",
          "is_weekend",
          "day_of_week",
          "is_merchant_dest",
          "type_CASH_OUT",
          "type_TRANSFER",
          "type_PAYMENT",
          "type_CASH_IN",
        ],
        importance: [
          0.234, 0.187, 0.156, 0.098, 0.087, 0.065, 0.054, 0.043, 0.032, 0.028, 0.025, 0.021, 0.019, 0.017, 0.015,
        ],
        top_features: [
          ["amount_log", 0.234],
          ["balance_ratio_origin", 0.187],
          ["user_transaction_count", 0.156],
          ["amount_zscore", 0.098],
          ["is_cross_border", 0.087],
          ["hour", 0.065],
          ["balance_ratio_dest", 0.054],
          ["is_night", 0.043],
          ["is_weekend", 0.032],
          ["day_of_week", 0.028],
        ],
      },
    }

    return NextResponse.json(randomForestFeatureImportance)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load Random Forest feature importance data" }, { status: 500 })
  }
}
