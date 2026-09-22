# student-performance-predictor Insight Ed

 An end-to-end machine learning web application that predicts academic outcomes based on historical grades, attendance records, study habits, and socioeconomic indicators.
* InsightEd : https://insight-ed-nine.vercel.app/

---

## Authors & Support

* **Developers:** Anish Nath and Tithibrata Biswas
* **Support Emails:** [nathanish6@gmail.com](mailto:nathanish6@gmail.com) and [tithibrata123@gmail.com](mailto:tithibrata123@gmail.com)

---



##  Features

*  **Student Performance Prediction**
  Predicts students' final assessment scores using academic and behavioral indicators such as attendance, study/revision habits, previous scores, and sleep.

*  **Interactive Web Interface**
  Provides a user-friendly dashboard where users can enter student metrics and receive immediate performance predictions.

*  **Automated Data Pipeline**
  Includes modular components for data ingestion, data cleaning, feature encoding, scaling, and model inference.

*  **Model Explainability & Feature Importance**
  Identifies and explains the importance/contribution of key factors, such as attendance rate, study hours, revision habits, previous scores, and sleep, in influencing the predicted performance.

*  **Multiple Machine Learning Models**
  Allows users to switch between:

  * **Random Forest** — Primary prediction model
  * **Linear Regression** — Baseline comparison model

*  **Predicted Score & Pass Status**
  Generates the predicted final score and determines the student's status using a predefined passing threshold.

*  **Downloadable Prediction Report**
  Enables users to download prediction results and relevant student performance information.

*  **Performance Analytics**
  Provides cohort-level insights including score distribution, average performance, pass rate, and at-risk students.

*  **Sample Student Analysis**
  Includes developer-created sample student profiles as a preview to demonstrate the prediction and analytics workflow.

*  **Student Roster & Analysis**
  Provides a consolidated view of evaluated students and their performance indicators.

*  **Model Comparison**
  Enables comparison between the primary Random Forest model and the Linear Regression baseline to explore differences in predictions.


---

## Tech Stack

| Layer | Tools & Libraries |
| :--- | :--- |
| **Web** | React JS, HTML5, Typescript, Gemini API Key, Tailwind Css|
| **Data Analysis and Visualization** |  Matplotlib, Pandas, NumPy, Liner Regression, Logistic Regression, seaborn|
| **Model Training** | Scikit-Learn, Pandas, NumPy, |
| **Environment & Deployment** | Github , Vercel |

---

## Project Structure
```


InsightEd/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
│
├── student_performance_realistic_data.csv
├── index.html
├── package.json
├── metadata.json
├── tsconfig.json
├── vite.config.ts
├── bun.lock
└── README.md
```
## License 
```
Application Name: Insight Ed
Developers: Anish Nath , Tithibrata Biswas
Copyright : © 2026 Anish Nath & Tithibrata Biswas . All Rights Reserved.
