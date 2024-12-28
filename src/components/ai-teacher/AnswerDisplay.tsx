import { Card } from "../ui/card";

interface AnswerDisplayProps {
  answer: string;
}

export const AnswerDisplay = ({ answer }: AnswerDisplayProps) => {
  if (!answer) return null;

  return (
    <Card className="p-6 bg-white shadow-md">
      <h3 className="text-lg font-semibold mb-4">Answer:</h3>
      <div className="prose max-w-none">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {answer}
        </p>
      </div>
    </Card>
  );
};