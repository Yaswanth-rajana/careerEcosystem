import { redirect } from 'next/navigation';

export default function SavedJobsRedirectPage() {
  redirect('/jobs?tab=saved');
}
