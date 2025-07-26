
import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import stopwords from "stopwords-en"

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const isSymptomWord = (word) => {
  return word.length > 2 && !stopwords.includes(word);
};


const HealthSummary = ({reports}) => {
    const [symptomCount, setSymptomCount] = useState({});
  const [lastCheckDays, setLastCheckDays] = useState(0);
  const [frequentSymptoms, setFrequentSymptoms] = useState([]);

   useEffect(() => {
    if (!reports || reports.length === 0) return;

    // 📆 Calculate days since last check
    const lastDate = new Date(reports[reports.length - 1].date);
    const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
    setLastCheckDays(diffDays);

    // 🩺 Count symptoms
    const countMap = {};
  reports.forEach((r) => {
    const stopwords = new Set([
  "i", "have", "has", "had", "the", "and", "but", "or", "with", "without",
  "a", "an", "am", "is", "are", "was", "were", "been", "being",
  "to", "from", "of", "in", "on", "for", "it", "that", "this", "as",
  "at", "my", "me", "you", "your", "we", "they", "their", "them","all","time"
]);

const terms = r.symptoms.toLowerCase().split(/[^a-z]+/); // Split on non-letters

terms.forEach((term) => {
  if (term.length > 2 && !stopwords.has(term)) {
    countMap[term] = (countMap[term] || 0) + 1;
  }
});
    });
     setSymptomCount(countMap);

    // Find frequent ones
    const frequent = Object.keys(countMap).filter((key) => countMap[key] >= 2);
    setFrequentSymptoms(frequent);
  }, [reports]);

 const barData = {
    labels: Object.keys(symptomCount),
    datasets: [
      {
        label: "Frequency",
        data: Object.values(symptomCount),
        backgroundColor: "rgba(59,130,246,0.7)",
      },
    ],
  };

  const pieData = {
    labels: Object.keys(symptomCount),
    datasets: [
      {
        data: Object.values(symptomCount),
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"],
      },
    ],
  };



  return (
     <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">📊 Health Summary</h2>

      {/* ⏳ Reminders */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow">
        <p>🕒 It’s been <strong>{lastCheckDays}</strong> days since your last symptom check.</p>
        {frequentSymptoms.length > 0 && (
          <p className="mt-2">📌 You've reported <strong>{frequentSymptoms.join(", ")}</strong> multiple times. Consider relevant health tests.</p>
        )}
      </div>

      {/* 📈 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">🧪 Symptom Frequency</h3>
          <Bar data={barData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">🌀 Symptom Distribution</h3>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  )
}

export default HealthSummary
