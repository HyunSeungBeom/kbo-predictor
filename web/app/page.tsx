import PredictWidget from "@/components/PredictWidget";
import ProbabilityChart from "@/components/ProbabilityChart";
import StandingsTable from "@/components/StandingsTable";

export default function Home() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <PredictWidget />
      </div>
      <StandingsTable />
      <ProbabilityChart />
    </div>
  );
}
