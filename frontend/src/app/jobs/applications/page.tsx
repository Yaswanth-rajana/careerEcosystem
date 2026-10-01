import { redirect } from 'next/navigation';

export default function ApplicationsRedirectPage() {
  redirect('/jobs?tab=applications');
}
