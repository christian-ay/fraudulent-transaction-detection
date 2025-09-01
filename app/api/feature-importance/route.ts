import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock feature importance data
    const mockFeatureImportance = {
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
      "Gradient Boosting": {
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
          0.221, 0.198, 0.143, 0.112, 0.089, 0.071, 0.058, 0.039, 0.034, 0.029, 0.023, 0.019, 0.017, 0.015, 0.013,
        ],
        top_features: [
          ["amount_log", 0.221],
          ["balance_ratio_origin", 0.198],
          ["user_transaction_count", 0.143],
          ["amount_zscore", 0.112],
          ["is_cross_border", 0.089],
          ["hour", 0.071],
          ["balance_ratio_dest", 0.058],
          ["is_night", 0.039],
          ["is_weekend", 0.034],
          ["day_of_week", 0.029],
        ],
      },
      "Logistic Regression": {
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
          0.198, 0.176, 0.134, 0.121, 0.095, 0.078, 0.063, 0.045, 0.038, 0.032, 0.027, 0.023, 0.019, 0.016, 0.014,
        ],
        top_features: [
          ["amount_log", 0.198],
          ["balance_ratio_origin", 0.176],
          ["user_transaction_count", 0.134],
          ["amount_zscore", 0.121],
          ["is_cross_border", 0.095],
          ["hour", 0.078],
          ["balance_ratio_dest", 0.063],
          ["is_night", 0.045],
          ["is_weekend", 0.038],
          ["day_of_week", 0.032],
        ],
      },
      "Decision Tree": {
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
          0.267, 0.201, 0.178, 0.089, 0.076, 0.054, 0.043, 0.032, 0.028, 0.024, 0.021, 0.018, 0.015, 0.012, 0.01,
        ],
        top_features: [
          ["amount_log", 0.267],
          ["balance_ratio_origin", 0.201],
          ["user_transaction_count", 0.178],
          ["amount_zscore", 0.089],
          ["is_cross_border", 0.076],
          ["hour", 0.054],
          ["balance_ratio_dest", 0.043],
          ["is_night", 0.032],
          ["is_weekend", 0.028],
          ["day_of_week", 0.024],
        ],
      },
    }

    return NextResponse.json(mockFeatureImportance)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load feature importance data" }, { status: 500 })
  }
}
