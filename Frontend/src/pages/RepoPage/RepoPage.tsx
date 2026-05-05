import React, { useState, useRef, useEffect, useContext } from "react";
import Modal from "../../components/universal/Modal";
import CustomAxios from "../../lib/actions/CustomAxios"; 
import { CurrentUserContext } from "../../lib/contexts/CurrentUserContext"; // Added context import

import { GiBallPyramid } from "react-icons/gi";
import { FaBriefcase } from "react-icons/fa";
import { GrDocumentText } from "react-icons/gr";
import { FaMoneyBills } from "react-icons/fa6";
import { ImShield } from "react-icons/im";
import { AiOutlineUpload } from "react-icons/ai";

type Document = {
  _id: string;
  name: string;
  category: string;
  uploadDate: string;
  fileUrl?: string;
};

const CATEGORIES = [
  { name: "All", icon: GiBallPyramid },
  { name: "Lab Results", icon: FaBriefcase },
  { name: "Prescriptions", icon: GrDocumentText },
  { name: "Hospital Bills", icon: FaMoneyBills },
  { name: "Insurance", icon: ImShield },
];

const RepoPage = () => {
  const userContext = useContext(CurrentUserContext);
  const currentUser = userContext?.currentUser;

  const [repoId, setRepoId] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Lab Results");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRepoData = async () => {
      if (!currentUser?.medBoxID) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const medBoxRes = await CustomAxios("get", `/medbox/${currentUser.medBoxID}`);
        const fetchedRepoId = medBoxRes.data.RepoID || medBoxRes.data.repoID;
        console.log("************")
        console.log(fetchedRepoId)
        console.log("************")
        if (fetchedRepoId) {
          setRepoId(fetchedRepoId);
          const repoRes = await CustomAxios("get", `/medicalrecords/${fetchedRepoId}`);
          if (repoRes.data && repoRes.data.documents) {
            setDocuments(repoRes.data.documents.reverse());
          }
        }
      } catch (error) {
        console.error("Failed to fetch repository data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepoData();
  }, [currentUser]);

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = activeFilter === "All" || doc.category === activeFilter;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryCount = (categoryName: string) => {
    if (categoryName === "All") return documents.length;
    return documents.filter((doc) => doc.category === categoryName).length;
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadName("");
    setSelectedFile(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName || !selectedFile) return;
    if (!repoId) {
      alert("Repository ID is missing. Please refresh or check your connection.");
      return;
    }
    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64String = reader.result;
        const payload = {
          name: uploadName,
          category: uploadCategory,
          fileBase64: base64String
        };
        const response = await CustomAxios("post", `/medicalrecords/${repoId}/documents`, payload);

        const newDoc: Document = {
          _id: response.data.document?._id || Math.random().toString(36).substr(2, 9),
          name: uploadName,
          category: uploadCategory,
          uploadDate: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
          fileUrl: response.data.document?.fileUrl, 
        };

        setDocuments([newDoc, ...documents]);
        handleCloseUploadModal();
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        alert("Failed to read file.");
        setIsUploading(false);
      };

    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload document. Please try again.");
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (docToDelete && repoId) {
      try {
        await CustomAxios("delete", `/medicalrecords/${repoId}/documents/${docToDelete._id}`);
        setDocuments(documents.filter((d) => d._id !== docToDelete._id));
        setIsDeleteModalOpen(false);
        setDocToDelete(null);
      } catch (error) {
        console.error("Failed to delete document", error);
        alert("An error occurred while trying to delete the document.");
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 text-slate-800">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A2D6E]">Medical Records</h1>
          <p className="font-light mt-1 text-[#585757]">Store and manage all your health documents in one place</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="rounded-xl bg-gradient-to-br from-[#F1E1B4] to-[#FFF2CE] px-8 py-2.5 text-sm font-medium text-[#0A2D6E] border shadow-lg transition-colors hover:bg-slate-500 disabled:opacity-50"
        >
          + Upload Document
        </button>
      </div>

      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setSelectedFile(e.dataTransfer.files[0]);
            setIsUploadModalOpen(true);
          }
        }}
        onClick={() => setIsUploadModalOpen(true)}
        className="mb-8 flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 transition-colors hover:border-[#0A2D6E] hover:bg-slate-100"
      >
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full text-[#0A2D6E]">
          <AiOutlineUpload size={48} />
        </div>
        <p className="mb-1 text-base font-medium text-slate-800">
          Drag & drop files here or click to upload
        </p>
        <p className="text-sm text-slate-500">
          Supported formats: PDF, JPG, PNG
        </p>
      </div>

      <div className="mb-8 flex gap-4 overflow-x-auto pb-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count = getCategoryCount(cat.name);
          const isActive = activeFilter === cat.name;

          return (
            <button
              key={cat.name}
              onClick={() => setActiveFilter(cat.name)}
              className={`flex min-w-[160px] items-start gap-3 rounded-xl border p-4 shadow-md transition-all ${
                isActive
                  ? "border-[#0A2D6E] bg-[#0A2D6E] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-white/20" : "bg-[#F1E1B4]/40 text-[#0A2D6E]"}`}>
                <Icon className="text-lg" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-semibold whitespace-nowrap">{cat.name}</span>
                <span className={`text-xs mt-0.5 ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                  {count} {count === 1 ? 'file' : 'files'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:w-1/3"
        />
        <div className="mt-4 text-sm font-semibold text-slate-700">
          {activeFilter} <span className="ml-1 text-slate-500">({filteredDocs.length})</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">File Name</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Upload Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Loading documents...
                </td>
              </tr>
            ) : filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  No documents found.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{doc.name}</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{doc.uploadDate}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 text-slate-400">
                      
                      {doc.fileUrl && (
                        <a 
                          href={doc.fileUrl} 
                          download={doc.name} 
                          className="hover:text-blue-600" 
                          title="Download"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                      )}

                      {doc.fileUrl && (
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="hover:text-blue-600" 
                          title="View"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </a>
                      )}

                      <button 
                        onClick={() => { setDocToDelete(doc); setIsDeleteModalOpen(true); }}
                        className="hover:text-red-600" 
                        title="Delete"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        <p>Your medical records are stored securely. Only you can view and manage them. Always keep backup copies of important documents.</p>
      </div>

      <Modal isOpen={isUploadModalOpen} onClose={handleCloseUploadModal}>
        <div className="w-full max-w-md sm:w-[400px]">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Upload Document</h2>
          <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
            
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Document Name</label>
              <input
                type="text"
                required
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Blood Test Results"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">File</label>
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:bg-slate-100"
              >
                <AiOutlineUpload className="mb-2 text-3xl text-slate-400" />
                <p className="text-sm text-slate-600">
                  {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-slate-400">PNG, JPG or PDF</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Document Type</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                {CATEGORIES.filter((c) => c.name !== "All").map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isUploading}
              className={`mt-2 w-full rounded-md py-2.5 font-medium text-white transition-colors ${
                isUploading ? "bg-slate-400 cursor-not-allowed" : "bg-[#0A2D6E] hover:bg-[#071c45]"
              }`}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
         <div className="w-full max-w-sm sm:w-[350px]">
           <h2 className="mb-2 text-lg font-semibold text-slate-900">Delete Document</h2>
           <p className="mb-6 text-sm text-slate-600">
             Are you sure you want to delete <strong>{docToDelete?.name}</strong>? This action cannot be undone.
           </p>
           <div className="flex gap-3">
             <button 
               onClick={confirmDelete}
               className="flex-1 rounded-md bg-red-600 py-2 font-medium text-white hover:bg-red-700"
             >
               Delete
             </button>
           </div>
         </div>
      </Modal>

    </div>
  );
};

export default RepoPage;

