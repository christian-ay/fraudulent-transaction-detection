import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (classification_report, confusion_matrix, roc_auc_score, 
                           roc_curve, precision_recall_curve, f1_score, precision_score, 
                           recall_score, accuracy_score)
from sklearn.utils.class_weight import compute_class_weight
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def load_data():
    """Load preprocessed data"""
    try:
        X = pd.read_csv('features.csv')
        y = pd.read_csv('labels.csv').squeeze()
        
        with open('feature_names.json', 'r') as f:
            feature_names = json.load(f)
        
        return X, y, feature_names
    except FileNotFoundError:
        print("Data files not found. Please run generate_transaction_data.py first.")
        return None, None, None

def get_model_configurations():
    """Define model configurations with hyperparameter grids"""
    
    model_configs = {
        'Random Forest': {
            'model': RandomForestClassifier(random_state=42, class_weight='balanced'),
            'params': {
                'n_estimators': [50, 100, 200],
                'max_depth': [5, 10, 15, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            },
            'scale_features': False
        },
        'Gradient Boosting': {
            'model': GradientBoostingClassifier(random_state=42),
            'params': {
                'n_estimators': [50, 100, 150],
                'learning_rate': [0.01, 0.1, 0.2],
                'max_depth': [3, 5, 7],
                'subsample': [0.8, 0.9, 1.0]
            },
            'scale_features': False
        },
        'Logistic Regression': {
            'model': LogisticRegression(random_state=42, class_weight='balanced', max_iter=1000),
            'params': {
                'C': [0.01, 0.1, 1, 10, 100],
                'penalty': ['l1', 'l2'],
                'solver': ['liblinear', 'saga']
            },
            'scale_features': True
        },
        'SVM': {
            'model': SVC(random_state=42, probability=True, class_weight='balanced'),
            'params': {
                'C': [0.1, 1, 10],
                'kernel': ['rbf', 'linear'],
                'gamma': ['scale', 'auto', 0.001, 0.01]
            },
            'scale_features': True
        },
        'Decision Tree': {
            'model': DecisionTreeClassifier(random_state=42, class_weight='balanced'),
            'params': {
                'max_depth': [5, 10, 15, 20, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4],
                'criterion': ['gini', 'entropy']
            },
            'scale_features': False
        },
        'AdaBoost': {
            'model': AdaBoostClassifier(random_state=42),
            'params': {
                'n_estimators': [50, 100, 200],
                'learning_rate': [0.01, 0.1, 1.0],
                'algorithm': ['SAMME', 'SAMME.R']
            },
            'scale_features': False
        },
        'Naive Bayes': {
            'model': GaussianNB(),
            'params': {
                'var_smoothing': [1e-9, 1e-8, 1e-7, 1e-6]
            },
            'scale_features': True
        },
        'K-Nearest Neighbors': {
            'model': KNeighborsClassifier(),
            'params': {
                'n_neighbors': [3, 5, 7, 9],
                'weights': ['uniform', 'distance'],
                'metric': ['euclidean', 'manhattan']
            },
            'scale_features': True
        }
    }
    
    return model_configs

def evaluate_model_performance(model, X_test, y_test, model_name):
    """Comprehensive model evaluation"""
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    # Calculate comprehensive metrics
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1_score': f1_score(y_test, y_pred),
        'auc_score': roc_auc_score(y_test, y_pred_proba),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
        'classification_report': classification_report(y_test, y_pred, output_dict=True)
    }
    
    # Calculate ROC curve data
    fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
    metrics['roc_curve'] = {'fpr': fpr.tolist(), 'tpr': tpr.tolist()}
    
    # Calculate Precision-Recall curve data
    precision, recall, _ = precision_recall_curve(y_test, y_pred_proba)
    metrics['pr_curve'] = {'precision': precision.tolist(), 'recall': recall.tolist()}
    
    return metrics

def train_models_with_tuning(X, y, feature_names):
    """Train multiple models with hyperparameter tuning"""
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Initialize scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Get model configurations
    model_configs = get_model_configurations()
    
    trained_models = {}
    model_results = {}
    
    print("Training models with hyperparameter tuning...")
    print("=" * 60)
    
    for model_name, config in model_configs.items():
        print(f"\nTraining {model_name}...")
        
        # Prepare data
        if config['scale_features']:
            X_train_model = X_train_scaled
            X_test_model = X_test_scaled
        else:
            X_train_model = X_train
            X_test_model = X_test
        
        # Perform grid search with cross-validation
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        
        grid_search = GridSearchCV(
            estimator=config['model'],
            param_grid=config['params'],
            cv=cv,
            scoring='roc_auc',
            n_jobs=-1,
            verbose=0
        )
        
        # Fit the model
        grid_search.fit(X_train_model, y_train)
        
        # Get best model
        best_model = grid_search.best_estimator_
        
        # Evaluate on test set
        metrics = evaluate_model_performance(best_model, X_test_model, y_test, model_name)
        
        # Store results
        trained_models[model_name] = {
            'model': best_model,
            'best_params': grid_search.best_params_,
            'best_cv_score': grid_search.best_score_,
            'scale_features': config['scale_features']
        }
        
        model_results[model_name] = metrics
        
        # Print results
        print(f"Best CV AUC: {grid_search.best_score_:.4f}")
        print(f"Test AUC: {metrics['auc_score']:.4f}")
        print(f"Test F1: {metrics['f1_score']:.4f}")
        print(f"Best params: {grid_search.best_params_}")
    
    return trained_models, model_results, scaler, X_test, y_test

def analyze_feature_importance(trained_models, feature_names):
    """Analyze feature importance for interpretable models"""
    
    importance_data = {}
    
    for model_name, model_info in trained_models.items():
        model = model_info['model']
        
        if hasattr(model, 'feature_importances_'):
            # Tree-based models
            importance_scores = model.feature_importances_
            importance_data[model_name] = {
                'type': 'feature_importances',
                'features': feature_names,
                'importance': importance_scores.tolist(),
                'top_features': sorted(
                    zip(feature_names, importance_scores), 
                    key=lambda x: x[1], 
                    reverse=True
                )[:10]
            }
        elif hasattr(model, 'coef_'):
            # Linear models
            coef_scores = np.abs(model.coef_[0])
            importance_data[model_name] = {
                'type': 'coefficients',
                'features': feature_names,
                'importance': coef_scores.tolist(),
                'top_features': sorted(
                    zip(feature_names, coef_scores), 
                    key=lambda x: x[1], 
                    reverse=True
                )[:10]
            }
    
    return importance_data

def create_ensemble_model(trained_models, X_test, y_test):
    """Create a simple ensemble model using voting"""
    
    from sklearn.ensemble import VotingClassifier
    
    # Select top 3 models based on AUC score
    model_scores = {}
    for name, model_info in trained_models.items():
        model = model_info['model']
        if model_info['scale_features']:
            # Use scaled test data for models that need scaling
            scaler = StandardScaler()
            X_test_scaled = scaler.fit_transform(X_test)
            y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
        else:
            y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        auc_score = roc_auc_score(y_test, y_pred_proba)
        model_scores[name] = auc_score
    
    # Get top 3 models
    top_models = sorted(model_scores.items(), key=lambda x: x[1], reverse=True)[:3]
    
    print(f"\nCreating ensemble from top 3 models:")
    for name, score in top_models:
        print(f"  {name}: {score:.4f}")
    
    # Create ensemble
    estimators = [(name, trained_models[name]['model']) for name, _ in top_models]
    ensemble = VotingClassifier(estimators=estimators, voting='soft')
    
    return ensemble, [name for name, _ in top_models]

def save_model_artifacts(trained_models, model_results, scaler, feature_names, importance_data):
    """Save all model artifacts with versioning"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Create model metadata
    metadata = {
        'timestamp': timestamp,
        'num_models': len(trained_models),
        'feature_names': feature_names,
        'model_names': list(trained_models.keys()),
        'best_model': max(model_results.items(), key=lambda x: x[1]['auc_score'])[0]
    }
    
    # Save artifacts
    joblib.dump(trained_models, f'trained_models_{timestamp}.pkl')
    joblib.dump(model_results, f'model_results_{timestamp}.pkl')
    joblib.dump(scaler, f'scaler_{timestamp}.pkl')
    
    # Save latest versions (for easy access)
    joblib.dump(trained_models, 'trained_models_latest.pkl')
    joblib.dump(model_results, 'model_results_latest.pkl')
    joblib.dump(scaler, 'scaler_latest.pkl')
    
    # Save metadata and importance
    with open(f'model_metadata_{timestamp}.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    with open(f'feature_importance_{timestamp}.json', 'w') as f:
        json.dump(importance_data, f, indent=2, default=str)
    
    # Save latest versions
    with open('model_metadata_latest.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    with open('feature_importance_latest.json', 'w') as f:
        json.dump(importance_data, f, indent=2, default=str)
    
    return timestamp

if __name__ == "__main__":
    # Load data
    X, y, feature_names = load_data()
    
    if X is not None:
        print(f"Loaded data: {X.shape[0]} samples, {X.shape[1]} features")
        print(f"Fraud rate: {y.mean():.2%}")
        print(f"Class distribution: {np.bincount(y)}")
        
        # Train models with hyperparameter tuning
        trained_models, model_results, scaler, X_test, y_test = train_models_with_tuning(X, y, feature_names)
        
        # Analyze feature importance
        importance_data = analyze_feature_importance(trained_models, feature_names)
        
        # Create ensemble model
        ensemble_model, ensemble_components = create_ensemble_model(trained_models, X_test, y_test)
        
        # Save all artifacts
        timestamp = save_model_artifacts(trained_models, model_results, scaler, feature_names, importance_data)
        
        print("\n" + "=" * 60)
        print("MODEL TRAINING COMPLETED")
        print("=" * 60)
        
        # Display results summary
        print("\nModel Performance Summary (Test Set):")
        print("-" * 50)
        
        # Sort models by AUC score
        sorted_results = sorted(model_results.items(), key=lambda x: x[1]['auc_score'], reverse=True)
        
        for i, (name, result) in enumerate(sorted_results, 1):
            print(f"{i}. {name}")
            print(f"   AUC: {result['auc_score']:.4f}")
            print(f"   F1:  {result['f1_score']:.4f}")
            print(f"   Precision: {result['precision']:.4f}")
            print(f"   Recall: {result['recall']:.4f}")
            print()
        
        # Display top features
        print("Top Features by Importance:")
        print("-" * 30)
        
        for model_name, importance_info in importance_data.items():
            if 'top_features' in importance_info:
                print(f"\n{model_name}:")
                for feature, score in importance_info['top_features'][:5]:
                    print(f"  {feature}: {score:.4f}")
        
        print(f"\nAll artifacts saved with timestamp: {timestamp}")
        print("Latest versions saved for easy access")
        
    else:
        print("Failed to load data. Please run generate_transaction_data.py first.")
