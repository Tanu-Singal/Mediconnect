import React, { useState } from "react";
import Tesseract from "tesseract.js";

const MedicalReport = () => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const phone=localStorage.getItem("phone");
   const handleSingleUpload =async(e)=>{
     const files=e.target.files[0];
     setImage(URL.createObjectURL(files[0]));
     setSelectedImage(files);
     setExtractedText("");
     setLoading(true)

 try {
  const result=await Tesseract.recognize(files,'eng',{
    logger: (m) => console.log(m),
  })
    const ocrText = result.data.text;
    // Send full combined OCR text to backend for summary
    await handleOCRResult(ocrText);
  } catch (err) {
    console.error("OCR error:", err);
    setExtractedText("❌ Failed to read one or more images.");
  } finally {
    setLoading(false);
  }
   }
 const sendOCRTextToBackend =async(text)=>{
    try{
      const formData = new FormData();
        formData.append("ocr_text", text);
       formData.append("phone", phone);
       formData.append("image", selectedImage); 
        const res=await fetch("https://mediconnect-backend1-r5kg.onrender.com/rag-summary",{
            method:"POST",
            body:formData
        })
        const data=await res.json()
        console.log("🧠 Summary Response:", data.summary || data.error);
        return data.summary
    }
    catch (err) {
    console.error("❌ Failed to call backend:", err);
  }
 }

const handleOCRResult =async(text)=>{
    const summary=await sendOCRTextToBackend(text)
    if(summary){
        setExtractedText(summary)
    }
    else{
        setExtractedText("Failed to get summary")
    }
}

const generateWhatsAppLink = (summary) => {
  const phoneNumber = ""; // Optional: add default number if needed
  const encodedMessage = encodeURIComponent(summary);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

  return (
  <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-xl space-y-4 border border-gray-200">
    <h2 className="text-xl font-bold text-blue-800">🧾 Upload Medical Report</h2>

    {/* Custom file input with emoji */}
    <label className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded cursor-pointer w-fit hover:bg-blue-100 transition">
      📤 <span className="text-sm text-blue-700 font-medium">Choose Report Image</span>
      <input type="file" accept="image/*" onChange={handleSingleUpload } className="hidden" />
    </label>

    {/* Uploaded image preview */}
    {image && (
      <img
        src={image}
        alt="Uploaded"
        className="max-h-60 border rounded-md shadow-sm object-contain"
      />
    )}

    {/* Loading state with emoji spinner */}
    {loading ? (
      <div className="flex items-center gap-2 text-sm text-gray-600 animate-pulse">
        ⏳ Extracting text from report...
      </div>
    ) : (
      extractedText && (
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-2">
          <h3 className="text-lg font-semibold text-blue-700">📋 Medical Summary</h3>
          <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
            {extractedText}
          </div>
          <div className="text-xs text-gray-400 italic pt-1">
            *Consult a doctor if you're unsure.*
          </div>
        </div>
      )
    )}
    {extractedText && (
  <div className="text-right">
    <a
      href={generateWhatsAppLink(extractedText)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mt-2 px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition"
    >
      📤 Share on WhatsApp
    </a>
  </div>
)}

  </div>
);


}
export default MedicalReport
