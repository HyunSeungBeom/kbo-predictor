import { TodayBoard } from "@/lib/prediction";
import { ProbabilityChart } from "@/lib/simulation";
import { StandingsTable } from "@/lib/standings";

export default function Home() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <TodayBoard />
      </div>
      <StandingsTable />
      <ProbabilityChart />
    </div>
  );
}
