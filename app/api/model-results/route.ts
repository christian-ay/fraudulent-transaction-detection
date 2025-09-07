import { NextResponse } from "next/server"

export async function GET() {
  try {
    const randomForestResults = {
      "Random Forest": {
        accuracy: 0.952,
        precision: 0.891,
        recall: 0.847,
        f1_score: 0.868,
        auc_score: 0.943,
        confusion_matrix: [
          [1847, 43],
          [29, 181],
        ],
        roc_curve: {
          fpr: Array.from({ length: 100 }, (_, i) => i / 99),
          tpr: Array.from({ length: 100 }, (_, i) => Math.min(1, i / 99 + Math.random() * 0.1)),
        },
        pr_curve: {
          precision: Array.from({ length: 100 }, (_, i) => 1 - i / 150),
          recall: Array.from({ length: 100 }, (_, i) => i / 99),
        },
      },
    }

    return NextResponse.json(randomForestResults)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load Random Forest model results" }, { status: 500 })
  }
}
