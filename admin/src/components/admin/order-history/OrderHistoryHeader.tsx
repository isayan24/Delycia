import { Button as StatefulBtn } from "@/components/ui/stateful-button";
import React from "react";

export default function OrderHistoryHeader({ refreshHistory, loading }: any) {
  return (
    <div className="flex items-center justify-between gap-3 w-full">


      <StatefulBtn
        onClick={refreshHistory}
        disabled={loading}
        className="!rounded-lg ml-auto"
      >
        Refresh History
      </StatefulBtn>
    </div>
  );
}
