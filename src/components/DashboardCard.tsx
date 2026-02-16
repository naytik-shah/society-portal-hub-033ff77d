import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
}

const DashboardCard = ({ title, description, icon: Icon, to }: Props) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="group flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <h3 className="font-semibold text-lg text-card-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
};

export default DashboardCard;
