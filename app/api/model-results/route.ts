import { NextResponse } from "next/server"
import path from "path"

export async function GET() {
  try {
    const resultsPath = path.join(process.cwd(), "model_results_latest.pkl")

    // For now, return mock data since we can't directly read pickle files in Node.js
    // In a real implementation, you'd use a Python service or convert to JSON
    const mockResults = {
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
      "Gradient Boosting": {
        accuracy: 0.948,
        precision: 0.876,
        recall: 0.833,
        f1_score: 0.854,
        auc_score: 0.938,
        confusion_matrix: [
          [1842, 48],
          [35, 175],
        ],
        roc_curve: {
          fpr: Array.from({ length: 100 }, (_, i) => i / 99),
          tpr: Array.from({ length: 100 }, (_, i) => Math.min(1, i / 99 + Math.random() * 0.08)),
        },
        pr_curve: {
          precision: Array.from({ length: 100 }, (_, i) => 1 - i / 140),
          recall: Array.from({ length: 100 }, (_, i) => i / 99),
        },
      },
      "Logistic Regression": {
        accuracy: 0.931,
        precision: 0.823,
        recall: 0.795,
        f1_score: 0.809,
        auc_score: 0.912,
        confusion_matrix: [
          [1821, 69],
          [43, 167],
        ],
        roc_curve: {
          fpr: Array.from({ length: 100 }, (_, i) => i / 99),
          tpr: Array.from({ length: 100 }, (_, i) => Math.min(1, i / 99 + Math.random() * 0.06)),
        },
        pr_curve: {
          precision: Array.from({ length: 100 }, (_, i) => 1 - i / 130),
          recall: Array.from({ length: 100 }, (_, i) => i / 99),
        },
      },
      SVM: {
        accuracy: 0.925,
        precision: 0.801,
        recall: 0.771,
        f1_score: 0.786,
        auc_score: 0.898,
        confusion_matrix: [
          [1815, 75],
          [48, 162],
        ],
        roc_curve: {
          fpr: Array.from({ length: 100 }, (_, i) => i / 99),
          tpr: Array.from({ length: 100 }, (_, i) => Math.min(1, i / 99 + Math.random() * 0.05)),
        },
        pr_curve: {
          precision: Array.from({ length: 100 }, (_, i) => 1 - i / 125),
          recall: Array.from({ length: 100 }, (_, i) => i / 99),
        },
      },
      "Decision Tree": {
        accuracy: 0.918,
        precision: 0.778,
        recall: 0.752,
        f1_score: 0.765,
        auc_score: 0.881,
        confusion_matrix: [
          [1808, 82],
          [52, 158],
        ],
        roc_curve: {
          fpr: Array.from({ length: 100 }, (_, i) => i / 99),
          tpr: Array.from({ length: 100 }, (_, i) => Math.min(1, i / 99 + Math.random() * 0.04)),
        },
        pr_curve: {
          precision: Array.from({ length: 100 }, (_, i) => 1 - i / 120),
          recall: Array.from({ length: 100 }, (_, i) => i / 99),
        },
      },
      AdaBoost: {
        accuracy: 0.913,
        precision: 0.756,
        recall: 0.729,
        f1_score: 0.742,
        auc_score: 0.867,
        confusion_matrix: [
          [1802, 88],
          [57, 153],
        ],
        roc_curve: {
          fpr: Array.from({ length: 100 }, (_, i) => i / 99),
          tpr: Array.from({ length: 100 }, (_, i) => Math.min(1, i / 99 + Math.random() * 0.03)),
        },
        pr_curve: {
          precision: Array.from({ length: 100 }, (_, i) => 1 - i / 115),
          recall: Array.from({ length: 100 }, (_, i) => i / 99),
        },
      },
      "Naive Bayes": {
        accuracy: 0.889,
        precision: 0.698,
        recall: 0.724,
        f1_score: 0.711,
        auc_score: 0.834,
        confusion_matrix: [
          [1776, 114],
          [58, 152],
        ],
        roc_curve: {
          fpr: Array.from({ length: 100 }, (_, i) => i / 99),
          tpr: Array.from({ length: 100 }, (_, i) => Math.min(1, i / 99 + Math.random() * 0.02)),
        },
        pr_curve: {
          precision: Array.from({ length: 100 }, (_, i) => 1 - i / 110),
          recall: Array.from({ length: 100 }, (_, i) => i / 99),
        },
      },
      "K-Nearest Neighbors": {
        accuracy: 0.876,
        precision: 0.672,
        recall: 0.695,
        f1_score: 0.683,
        auc_score: 0.812,
        confusion_matrix: [
          [1768, 122],
          [64, 146],
        ],
        roc_curve: {
          fpr: Array.from({ length: 100 }, (_, i) => i / 99),
          tpr: Array.from({ length: 100 }, (_, i) => Math.min(1, i / 99 + Math.random() * 0.01)),
        },
        pr_curve: {
          precision: Array.from({ length: 100 }, (_, i) => 1 - i / 105),
          recall: Array.from({ length: 100 }, (_, i) => i / 99),
        },
      },
    }

    return NextResponse.json(mockResults)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load model results" }, { status: 500 })
  }
}
