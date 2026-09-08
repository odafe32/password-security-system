/**
 * Neural Network inference engine — TypeScript implementation.
 *
 * Loads the trained MLPClassifier model (exported as JSON from Python)
 * and runs a forward pass to classify password strength.
 *
 * Architecture: 14 inputs → 32 (ReLU) → 16 (ReLU) → 3 (softmax)
 */

import modelData from "./model.json";
import { extractFeatures } from "./features";
import type { StrengthLevel } from "@/types";

// ─── Model Types ───────────────────────────────────────────────────

interface Layer {
  weights: number[][]; // [outSize][inSize]
  biases: number[]; // [outSize]
  activation: "relu" | "softmax";
}

interface ModelJson {
  modelType: string;
  numClasses: number;
  classNames: string[];
  numFeatures: number;
  featureNames: string[];
  layers: Layer[];
  scaler: {
    mean: number[];
    scale: number[];
  };
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
  };
}

const model = modelData as ModelJson;

// ─── Activation functions ──────────────────────────────────────────

function relu(x: number): number {
  return Math.max(0, x);
}

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

// ─── Forward pass ──────────────────────────────────────────────────

/**
 * Run a forward pass through a single dense layer.
 * scikit-learn stores weights as weights[inSize][outSize],
 * so we compute: output[o] = bias[o] + sum(input[i] * weights[i][o])
 */
function denseLayer(
  input: number[],
  weights: number[][],
  biases: number[],
  activation: "relu" | "softmax"
): number[] {
  const outSize = biases.length;
  const output = new Array(outSize);
  for (let o = 0; o < outSize; o++) {
    let sum = biases[o];
    for (let i = 0; i < input.length; i++) {
      sum += input[i] * weights[i][o];
    }
    output[o] = sum;
  }

  if (activation === "relu") {
    return output.map(relu);
  }
  return softmax(output);
}

// ─── Scaler ────────────────────────────────────────────────────────

/**
 * Standardize features using the scaler parameters from training.
 * scaled = (x - mean) / scale
 */
function scaleFeatures(features: number[]): number[] {
  return features.map((x, i) => (x - model.scaler.mean[i]) / model.scaler.scale[i]);
}

// ─── Prediction ────────────────────────────────────────────────────

export interface MLPrediction {
  /** Predicted class name: "Weak" | "Medium" | "Strong" */
  className: string;
  /** Predicted class index: 0 | 1 | 2 */
  classIndex: number;
  /** Probability distribution over all classes */
  probabilities: number[];
  /** Confidence = probability of the predicted class (0–1) */
  confidence: number;
}

/**
 * Run the neural network to predict password strength.
 *
 * @param password - The password to classify
 * @returns Prediction with class name, probabilities, and confidence
 */
export function predictStrength(password: string): MLPrediction {
  // 1. Extract features
  const features = extractFeatures(password);

  // 2. Scale features
  const scaled = scaleFeatures(features);

  // 3. Forward pass through all layers
  let activation = scaled;
  for (const layer of model.layers) {
    activation = denseLayer(activation, layer.weights, layer.biases, layer.activation);
  }

  // 4. Final output is softmax probabilities
  const probabilities = activation;
  const classIndex = probabilities.indexOf(Math.max(...probabilities));
  const className = model.classNames[classIndex];

  return {
    className,
    classIndex,
    probabilities,
    confidence: probabilities[classIndex],
  };
}

// ─── Model info (for display in UI) ────────────────────────────────

export function getModelInfo() {
  return {
    type: model.modelType,
    accuracy: model.metrics.accuracy,
    precision: model.metrics.precision,
    recall: model.metrics.recall,
    f1: model.metrics.f1,
    numFeatures: model.numFeatures,
    numClasses: model.numClasses,
    architecture: "14 → 32 (ReLU) → 16 (ReLU) → 3 (Softmax)",
  };
}

// ─── Map ML class to StrengthLevel ─────────────────────────────────

export function mlClassToLevel(className: string): StrengthLevel {
  switch (className) {
    case "Weak":
      return "Weak";
    case "Medium":
      return "Medium";
    case "Strong":
      return "Strong";
    default:
      return "Medium";
  }
}
