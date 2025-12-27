# MedInsight – AI Health Risk Screening & Analytics

MedInsight is a modern AI-powered web application designed to assist users and healthcare professionals in screening health risks, analyzing patient data, and visualizing health trends using machine learning and public health datasets. The platform provides general guidance (not diagnosis) and supports both individual patient analysis and bulk dataset insights.

---

## 🚀 Features

- **AI-Assisted Health Risk Screening:**
	- Analyze individual patient symptoms and receive general health guidance (no diagnosis or drug names).
- **Dataset Analysis:**
	- Upload CSV files with patient data to get summary statistics and risk predictions.
- **Interactive Visualizations:**
	- View mean values and trends from your dataset with beautiful charts.
- **Secure Authentication:**
	- Sign up, log in, and use Google authentication (Firebase-based).
- **Conversational AI Chatbot:**
	- Ask health-related questions and get brief, friendly responses via the floating chat widget.
- **Healthcare Map Visualization:**
	- Explore a map showing healthcare facilities and risk patterns (feature planned, not yet implemented).
- **Modern UI/UX:**
	- Responsive, accessible, and visually appealing interface.

---

## 🏗️ Project Structure

```
├── backend.py              # FastAPI backend (API, AI, CSV analysis)
├── csv_ai.py               # CSV analysis logic (pandas)
├── index.html              # Main frontend (HTML)
├── script.js               # Frontend logic (auth, API calls, chatbot)
├── chart.js                # Chart rendering (Chart.js)
├── style.css               # Custom styles
├── requirements.txt        # Python dependencies
├── medical-data.csv        # Sample dataset
├── serviceAccountKey.json  # Firebase credentials (not included)
├── ... (ML model files, assets)
```

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone <https://github.com/ananyascodes/MedsInsight/tree/main/medsinsight>
cd med_app
```

### 2. Python Environment & Dependencies

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend

- Open `index.html` in your browser (or use Live Server in VS Code).

### 4. Backend (API Server)

```bash
uvicorn backend:app --reload
```
- The API will run at `http://127.0.0.1:8000/`

### 5. Firebase Setup

- Place your `serviceAccountKey.json` in the project root for authentication.
- Configure Firebase project settings in `script.js` if needed.

---

## 🧑‍💻 Usage

1. **Authentication:** Sign up or log in (email/password or Google).
2. **Patient Analysis:** Enter patient details and symptoms to get AI-generated general guidance.
3. **Dataset Analysis:** Upload a CSV file (see `medical-data.csv` for format) to view summary statistics and risk assessment.
4. **Chatbot:** Use the floating chat widget for quick health-related queries.
5. **Map:** (Planned) Visualize healthcare facilities and risk patterns on an interactive map.

---

## 📊 Sample CSV Format

```
age,gender,symptoms,disease
25,Male,fever cough cold,Flu
34,Female,headache nausea,Migraine
... (see medical-data.csv)
```

---

## 🛡️ Disclaimer

**MedInsight does NOT provide medical diagnosis or drug recommendations.**
All responses are for general informational purposes only. Always consult a qualified healthcare professional for medical advice.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [Firebase](https://firebase.google.com/)
- [Chart.js](https://www.chartjs.org/)
- [Pandas](https://pandas.pydata.org/)
- [Perplexity AI](https://www.perplexity.ai/)

---

## 🗺️ Missing Features / Roadmap

- **Healthcare Map Visualization:**
  - Planned feature to show healthcare facilities and risk patterns on an interactive map.
- **Advanced AI Chatbot:**
  - Future improvements for more personalized and context-aware health advice.

For questions or suggestions, please open an issue!

