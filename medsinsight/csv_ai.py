import pandas as pd

def analyze_csv(file):
    df = pd.read_csv(file)

    summary = df.describe().to_dict()

    # Simple prediction logic (demo)
    prediction = "Patient risk is LOW"
    if "age" in df.columns and df["age"].mean() > 50:
        prediction = "Patient risk is MODERATE"

    return {
        "columns": list(df.columns),
        "summary": summary,
        "prediction": prediction
    }
