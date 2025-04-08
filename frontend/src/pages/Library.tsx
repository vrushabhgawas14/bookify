import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/authContext";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  BookOpen,
  Plus,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface LibrarySummary {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
}

export default function Library() {
  const [summaries, setSummaries] = useState<LibrarySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { userData } = useAuth();

  // Hardcoded admin check - replace with actual admin check later
  const isAdmin = userData?.isAdmin;

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
  });

  useEffect(() => {
    fetchLibrarySummaries();
  }, []);

  const fetchLibrarySummaries = async () => {
    try {
      const libraryRef = collection(db, "library");
      const q = query(libraryRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const fetchedSummaries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LibrarySummary[];

      setSummaries(fetchedSummaries);
    } catch (error) {
      console.error("Error fetching library summaries:", error);
      toast.error("Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Unauthorized access");
      return;
    }

    try {
      const libraryRef = collection(db, "library");
      await addDoc(libraryRef, {
        title: formData.title,
        summary: formData.summary,
        createdAt: new Date().toISOString(),
      });

      setFormData({ title: "", summary: "" });
      setShowForm(false);
      toast.success("Summary added to library");
      fetchLibrarySummaries();
    } catch (error) {
      console.error("Error adding summary:", error);
      toast.error("Failed to add summary");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-colorBright" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-colorBright">Library</h1>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-borderColor_primary text-white rounded-lg hover:bg-borderColor_secondary transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Summary</span>
            </button>
          )}
        </div>

        {/* Admin Form */}
        {showForm && isAdmin && (
          <div className="mb-8 bg-backgroundDull p-6 rounded-lg border border-borderColor_primary">
            <h2 className="text-xl font-semibold mb-4 text-colorBright">
              Add New Summary
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-textColor_secondary mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-background border border-borderColor_primary rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="summary"
                  className="block text-sm font-medium text-textColor_secondary mb-1"
                >
                  Summary
                </label>
                <textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 bg-background border border-borderColor_primary rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-borderColor_primary rounded-lg hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-borderColor_primary text-white rounded-lg hover:bg-borderColor_secondary transition-colors"
                >
                  Add to Library
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Summaries List */}
        {summaries.length === 0 ? (
          <div className="text-center py-12 bg-backgroundDull rounded-lg border border-borderColor_primary">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-textColor_secondary" />
            <p className="text-xl text-textColor_secondary">
              No summaries in library
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {summaries.map((summary) => (
              <div
                key={summary.id}
                className="bg-backgroundDull rounded-lg border border-borderColor_primary overflow-hidden transition-all duration-300"
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-background/50"
                  onClick={() => toggleExpand(summary.id)}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-colorBright mb-2">
                      {summary.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-textColor_secondary text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(summary.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {expandedId === summary.id ? (
                    <ChevronUp className="w-6 h-6 text-textColor_secondary" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-textColor_secondary" />
                  )}
                </div>

                {expandedId === summary.id && (
                  <div className="p-4 border-t border-borderColor_primary bg-background/30">
                    <p className="text-textColor_primary whitespace-pre-wrap">
                      {summary.summary}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
