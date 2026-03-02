import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SkeletonTable = () => (
  <div className="rounded-[2rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
    <div className="h-12 bg-slate-50/50 border-b border-slate-100 flex items-center px-6 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-20 bg-slate-200/50 rounded-full" />
      ))}
    </div>
    <div className="p-4 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-2">
          <Skeleton className="h-10 w-full rounded-xl bg-slate-50" />
        </div>
      ))}
    </div>
    <div className="h-14 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between px-6">
      <Skeleton className="h-4 w-32 rounded-full bg-slate-100" />
      <Skeleton className="h-8 w-48 rounded-xl bg-slate-100" />
    </div>
  </div>
);

export default SkeletonTable;
