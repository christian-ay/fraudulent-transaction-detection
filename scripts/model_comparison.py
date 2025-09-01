import pandas as pd
import numpy as np
import json
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_curve, precision_recall_curve
import warnings
warnings.filterwarnings('ignore')

def load_model_results():
    """Load the latest model results"""
    try:
        model_results = joblib.load('model_results_latest.pkl')
        
        with open('model_metadata_latest.json', 'r') as f:
            metadata = json.load(f)
        
        with open('feature_importance_latest.json', 'r') as f:
            importance_data = json.load(f)
        
        return model_results, metadata, importance_data
    except FileNotFoundError:
        print("Model results not found. Please run train_ml_models.py first.")
        return None, None, None

def create_performance_comparison():
    """Create comprehensive model performance comparison"""
    
    model_results, metadata, importance_data = load_model_results()
    
    if model_results is None:
        return None
    
    # Extract performance metrics
    performance_data = []
    
    for model_name, results in model_results.items():
        performance_data.append({
            'Model': model_name,
            'AUC': results['auc_score'],
            'F1 Score': results['f1_score'],
            'Precision': results['precision'],
            'Recall': results['recall'],
            'Accuracy': results['accuracy']
        })
    
    performance_df = pd.DataFrame(performance_data)
    
    # Create comparison plots
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle('Model Performance Comparison', fontsize=16, fontweight='bold')
    
    metrics = ['AUC', 'F1 Score', 'Precision', 'Recall', 'Accuracy']
    
    for i, metric in enumerate(metrics):
        row = i // 3
        col = i % 3
        
        # Sort by metric value
        sorted_df = performance_df.sort_values(metric, ascending=True)
        
        # Create horizontal bar plot
        bars = axes[row, col].barh(sorted_df['Model'], sorted_df[metric])
        axes[row, col].set_title(f'{metric} Comparison')
        axes[row, col].set_xlabel(metric)
        
        # Color bars based on performance
        colors = plt.cm.RdYlGn(sorted_df[metric] / sorted_df[metric].max())
        for bar, color in zip(bars, colors):
            bar.set_color(color)
        
        # Add value labels
        for i, (model, value) in enumerate(zip(sorted_df['Model'], sorted_df[metric])):
            axes[row, col].text(value + 0.01, i, f'{value:.3f}', 
                              va='center', fontweight='bold')
    
    # Remove empty subplot
    axes[1, 2].remove()
    
    plt.tight_layout()
    plt.savefig('model_performance_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    return performance_df

def create_roc_comparison():
    """Create ROC curve comparison plot"""
    
    model_results, _, _ = load_model_results()
    
    if model_results is None:
        return None
    
    plt.figure(figsize=(10, 8))
    
    for model_name, results in model_results.items():
        if 'roc_curve' in results:
            fpr = results['roc_curve']['fpr']
            tpr = results['roc_curve']['tpr']
            auc = results['auc_score']
            
            plt.plot(fpr, tpr, linewidth=2, 
                    label=f'{model_name} (AUC = {auc:.3f})')
    
    # Plot diagonal line
    plt.plot([0, 1], [0, 1], 'k--', linewidth=1, alpha=0.5)
    
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate', fontsize=12)
    plt.ylabel('True Positive Rate', fontsize=12)
    plt.title('ROC Curves Comparison', fontsize=14, fontweight='bold')
    plt.legend(loc="lower right")
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('roc_curves_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()

def create_feature_importance_comparison():
    """Create feature importance comparison across models"""
    
    _, _, importance_data = load_model_results()
    
    if importance_data is None:
        return None
    
    # Collect top features from all models
    all_features = {}
    
    for model_name, data in importance_data.items():
        if 'top_features' in data:
            for feature, importance in data['top_features']:
                if feature not in all_features:
                    all_features[feature] = {}
                all_features[feature][model_name] = importance
    
    # Create DataFrame for plotting
    feature_df = pd.DataFrame(all_features).T.fillna(0)
    
    # Plot heatmap
    plt.figure(figsize=(12, 8))
    sns.heatmap(feature_df, annot=True, cmap='YlOrRd', fmt='.3f', 
                cbar_kws={'label': 'Feature Importance'})
    plt.title('Feature Importance Across Models', fontsize=14, fontweight='bold')
    plt.xlabel('Models', fontsize=12)
    plt.ylabel('Features', fontsize=12)
    plt.xticks(rotation=45)
    plt.yticks(rotation=0)
    
    plt.tight_layout()
    plt.savefig('feature_importance_heatmap.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    return feature_df

def generate_model_report():
    """Generate comprehensive model comparison report"""
    
    model_results, metadata, importance_data = load_model_results()
    
    if model_results is None:
        return None
    
    # Create performance comparison
    performance_df = create_performance_comparison()
    
    # Create ROC comparison
    create_roc_comparison()
    
    # Create feature importance comparison
    feature_df = create_feature_importance_comparison()
    
    # Generate text report
    report = []
    report.append("FRAUD DETECTION MODEL COMPARISON REPORT")
    report.append("=" * 50)
    report.append(f"Generated: {metadata['timestamp']}")
    report.append(f"Number of models trained: {metadata['num_models']}")
    report.append(f"Best performing model: {metadata['best_model']}")
    report.append("")
    
    # Performance summary
    report.append("PERFORMANCE SUMMARY")
    report.append("-" * 20)
    
    # Sort by AUC score
    sorted_performance = performance_df.sort_values('AUC', ascending=False)
    
    for _, row in sorted_performance.iterrows():
        report.append(f"{row['Model']}:")
        report.append(f"  AUC: {row['AUC']:.4f}")
        report.append(f"  F1:  {row['F1 Score']:.4f}")
        report.append(f"  Precision: {row['Precision']:.4f}")
        report.append(f"  Recall: {row['Recall']:.4f}")
        report.append("")
    
    # Top features summary
    report.append("TOP FEATURES SUMMARY")
    report.append("-" * 20)
    
    # Get most important features across all models
    feature_scores = {}
    for model_name, data in importance_data.items():
        if 'top_features' in data:
            for feature, importance in data['top_features'][:5]:
                if feature not in feature_scores:
                    feature_scores[feature] = []
                feature_scores[feature].append(importance)
    
    # Average importance across models
    avg_importance = {feature: np.mean(scores) 
                     for feature, scores in feature_scores.items()}
    
    sorted_features = sorted(avg_importance.items(), key=lambda x: x[1], reverse=True)
    
    report.append("Most important features (averaged across models):")
    for feature, avg_score in sorted_features[:10]:
        report.append(f"  {feature}: {avg_score:.4f}")
    
    # Save report
    with open('model_comparison_report.txt', 'w') as f:
        f.write('\n'.join(report))
    
    print('\n'.join(report))
    print("\nReport saved to 'model_comparison_report.txt'")
    print("Plots saved: model_performance_comparison.png, roc_curves_comparison.png, feature_importance_heatmap.png")
    
    return report

if __name__ == "__main__":
    generate_model_report()
