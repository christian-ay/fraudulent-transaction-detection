import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score
import json

def load_models_and_data():
    """Load trained models and test data"""
    try:
        trained_models = joblib.load('trained_models_latest.pkl')
        scaler = joblib.load('scaler_latest.pkl')
        
        # Load original data for cross-validation
        X = pd.read_csv('features.csv')
        y = pd.read_csv('labels.csv').squeeze()
        
        return trained_models, scaler, X, y
    except FileNotFoundError:
        print("Model files not found. Please run train_ml_models.py first.")
        return None, None, None, None

def perform_cross_validation(trained_models, scaler, X, y):
    """Perform comprehensive cross-validation"""
    
    cv_results = {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    print("Performing 5-fold cross-validation...")
    print("=" * 50)
    
    for model_name, model_info in trained_models.items():
        model = model_info['model']
        scale_features = model_info['scale_features']
        
        print(f"\nValidating {model_name}...")
        
        # Prepare data
        if scale_features:
            X_scaled = scaler.fit_transform(X)
            X_model = X_scaled
        else:
            X_model = X
        
        # Perform cross-validation for multiple metrics
        cv_scores = {
            'auc': cross_val_score(model, X_model, y, cv=cv, scoring='roc_auc'),
            'f1': cross_val_score(model, X_model, y, cv=cv, scoring='f1'),
            'precision': cross_val_score(model, X_model, y, cv=cv, scoring='precision'),
            'recall': cross_val_score(model, X_model, y, cv=cv, scoring='recall')
        }
        
        # Calculate statistics
        cv_stats = {}
        for metric, scores in cv_scores.items():
            cv_stats[metric] = {
                'mean': scores.mean(),
                'std': scores.std(),
                'scores': scores.tolist()
            }
        
        cv_results[model_name] = cv_stats
        
        # Print results
        print(f"  AUC: {cv_stats['auc']['mean']:.4f} (+/- {cv_stats['auc']['std']*2:.4f})")
        print(f"  F1:  {cv_stats['f1']['mean']:.4f} (+/- {cv_stats['f1']['std']*2:.4f})")
        print(f"  Precision: {cv_stats['precision']['mean']:.4f} (+/- {cv_stats['precision']['std']*2:.4f})")
        print(f"  Recall: {cv_stats['recall']['mean']:.4f} (+/- {cv_stats['recall']['std']*2:.4f})")
    
    return cv_results

def validate_model_stability(trained_models, scaler, X, y, n_iterations=10):
    """Test model stability across multiple random splits"""
    
    stability_results = {}
    
    print(f"\nTesting model stability across {n_iterations} random splits...")
    print("=" * 50)
    
    for model_name, model_info in trained_models.items():
        model = model_info['model']
        scale_features = model_info['scale_features']
        
        print(f"\nTesting {model_name} stability...")
        
        auc_scores = []
        f1_scores = []
        
        for i in range(n_iterations):
            # Create random split
            from sklearn.model_selection import train_test_split
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=i, stratify=y
            )
            
            # Prepare data
            if scale_features:
                X_train_scaled = scaler.fit_transform(X_train)
                X_test_scaled = scaler.transform(X_test)
                X_train_model = X_train_scaled
                X_test_model = X_test_scaled
            else:
                X_train_model = X_train
                X_test_model = X_test
            
            # Train and evaluate
            model.fit(X_train_model, y_train)
            y_pred = model.predict(X_test_model)
            y_pred_proba = model.predict_proba(X_test_model)[:, 1]
            
            auc_scores.append(roc_auc_score(y_test, y_pred_proba))
            f1_scores.append(f1_score(y_test, y_pred))
        
        stability_results[model_name] = {
            'auc_mean': np.mean(auc_scores),
            'auc_std': np.std(auc_scores),
            'auc_scores': auc_scores,
            'f1_mean': np.mean(f1_scores),
            'f1_std': np.std(f1_scores),
            'f1_scores': f1_scores
        }
        
        print(f"  AUC stability: {np.mean(auc_scores):.4f} (+/- {np.std(auc_scores)*2:.4f})")
        print(f"  F1 stability:  {np.mean(f1_scores):.4f} (+/- {np.std(f1_scores)*2:.4f})")
    
    return stability_results

def save_validation_results(cv_results, stability_results):
    """Save validation results"""
    
    validation_data = {
        'cross_validation': cv_results,
        'stability_test': stability_results,
        'timestamp': pd.Timestamp.now().isoformat()
    }
    
    with open('model_validation_results.json', 'w') as f:
        json.dump(validation_data, f, indent=2, default=str)
    
    print("\nValidation results saved to 'model_validation_results.json'")

if __name__ == "__main__":
    # Load models and data
    trained_models, scaler, X, y = load_models_and_data()
    
    if trained_models is not None:
        print(f"Loaded {len(trained_models)} trained models")
        print(f"Data shape: {X.shape}")
        
        # Perform cross-validation
        cv_results = perform_cross_validation(trained_models, scaler, X, y)
        
        # Test model stability
        stability_results = validate_model_stability(trained_models, scaler, X, y)
        
        # Save results
        save_validation_results(cv_results, stability_results)
        
        print("\n" + "=" * 50)
        print("MODEL VALIDATION COMPLETED")
        print("=" * 50)
        
    else:
        print("Failed to load models. Please run train_ml_models.py first.")
