import React, { useEffect, useState , Fragment } from "react";
import { Dialog,Transition  } from "@headlessui/react";
import { toast, ToastContainer} from "react-toastify";
import ExportPDF from "./ExportPDF";
import 'react-toastify/dist/ReactToastify.css';
import HealthSummary from "./HealthSummary";

const SymptomHistroy = ({userPhone}) => {
  const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(()=>{
    const fetchreport=async()=>{
        
        const res=await fetch("http://localhost:8000/get-reports",{
            method:"POST",
            headers: { "Content-Type": "application/json" },
            body:JSON.stringify({phone:userPhone})
        })
        const data=await res.json()
        setReports(data.reports || [])
    }
    fetchreport()
  },[userPhone])


  const closeModal = () => setIsOpen(false);
  const openModal = (report) => {
    setSelectedReport(report);
    setIsOpen(true);
  };

  
  const deleteReport = async (id) => {
    const re=await fetch(`http://localhost:8000/delete-report/${id}`, { method: "DELETE" })
    if(re.ok){
        toast.success(re.message);
        setReports(reports.filter((rep)=>rep._id!=id))
    }
    else {
            toast.error("Failed to delete report.");
          }

}

  return (
   <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🧾 Symptom Checker History</h2>
      <div className="overflow-auto max-h-[400px] border rounded">
      <table className="bg-gray-200 sticky top-0 z-10">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Main Symptoms</th>
            <th className="p-2 border">AI Suggestion</th>
            <th className="p-2 border">Tests</th>
            <th className="p-2 border">Urgency</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r._id}>
              <td className="p-2 border">{new Date(r.date).toLocaleString()}</td>
              <td className="p-2 border">{r.symptoms}</td>
              <td className="p-2 border">{r.ai_suggestion}</td>
              <td className="p-2 border">{r.suggested_tests?.join(", ") || "-"}</td>
              <td className="p-2 border">{r.urgency}</td>
              <td className="p-2 border space-x-2">
               <div className="flex flex-col sm:flex-row flex-wrap gap-2">
    <button
    className="bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all px-3 py-1 text-white rounded shadow"
    onClick={() => openModal(r)}
  >
    View Report
  </button>

  <button
    className="bg-green-500 hover:bg-green-600 active:scale-95 transition-all px-3 py-1 text-white rounded shadow"
    onClick={() => ExportPDF(r)}
  >
    Export PDF
  </button>

  <button
    className="bg-red-500 hover:bg-red-600 active:scale-95 transition-all px-3 py-1 text-white rounded shadow"
    onClick={() => deleteReport(r._id)}
  >
    Delete
  </button>
</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {/* Modal for Report */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
  as={Fragment}
  enter="ease-out duration-300"
  enterFrom="opacity-0"
  enterTo="opacity-100"
  leave="ease-in duration-200"
  leaveFrom="opacity-100"
  leaveTo="opacity-0"
>
  <div className="fixed inset-0 bg-white/30 backdrop-blur-sm" />
</Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-lg font-bold mb-4">🩺 Full Symptom Report</Dialog.Title>
                <div className="space-y-2 text-sm">
                  {selectedReport?.full_conversation?.map((msg, index) => (
                    <div key={index} className={`p-2 rounded ${msg.role === "user" ? "bg-blue-50" : "bg-gray-100"}`}>
                      <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong> {msg.message}
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <button
                    onClick={closeModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
       <ToastContainer position="top-right" autoClose={3000} />
       <HealthSummary reports={reports} />
    </div>
  );
  
}

export default SymptomHistroy
