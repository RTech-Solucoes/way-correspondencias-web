"use client";

import {useParams, useRouter} from "next/navigation";
import EmailDetail from "@/components/email/EmailDetail";
import useEmail from "@/context/email/EmailContext";

export default function EmailPage() {
  const params = useParams()
  const router = useRouter()
  const emailId = params.id as string

  const { setSelectedEmail } = useEmail()

  const handleBack = () => {
    setSelectedEmail(null)
    router.push('/email')
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <EmailDetail
        emailId={emailId}
        onBack={handleBack}
      />
    </div>
  );
}