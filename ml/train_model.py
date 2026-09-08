"""
Train a Neural Network (MLP) model for password strength classification.

This script:
  1. Generates a labeled dataset of passwords (weak / medium / strong)
  2. Extracts features from each password
  3. Trains a Multi-Layer Perceptron classifier (neural network)
  4. Evaluates accuracy, precision, recall, and F1-score
  5. Exports the trained model as JSON for TypeScript inference

Usage:
  py ml/train_model.py

Output:
  src/lib/ml/model.json  — the exported model weights + scaler parameters
"""

import json
import os
import random
import string
import sys

import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

from features import extract_features, FEATURE_NAMES

# ─── Dataset Generation ─────────────────────────────────────────────

# Common weak passwords (label 0 = Weak)
WEAK_PASSWORDS = [
    "password", "123456", "qwerty", "abc123", "monkey", "master", "dragon",
    "letmein", "admin", "welcome", "login", "princess", "football", "shadow",
    "sunshine", "trustno1", "iloveyou", "batman", "access", "hello",
    "charlie", "123456789", "12345678", "12345", "1234567", "password1",
    "qwerty123", "1q2w3e4r", "111111", "1234567890", "abc123456",
    "password123", "admin123", "root", "toor", "pass", "test",
    "guest", "changeme", "secret", "computer", "internet", "superman",
    "michael", "jennifer", "jordan", "hunter", "ranger", "thomas",
    "baseball", "soccer", "hockey", "jordan23", "michael1",
    "qwerty1", "1qaz2wsx", "zxcvbn", "asdfgh", "1q2w3e",
    "p@ssw0rd", "passw0rd", "p455w0rd", "p@ssword", "pa$$word",
    "summer2024", "winter2023", "spring2024", "autumn2023",
    "nigeria123", "lagos2024", "abuja123", "admin2024",
    "abc", "aaa", "111", "000", "123", "321", "987",
    "aaaaaa", "111111", "000000", "abcabc", "123123",
    "qwertyuiop", "asdfghjkl", "zxcvbnm",
    "password!", "admin!", "welcome1", "hello123",
    "mypassword", "yourpassword", "letmein123",
    "monkey123", "dragon123", "master123",
    "123abc", "456def", "789ghi",
    "q1w2e3r4", "a1b2c3d4", "z1x2c3v4",
    "password12", "admin1234", "test1234",
    "love", "money", "baby", "angel", "star", "moon",
    "love123", "baby123", "angel123", "star123",
    "qwerty!", "abc123!", "letmein!", "welcome!",
]


def generate_medium_passwords(count: int) -> list:
    """Generate medium-strength passwords (label 1 = Medium)."""
    words = ["Summer", "Winter", "Spring", "Autumn", "Monkey", "Dragon",
             "Eagle", "Tiger", "Lion", "Wolf", "Shark", "Falcon",
             "River", "Mountain", "Forest", "Ocean", "Storm", "Thunder",
             "Silver", "Golden", "Crystal", "Diamond", "Ruby", "Emerald"]
    passwords = []
    for _ in range(count):
        word = random.choice(words)
        year = str(random.randint(2018, 2026))
        suffix = random.choice(["!", "@", "#", "$", "!!", "1!", "12", "123"])
        pw = f"{word}{year}{suffix}"
        passwords.append(pw)
    return passwords


def generate_strong_passwords(count: int) -> list:
    """Generate strong passwords (label 2 = Strong)."""
    lower = string.ascii_lowercase
    upper = string.ascii_uppercase
    digits = string.digits
    special = "!@#$%^&*"
    all_chars = lower + upper + digits + special
    passwords = []
    for _ in range(count):
        length = random.randint(14, 20)
        # Ensure at least one of each type
        pw = [
            random.choice(lower),
            random.choice(upper),
            random.choice(digits),
            random.choice(special),
        ]
        pw += [random.choice(all_chars) for _ in range(length - 4)]
        random.shuffle(pw)
        passwords.append("".join(pw))
    return passwords


def generate_dataset():
    """Generate the full labeled dataset."""
    random.seed(42)

    # Label 0 = Weak
    weak = [(pw, 0) for pw in WEAK_PASSWORDS]
    # Generate more weak variations
    for pw in WEAK_PASSWORDS[:30]:
        weak.append((pw + str(random.randint(1, 99)), 0))
        weak.append((pw.capitalize(), 0))
        weak.append((pw + "!", 0))

    # Label 1 = Medium
    medium = [(pw, 1) for pw in generate_medium_passwords(200)]

    # Label 2 = Strong
    strong = [(pw, 2) for pw in generate_strong_passwords(400)]

    all_data = weak + medium + strong
    random.shuffle(all_data)

    return all_data


# ─── Training ───────────────────────────────────────────────────────

def train():
    print("=" * 60)
    print("  PASSWORD STRENGTH CLASSIFIER - NEURAL NETWORK TRAINING")
    print("=" * 60)
    print()

    # 1. Generate dataset
    print("[1/5] Generating dataset...")
    dataset = generate_dataset()
    passwords = [item[0] for item in dataset]
    labels = [item[1] for item in dataset]

    print(f"      Dataset size: {len(dataset)} passwords")
    print(f"      Weak:   {labels.count(0)}")
    print(f"      Medium: {labels.count(1)}")
    print(f"      Strong: {labels.count(2)}")
    print()

    # 2. Extract features
    print("[2/5] Extracting features...")
    X = np.array([extract_features(pw) for pw in passwords])
    y = np.array(labels)
    print(f"      Feature matrix: {X.shape}")
    print()

    # 3. Split into train/test
    print("[3/5] Splitting dataset (80% train / 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"      Train: {X_train.shape[0]} samples")
    print(f"      Test:  {X_test.shape[0]} samples")
    print()

    # 4. Scale features + train model
    print("[4/5] Training Neural Network (MLPClassifier)...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = MLPClassifier(
        hidden_layer_sizes=(32, 16),
        activation="relu",
        solver="adam",
        max_iter=500,
        random_state=42,
        verbose=False,
    )
    model.fit(X_train_scaled, y_train)
    print(f"      Training iterations: {model.n_iter_}")
    print(f"      Final loss: {model.loss_:.4f}")
    print()

    # 5. Evaluate
    print("[5/5] Evaluating model...")
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    print()
    print("  ------------ EVALUATION METRICS ------------")
    print(f"  Accuracy:  {accuracy:.4f}  ({accuracy*100:.1f}%)")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall:    {recall:.4f}")
    print(f"  F1-Score:  {f1:.4f}")
    print()
    print("  ------------ CLASSIFICATION REPORT ------------")
    print(classification_report(
        y_test, y_pred,
        target_names=["Weak", "Medium", "Strong"],
        zero_division=0
    ))

    # 6. Export model as JSON
    export_model(model, scaler, accuracy, precision, recall, f1)
    print()
    print("[OK] Model exported to src/lib/ml/model.json")
    print()
    print("Done! The Next.js app can now use this model for inference.")


def export_model(model, scaler, accuracy, precision, recall, f1):
    """Export the trained model as JSON for TypeScript inference."""

    # Build layer definitions
    layers = []
    for i in range(len(model.coefs_)):
        activation = "relu" if i < len(model.coefs_) - 1 else "softmax"
        layers.append({
            "weights": model.coefs_[i].tolist(),
            "biases": model.intercepts_[i].tolist(),
            "activation": activation,
        })

    model_json = {
        "modelType": "MLPClassifier",
        "numClasses": 3,
        "classNames": ["Weak", "Medium", "Strong"],
        "numFeatures": len(FEATURE_NAMES),
        "featureNames": FEATURE_NAMES,
        "layers": layers,
        "scaler": {
            "mean": scaler.mean_.tolist(),
            "scale": scaler.scale_.tolist(),
        },
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
        },
        "trainingConfig": {
            "hiddenLayerSizes": [32, 16],
            "activation": "relu",
            "solver": "adam",
            "maxIter": 500,
        },
    }

    output_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "src", "lib", "ml", "model.json"
    )
    with open(output_path, "w") as f:
        json.dump(model_json, f, indent=2)


if __name__ == "__main__":
    train()
