import { Brain, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsCards({ assessments }) {
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    // Sort to get the most recent one, as the order isn't guaranteed
    const sortedAssessments = [...assessments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedAssessments[0];
  };

  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Average Score Card */}
      <Card className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl shadow-md shadow-black/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-gray-400 text-sm font-medium">
            Average Score
          </CardTitle>
          <Trophy className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-white">
            {getAverageScore()}%
          </div>
          <p className="text-xs text-gray-500">Across all assessments</p>
        </CardContent>
      </Card>

      {/* Questions Practiced Card */}
      <Card className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl shadow-md shadow-black/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-gray-400 text-sm font-medium">
            Questions Practiced
          </CardTitle>
          <Brain className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-white">
            {getTotalQuestions()}
          </div>
          <p className="text-xs text-gray-500">Total questions</p>
        </CardContent>
      </Card>

      {/* Latest Score Card */}
      <Card className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl shadow-md shadow-black/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-gray-400 text-sm font-medium">
            Latest Score
          </CardTitle>
          <Target className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-white">
            {getLatestAssessment()?.quizScore.toFixed(1) || 0}%
          </div>
          <p className="text-xs text-gray-500">Most recent quiz</p>
        </CardContent>
      </Card>
    </div>
  );
}