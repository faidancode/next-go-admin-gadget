import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CategoryDistribution } from "@/types/dashboard";

interface CategoryDistributionListProps {
    data: CategoryDistribution[];
}

export function CategoryDistributionList({ data }: CategoryDistributionListProps) {
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <Card className="border-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Category Distribution
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-6">
                    {data.map((item, index) => {
                        const percentage = (item.count / maxCount) * 100;
                        return (
                            <div key={item.categoryName} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        {item.categoryName}
                                    </span>
                                    <span className="text-xs font-black text-primary">
                                        {item.count}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${percentage}%`,
                                            transitionDelay: `${index * 100}ms`
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
