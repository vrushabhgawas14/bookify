import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/authContext";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  User,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Summary {
  id: string;
  Title: string;
  Summary: string;
  Email: string;
  createdAt: string;
}

export default function Dashboard() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const userQuery = query(
          collection(db, "users"),
          where("Email", "==", userData?.Email)
        );

        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const summariesRef = collection(userDoc.ref, "summaries");
          const summariesSnapshot = await getDocs(summariesRef);

          const fetchedSummaries = summariesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Summary[];

          setSummaries(
            fetchedSummaries.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
          );
        }
      } catch (error) {
        console.error("Error fetching summaries:", error);
        toast.error("Failed to load summaries");
      } finally {
        setLoading(false);
      }
    };

    if (userData?.Email) {
      fetchSummaries();
    }
  }, [userData?.Email]);

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
        <h1 className="text-3xl font-bold mb-8 text-colorBright">
          Your Summaries
        </h1>

        {summaries.length === 0 ? (
          <div className="text-center py-12 bg-backgroundDull rounded-lg border border-borderColor_primary">
            <FileText className="w-12 h-12 mx-auto mb-4 text-textColor_secondary" />
            <p className="text-xl text-textColor_secondary">
              No summaries saved yet
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
                      {summary.Title}
                    </h3>
                    <div className="flex items-center space-x-4 text-textColor_secondary text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {summary.createdAt}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {summary.Email}
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
                      {summary.Summary}
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
