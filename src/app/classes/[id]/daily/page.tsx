import { ClassFlowService } from '@/lib/supabase/service';
import { ClassDailyView } from '@/components/daily-grid/ClassDailyView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Class Rapid Grid — ClassFlow',
  description: 'Rapid post-dismissal homework logging and coordinator escalation.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DailyClassGridPage({ params }: PageProps) {
  const resolvedParams = await params;
  const classId = resolvedParams.id;

  // Fetch initial data via dual-mode service
  const initialData = await ClassFlowService.getDailyClassData(classId);

  return <ClassDailyView initialData={initialData} classId={classId} />;
}
