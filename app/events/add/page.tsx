import { Suspense } from "react";
import AddEventClient from "./AddEventClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <AddEventClient />
    </Suspense>
  );
}