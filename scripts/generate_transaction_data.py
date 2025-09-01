import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

def generate_mobile_money_transactions(num_transactions=10000):
    """
    Generate synthetic mobile money transaction data with both legitimate and fraudulent patterns
    """
    
    # Transaction types and their typical patterns
    transaction_types = ['CASH_IN', 'CASH_OUT', 'TRANSFER', 'PAYMENT', 'DEBIT']
    
    # Generate base transaction data
    transactions = []
    
    # Generate user IDs (simulate a user base)
    user_ids = [f"USER_{i:06d}" for i in range(1, 5001)]
    
    # Generate merchant IDs
    merchant_ids = [f"MERCHANT_{i:04d}" for i in range(1, 501)]
    
    for i in range(num_transactions):
        # Basic transaction info
        transaction_id = f"TXN_{i:08d}"
        timestamp = datetime.now() - timedelta(days=random.randint(0, 365), 
                                             hours=random.randint(0, 23),
                                             minutes=random.randint(0, 59))
        
        # Select transaction type
        trans_type = random.choice(transaction_types)
        
        # Generate user and recipient
        origin_user = random.choice(user_ids)
        dest_user = random.choice(user_ids + merchant_ids)
        
        # Generate amount based on transaction type
        if trans_type == 'CASH_IN':
            amount = np.random.lognormal(mean=4, sigma=1.5)  # Typical cash-in amounts
        elif trans_type == 'CASH_OUT':
            amount = np.random.lognormal(mean=3.5, sigma=1.2)
        elif trans_type == 'TRANSFER':
            amount = np.random.lognormal(mean=3, sigma=1.8)
        elif trans_type == 'PAYMENT':
            amount = np.random.lognormal(mean=2.5, sigma=1.5)
        else:  # DEBIT
            amount = np.random.lognormal(mean=2, sigma=1)
        
        amount = round(max(amount, 1), 2)  # Ensure positive amounts
        
        # Generate balances (before transaction)
        origin_balance_before = max(amount + np.random.exponential(scale=1000), amount)
        dest_balance_before = np.random.exponential(scale=800)
        
        # Calculate balances after transaction
        if trans_type in ['CASH_OUT', 'TRANSFER', 'PAYMENT', 'DEBIT']:
            origin_balance_after = origin_balance_before - amount
            dest_balance_after = dest_balance_before + amount
        else:  # CASH_IN
            origin_balance_after = origin_balance_before + amount
            dest_balance_after = dest_balance_before
        
        # Generate location data
        origin_country = random.choice(['US', 'UK', 'KE', 'UG', 'TZ', 'GH', 'NG'])
        dest_country = origin_country if random.random() > 0.05 else random.choice(['US', 'UK', 'KE', 'UG', 'TZ', 'GH', 'NG'])
        
        # Determine if transaction is fraudulent (10% fraud rate)
        is_fraud = random.random() < 0.1
        
        # Adjust patterns for fraudulent transactions
        if is_fraud:
            # Fraudulent patterns
            if random.random() < 0.3:  # High amount fraud
                amount *= random.uniform(5, 20)
            if random.random() < 0.4:  # Cross-border fraud
                dest_country = random.choice(['XX', 'YY', 'ZZ'])  # Suspicious countries
            if random.random() < 0.5:  # Unusual time fraud
                timestamp = timestamp.replace(hour=random.randint(2, 4))  # Late night
            if random.random() < 0.3:  # Multiple rapid transactions
                timestamp = timestamp + timedelta(seconds=random.randint(1, 30))
        
        # Create transaction record
        transaction = {
            'transaction_id': transaction_id,
            'timestamp': timestamp.isoformat(),
            'type': trans_type,
            'amount': amount,
            'origin_user': origin_user,
            'dest_user': dest_user,
            'origin_balance_before': round(origin_balance_before, 2),
            'origin_balance_after': round(origin_balance_after, 2),
            'dest_balance_before': round(dest_balance_before, 2),
            'dest_balance_after': round(dest_balance_after, 2),
            'origin_country': origin_country,
            'dest_country': dest_country,
            'is_fraud': 1 if is_fraud else 0
        }
        
        transactions.append(transaction)
    
    return pd.DataFrame(transactions)

def engineer_features(df):
    """
    Create engineered features for fraud detection
    """
    df = df.copy()
    
    # Convert timestamp to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Time-based features
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    df['is_night'] = ((df['hour'] >= 22) | (df['hour'] <= 5)).astype(int)
    
    # Amount-based features
    df['amount_log'] = np.log1p(df['amount'])
    df['amount_zscore'] = (df['amount'] - df['amount'].mean()) / df['amount'].std()
    
    # Balance-based features
    df['balance_change_origin'] = df['origin_balance_after'] - df['origin_balance_before']
    df['balance_ratio_origin'] = df['amount'] / (df['origin_balance_before'] + 1)
    df['balance_ratio_dest'] = df['amount'] / (df['dest_balance_before'] + 1)
    
    # Cross-border indicator
    df['is_cross_border'] = (df['origin_country'] != df['dest_country']).astype(int)
    
    # Transaction type encoding
    type_dummies = pd.get_dummies(df['type'], prefix='type')
    df = pd.concat([df, type_dummies], axis=1)
    
    # User-based features (simplified)
    df['is_merchant_dest'] = df['dest_user'].str.contains('MERCHANT').astype(int)
    
    # Velocity features (simplified - in real system would use time windows)
    user_counts = df['origin_user'].value_counts()
    df['user_transaction_count'] = df['origin_user'].map(user_counts)
    
    return df

def preprocess_for_ml(df):
    """
    Prepare data for machine learning models
    """
    # Select features for ML
    feature_columns = [
        'amount', 'amount_log', 'amount_zscore',
        'hour', 'day_of_week', 'is_weekend', 'is_night',
        'balance_ratio_origin', 'balance_ratio_dest',
        'is_cross_border', 'is_merchant_dest',
        'user_transaction_count'
    ]
    
    # Add transaction type dummies
    type_columns = [col for col in df.columns if col.startswith('type_')]
    feature_columns.extend(type_columns)
    
    # Create feature matrix
    X = df[feature_columns].fillna(0)
    y = df['is_fraud']
    
    return X, y, feature_columns

if __name__ == "__main__":
    print("Generating mobile money transaction data...")
    
    # Generate transaction data
    df = generate_mobile_money_transactions(10000)
    
    # Engineer features
    df_features = engineer_features(df)
    
    # Prepare for ML
    X, y, feature_names = preprocess_for_ml(df_features)
    
    # Save data
    df.to_csv('transaction_data_raw.csv', index=False)
    df_features.to_csv('transaction_data_features.csv', index=False)
    
    # Save feature matrix and labels
    X.to_csv('features.csv', index=False)
    y.to_csv('labels.csv', index=False)
    
    # Save feature names
    with open('feature_names.json', 'w') as f:
        json.dump(feature_names, f)
    
    print(f"Generated {len(df)} transactions")
    print(f"Fraud rate: {df['is_fraud'].mean():.2%}")
    print(f"Features created: {len(feature_names)}")
    print("Data saved to CSV files")
    
    # Display sample statistics
    print("\nTransaction Type Distribution:")
    print(df['type'].value_counts())
    
    print("\nFraud by Transaction Type:")
    print(df.groupby('type')['is_fraud'].agg(['count', 'sum', 'mean']))
