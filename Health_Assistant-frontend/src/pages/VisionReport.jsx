import {React,useState} from 'react'

const VisionReport = () => {
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePrescriptionUpload=async (e)=>{
    const file=e.target.files[0];
    setImage(URL.createObjectURL(file));
    setLoading(true);
    const formData=new FormData();
    formData.append("file",file)
    try{
      const res = await fetch("http://localhost:8000/analyze-prescription", {
        method:"POST",
        body:formData
      })
      const data=await res.json();
      setSummary(data.summary);
    }
    catch (err) {
      console.error("❌ Error uploading:", err);
      setSummary("Failed to process prescription.");
    } finally {
      setLoading(false);
    }
  }
  return (
   <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">💊 Upload Doctor Prescription</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handlePrescriptionUpload}
        className="mb-4 border p-2 rounded"
      />

      {image && (
        <img src={image} alt="Uploaded" className="max-h-60 mb-4 rounded" />
      )}

      {loading ? (
        <p>🧠 Reading prescription...</p>
      ) : summary ? (
        <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
          <strong>🧾 Medicine Summary:</strong>
          <br />
          {summary}
        </div>
      ) : null}
    </div>
  )
}

export default VisionReport
