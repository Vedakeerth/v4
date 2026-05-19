"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, AlertCircle, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  getDocs, query, orderBy, writeBatch 
} from "firebase/firestore";

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  order: number;
}

const defaultFAQs = [
  {
    question: "What 3D printing technologies do you offer?",
    answer: "We specialize in FDM (Fused Deposition Modeling) for high-strength functional parts using PLA, PETG, ABS, and Carbon Fiber composites, as well as SLA (Stereolithography / Resin) printing for ultra-high-resolution prototypes, miniatures, and detailed engineering models.",
    order: 1
  },
  {
    question: "How do I get an instant price quotation?",
    answer: "You can upload your 3D models (STL, OBJ, or STEP formats) directly to our instant AI Quote Calculator. Our engine instantly analyzes your model volume, dimensions, and structural characteristics, calculating a precise price based on your choice of material and infill options.",
    order: 2
  },
  {
    question: "What is your typical production lead time?",
    answer: "Standard production lead time for 3D printed parts is 2 to 4 business days. For express or rapid prototyping requests, we offer 24-hour turnaround options. Bulk orders or complex product design services will have customized delivery timelines provided upon booking.",
    order: 3
  },
  {
    question: "What engineering materials are available?",
    answer: "For FDM, we support standard plastics (PLA, PETG), high-durability polymers (ABS, ASA, Nylon), flexible elastomers (TPU), and advanced composite materials like Carbon Fiber-reinforced PLA/PETG. For SLA resin, we offer standard, tough/impact-resistant, and high-temperature resins.",
    order: 4
  },
  {
    question: "Do you provide domestic shipping across India?",
    answer: "Yes, we ship safely and securely to all cities and PIN codes across India. All parts are securely wrapped, cushioned with anti-static and shock-absorbing bubble wrap, and packed in heavy-duty cardboard boxes to ensure safe arrival.",
    order: 5
  },
  {
    question: "Can you help me design or modify my CAD files?",
    answer: "Absolutely! Our team of mechanical engineers provides full CAD design, solid modeling, reverse engineering, and Design for Additive Manufacturing (DFAM) optimization to turn your napkin sketches or raw concepts into production-ready physical parts.",
    order: 6
  }
];

export default function FaqManager() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    order: 0
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "faqs"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FAQItem[];
      setFaqs(data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      defaultFAQs.forEach((faq) => {
        const docRef = doc(collection(db, "faqs"));
        batch.set(docRef, faq);
      });
      await batch.commit();
      await fetchFaqs();
      alert("Successfully seeded default SEO FAQs!");
    } catch (error) {
      console.error("Error seeding FAQs:", error);
      alert("Failed to seed FAQs");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const faqData = {
        question: formData.question,
        answer: formData.answer,
        order: Number(formData.order) || (faqs.length + 1)
      };

      if (editingFaq?.id) {
        await updateDoc(doc(db, "faqs", editingFaq.id), faqData);
      } else {
        await addDoc(collection(db, "faqs"), faqData);
      }
      
      setShowModal(false);
      setEditingFaq(null);
      setFormData({ question: "", answer: "", order: 0 });
      fetchFaqs();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      alert("Failed to save FAQ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, "faqs", id));
      setDeleteConfirm(null);
      fetchFaqs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      alert("Failed to delete FAQ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === faqs.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const currentFaq = faqs[index];
    const swapFaq = faqs[targetIndex];

    if (!currentFaq.id || !swapFaq.id) return;

    setIsSaving(true);
    try {
      const currentOrder = currentFaq.order;
      const swapOrder = swapFaq.order;

      // Update in Firestore
      await updateDoc(doc(db, "faqs", currentFaq.id), { order: swapOrder });
      await updateDoc(doc(db, "faqs", swapFaq.id), { order: currentOrder });

      fetchFaqs();
    } catch (error) {
      console.error("Error swapping orders:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500">Manage client FAQs appearing in your dynamic homepage and FAQ listings.</p>
        </div>
        <div className="flex gap-3">
          {faqs.length === 0 && (
            <button
              onClick={handleSeedDefaults}
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all"
            >
              Seed Default FAQs
            </button>
          )}
          <button
            onClick={() => {
              setEditingFaq(null);
              setFormData({ question: "", answer: "", order: faqs.length + 1 });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4" />
            Add New FAQ
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none w-12">Order</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Question</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Answer Snippet</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none w-24">Reorder</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
            {faqs.map((faq, index) => (
              <tr key={faq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                <td className="px-6 py-4 text-sm font-black text-slate-400">
                  {faq.order}
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-900 dark:text-white font-bold text-sm leading-tight">{faq.question}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-500 text-xs line-clamp-2 max-w-md">{faq.answer}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0 || isSaving}
                      className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-white rounded disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === faqs.length - 1 || isSaving}
                      className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-white rounded disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingFaq(faq);
                        setFormData({
                          question: faq.question,
                          answer: faq.answer,
                          order: faq.order
                        });
                        setShowModal(true);
                      }}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-white rounded"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(faq.id || null)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  No FAQs in database. Click "Seed Default FAQs" or "Add New FAQ" to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveFaq} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingFaq ? "Edit FAQ" : "Add New FAQ"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Question</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm font-semibold"
                  placeholder="e.g. Do you support international delivery?"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Answer</label>
                <textarea
                  required
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm leading-relaxed"
                  placeholder="Provide a comprehensive answer optimized with search keywords..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Display Order Priority (Numeric)</label>
                <input
                  type="number"
                  required
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm font-semibold"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black rounded-xl transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {editingFaq ? "Update FAQ" : "Save FAQ"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertCircle className="h-8 w-8" />
              <h3 className="text-lg font-bold">Delete FAQ?</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6">This action is permanent and will instantly remove the question from the customer website.</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteConfirm && handleDeleteFaq(deleteConfirm)}
                disabled={isSaving}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all text-sm"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
