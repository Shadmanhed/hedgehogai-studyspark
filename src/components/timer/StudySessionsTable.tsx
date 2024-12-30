import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { formatTime } from "@/lib/utils";

interface StudySession {
  id: string;
  created_at: string;
  session_type: string;
  duration: number;
}

interface StudySessionsTableProps {
  sessions: StudySession[];
}

export const StudySessionsTable = ({ sessions }: StudySessionsTableProps) => {
  return (
    <div className="mt-8">
      <h3 className="text-2xl font-heading font-bold mb-4">Study Sessions</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  {format(new Date(session.created_at), "PPp")}
                </TableCell>
                <TableCell className="capitalize">
                  {session.session_type}
                </TableCell>
                <TableCell>{formatTime(session.duration)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};